/**
 * Process Wikidata JSON Dump to extract people
 * 
 * Download latest dump from:
 * https://dumps.wikimedia.org/wikidatawiki/entities/
 * 
 * Get: latest-all.json.bz2 (~130 GB compressed, ~1.3 TB uncompressed)
 * 
 * Usage:
 * 1. Download: wget https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2
 * 2. Process: node scripts/processWikidataDump.js path/to/latest-all.json.bz2
 */

import fs from 'fs';
import readline from 'readline';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const MIN_SITELINKS = 80;  // Fame threshold
const MIN_AGE = 25;         // Minimum lifespan
const START_YEAR = -650;    // Thales of Miletus
const END_YEAR = 2024;

// Domain mapping (Wikidata occupation -> our domains)
const OCCUPATION_TO_DOMAIN = {
  'Q901': 'Science',           // scientist
  'Q36180': 'Literature',      // writer
  'Q639669': 'Music',          // musician
  'Q1028181': 'Art',           // painter
  'Q4964182': 'Philosophy',    // philosopher
  'Q82955': 'Politics',        // politician
  'Q170790': 'Math',           // mathematician
  'Q5482740': 'Science',       // inventor
  'Q11063': 'Science',         // astronomer
  'Q205375': 'Medicine',       // physician
  'Q2066131': 'Sports',        // athlete
  'Q33999': 'Art',             // actor
  'Q753110': 'Music',          // composer
  'Q49757': 'Literature',      // poet
  'Q822146': 'Art',            // sculptor
  'Q11063': 'Science',         // chemist
  'Q169470': 'Science',        // physicist
  'Q593644': 'Science',        // chemist
  'Q864380': 'Science',        // biologist
};

const allPeople = [];
let processed = 0;
let kept = 0;
let lastSaveTime = Date.now();
const SAVE_INTERVAL = 5 * 60 * 1000; // Save progress every 5 minutes

/**
 * Extract year from Wikidata date string
 * Format: +1643-01-04T00:00:00Z or -0384-00-00T00:00:00Z
 */
function extractYear(dateString) {
  if (!dateString) return null;
  const match = dateString.match(/^([+-]?\d+)-/);
  if (!match) return null;
  return parseInt(match[1]);
}

/**
 * Get domains from occupations
 */
function getDomains(claims) {
  const occupations = claims.P106 || []; // occupation property
  const domains = new Set();
  
  for (const occupation of occupations) {
    const value = occupation.mainsnak?.datavalue?.value?.id;
    if (value && OCCUPATION_TO_DOMAIN[value]) {
      domains.add(OCCUPATION_TO_DOMAIN[value]);
    }
  }
  
  return domains.size > 0 ? Array.from(domains) : ['Other'];
}

/**
 * Get country code from country of citizenship
 */
function getCountry(claims) {
  const countries = claims.P27 || []; // country of citizenship
  if (countries.length === 0) return '';
  
  const countryQid = countries[0].mainsnak?.datavalue?.value?.id;
  // We could map Q-IDs to country codes, but for now just return empty
  return '';
}

/**
 * Save progress (in case of interruption)
 */
function saveProgress() {
  const outputPath = path.join(__dirname, '../data/people.json');
  const tempPath = outputPath + '.tmp';
  
  // Sort by sitelinks before saving
  const sorted = [...allPeople].sort((a, b) => b.sitelinks - a.sitelinks);
  fs.writeFileSync(tempPath, JSON.stringify(sorted, null, 2), 'utf-8');
  fs.renameSync(tempPath, outputPath);
  
  console.log(`  💾 Progress saved: ${kept} people`);
}

/**
 * Process a single entity line
 */
function processEntity(line) {
  processed++;
  
  // Progress reporting
  if (processed % 100000 === 0) {
    const rate = (processed / ((Date.now() - startTime) / 1000)).toFixed(0);
    const eta = ((108000000 - processed) / rate / 60).toFixed(0); // ~108M entities total
    console.log(`Processed: ${(processed / 1000000).toFixed(1)}M entities, Kept: ${kept} people (${rate}/s, ETA: ${eta}min)`);
    
    // Auto-save progress every 5 minutes
    if (Date.now() - lastSaveTime > SAVE_INTERVAL) {
      saveProgress();
      lastSaveTime = Date.now();
    }
  }
  
  // Skip array start/end
  if (line.trim() === '[' || line.trim() === ']') return;
  
  // Remove trailing comma
  const jsonStr = line.trim().replace(/,$/, '');
  if (!jsonStr) return;
  
  try {
    const entity = JSON.parse(jsonStr);
    
    // Must be human (Q5)
    const claims = entity.claims || {};
    const instanceOf = claims.P31 || [];
    const isHuman = instanceOf.some(claim => 
      claim.mainsnak?.datavalue?.value?.id === 'Q5'
    );
    
    if (!isHuman) return;
    
    // Must have birth and death dates
    const birthClaims = claims.P569 || [];
    const deathClaims = claims.P570 || [];
    
    if (birthClaims.length === 0 || deathClaims.length === 0) return;
    
    const birthDate = birthClaims[0].mainsnak?.datavalue?.value?.time;
    const deathDate = deathClaims[0].mainsnak?.datavalue?.value?.time;
    
    const born = extractYear(birthDate);
    const died = extractYear(deathDate);
    
    if (!born || !died) return;
    if (died - born < MIN_AGE) return; // Too short life
    if (born < START_YEAR || born > END_YEAR) return; // Out of time range
    
    // Must have enough sitelinks (fame)
    const sitelinks = Object.keys(entity.sitelinks || {}).length;
    if (sitelinks < MIN_SITELINKS) return;
    
    // Extract data
    const name = entity.labels?.de?.value || entity.labels?.en?.value || entity.id;
    const qid = entity.id;
    const domains = getDomains(claims);
    const region = getCountry(claims);
    
    // Store person
    allPeople.push({
      name,
      born,
      died,
      domains,
      region,
      qid,
      sitelinks
    });
    
    kept++;
    
  } catch (error) {
    // Silently skip malformed JSON
  }
}

let startTime; // Global for ETA calculation

/**
 * Main processing function
 */
async function processDump(dumpPath) {
  console.log('🌍 Wikidata Dump Processor');
  console.log(`📁 Reading: ${dumpPath}`);
  console.log(`🎯 Filter: ${MIN_SITELINKS}+ sitelinks, ${START_YEAR}-${END_YEAR}`);
  console.log(`⏱️  Estimated time: 30-60 minutes`);
  console.log(`💾 Auto-save every 5 minutes (in case of crash)`);
  console.log(`\n📊 Expected: ~1500-2000 people\n`);
  
  startTime = Date.now();
  
  // Decompress on-the-fly if .bz2
  let inputStream;
  if (dumpPath.endsWith('.bz2')) {
    console.log('📦 Decompressing bz2...\n');
    const bz2 = spawn('bzip2', ['-dc', dumpPath]);
    inputStream = bz2.stdout;
  } else {
    inputStream = fs.createReadStream(dumpPath);
  }
  
  // Create line-by-line reader
  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity
  });
  
  // Process each line
  for await (const line of rl) {
    processEntity(line);
  }
  
  // Final save
  console.log('\n💾 Saving final results...');
  saveProgress();
  
  // Also copy to public folder
  const publicPath = path.join(__dirname, '../public/people.json');
  fs.copyFileSync(
    path.join(__dirname, '../data/people.json'),
    publicPath
  );
  console.log(`💾 Copied to: ${publicPath}`);
  
  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  const outputPath = path.join(__dirname, '../data/people.json');
  
  console.log('\n\n✅ DONE!');
  console.log(`⏱️  Time: ${elapsed} minutes`);
  console.log(`📊 Processed: ${(processed / 1000000).toFixed(1)}M entities`);
  console.log(`✨ Extracted: ${kept} people (${((kept/processed)*100).toFixed(4)}%)`);
  console.log(`💾 Saved to: ${outputPath}`);
  
  // Show some stats
  const earliest = Math.min(...allPeople.map(p => p.born));
  const latest = Math.max(...allPeople.map(p => p.died));
  console.log(`\n📅 Time range: ${earliest} - ${latest}`);
  console.log(`🎯 Top person: ${allPeople[0].name} (${allPeople[0].sitelinks} sitelinks)`);
  
  // Domain breakdown
  const domainCounts = {};
  allPeople.forEach(p => {
    p.domains.forEach(d => {
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    });
  });
  console.log('\n📊 Domains:');
  Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count}`);
    });
}

// Run
const dumpPath = process.argv[2];

if (!dumpPath) {
  console.error('Usage: node processWikidataDump.js <path-to-dump.json.bz2>');
  console.error('\nDownload from:');
  console.error('https://dumps.wikimedia.org/wikidatawiki/entities/');
  console.error('\nExample:');
  console.error('wget https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2');
  console.error('node scripts/processWikidataDump.js latest-all.json.bz2');
  process.exit(1);
}

if (!fs.existsSync(dumpPath)) {
  console.error(`❌ File not found: ${dumpPath}`);
  process.exit(1);
}

processDump(dumpPath).catch(console.error);


/**
 * Wikidata Fetcher for Zeitkette
 * 
 * Lädt historische Personen von Wikidata via SPARQL
 * Usage: node scripts/fetchFromWikidata.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
const OUTPUT_FILE = path.join(__dirname, '../data/people.json');
const RELATIONS_FILE = path.join(__dirname, '../data/relations.json');

// Rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Führt SPARQL Query auf Wikidata aus
 */
async function queryWikidata(sparql) {
  const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(sparql)}&format=json`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'ZeitketteBot/1.0 (https://github.com/zeitkette/app; contact@zeitkette.app) Educational Project'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Wikidata query failed:', error);
    throw error;
  }
}

/**
 * Mapping: Wikidata Occupation → Zeitkette Domain
 */
const OCCUPATION_MAPPING = {
  'Q901': 'Science',           // Wissenschaftler
  'Q36180': 'Literature',      // Schriftsteller
  'Q639669': 'Music',          // Musiker
  'Q1028181': 'Art',           // Maler
  'Q4964182': 'Philosophy',    // Philosoph
  'Q82955': 'Politics',        // Politiker
  'Q170790': 'Math',           // Mathematiker
  'Q5482740': 'Science',       // Erfinder
  'Q11063': 'Science',         // Astronom
  'Q170790': 'Math',           // Mathematiker
  'Q205375': 'Medicine',       // Mediziner
};

/**
 * Query: Top historische Personen (vereinfacht für bessere Performance)
 */
const PEOPLE_QUERY = `
SELECT ?person ?personLabel ?born ?died ?sitelinks
WHERE {
  ?person wdt:P31 wd:Q5;              # ist ein Mensch
          wdt:P569 ?bornDate;         # hat Geburtsdatum
          wdt:P570 ?diedDate.         # hat Sterbedatum
  
  # Sitelinks (Wikipedia-Artikel) für Popularität
  ?person wikibase:sitelinks ?sitelinks.
  
  BIND(YEAR(?bornDate) as ?born)
  BIND(YEAR(?diedDate) as ?died)
  
  # Filter: 3000 v. Chr. - 2020, mindestens 25 Jahre alt
  FILTER(?born >= -3000 && ?born <= 2020)
  FILTER(?died >= -2975 && ?died <= 2024)
  FILTER(?died - ?born >= 25)
  
  # Nur extrem relevante Personen (mindestens 100 Wikipedia-Artikel)
  FILTER(?sitelinks >= 100)
  
  SERVICE wikibase:label { 
    bd:serviceParam wikibase:language "de,en". 
  }
}
ORDER BY DESC(?sitelinks)
LIMIT 20
`;

/**
 * Query: Beziehungen (vereinfacht - nur influenced by)
 */
const RELATIONS_QUERY = `
SELECT ?person1 ?person1Label ?person2 ?person2Label
WHERE {
  ?person1 wdt:P737 ?person2.          # influenced by
  ?person1 wdt:P31 wd:Q5.              # person1 ist Mensch
  ?person2 wdt:P31 wd:Q5.              # person2 ist Mensch
  
  # Nur Personen die wir schon haben (Q-IDs aus unserer Liste)
  # Das macht die Query viel schneller!
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
}
LIMIT 500
`;

/**
 * Transformiert Wikidata Results → Zeitkette Format
 */
function transformPeople(results) {
  const peopleMap = new Map();
  
  for (const binding of results.bindings) {
    const qid = binding.person.value.split('/').pop();
    const name = binding.personLabel?.value || `Person ${qid}`;
    const born = parseInt(binding.born.value);
    const died = parseInt(binding.died.value);
    const sitelinks = binding.sitelinks ? parseInt(binding.sitelinks.value) : 20;
    
    // Simplified - no domain detection for now
    let domain = 'Other';
    const country = '';
    const image = '';
    const description = name;
    const wikipedia = '';
    
    if (!peopleMap.has(qid)) {
      peopleMap.set(qid, {
        name,
        born,
        died,
        domains: [domain],
        region: country.substring(0, 20), // Kürzen
        qid,
        image,
        description,      // NEU: Mini-Bio!
        wikipedia,        // NEU: Link zur vollständigen Bio
        sitelinks         // NEU: Relevanz-Score
      });
    } else {
      // Füge weiteren Domain hinzu
      const existing = peopleMap.get(qid);
      if (!existing.domains.includes(domain)) {
        existing.domains.push(domain);
      }
    }
  }
  
  return Array.from(peopleMap.values());
}

/**
 * Transformiert Beziehungen → Graph Format
 */
function transformRelations(results) {
  const relations = {};
  
  for (const binding of results.bindings) {
    const qid1 = binding.person1.value.split('/').pop();
    const name1 = binding.person1Label?.value || `Person ${qid1}`;
    const qid2 = binding.person2.value.split('/').pop();
    const name2 = binding.person2Label?.value || `Person ${qid2}`;
    
    if (!relations[qid1]) {
      relations[qid1] = { name: name1, knew: [] };
    }
    
    relations[qid1].knew.push({
      qid: qid2,
      name: name2,
      type: "influenced by",
      source: 'wikidata',
      confidence: 1.0
    });
  }
  
  return relations;
}

/**
 * Lädt Personen in ZEIT-basierten Batches (viel schneller als OFFSET!)
 * Grund: OFFSET ist extrem langsam in SPARQL, aber Jahr-Filter sind schnell
 */
async function loadPeopleByTimePeriods() {
  const allPeople = [];
  
  // Zeit-Perioden: RÜCKWÄRTS (von heute → Vergangenheit)
  // Kleinere Zeiträume (50 Jahre) für bessere Performance
  const timePeriods = [];
  
  // Von 2025 rückwärts bis 1000 (erstmal ohne Antike)
  for (let year = 2025; year >= 1000; year -= 50) {
    const start = year - 50;
    const end = year;
    timePeriods.push({
      start,
      end,
      label: `${start}-${end}`
    });
  }
  
  console.log(`📊 Total batches: ${timePeriods.length} (50-year periods from 2025 → 1000)`);
  console.log(`⏱  Estimated time: ${Math.ceil(timePeriods.length * 10 / 60)} minutes\n`);
  
  for (let i = 0; i < timePeriods.length; i++) {
    const period = timePeriods[i];
    const progress = ((i / timePeriods.length) * 100).toFixed(1);
    console.log(`\n[${progress}%] 📥 Batch ${i+1}/${timePeriods.length}: ${period.label}...`);
    
    // Query für diese Zeit-Periode (ohne OFFSET!)
    const query = PEOPLE_QUERY
      .replace('FILTER(?born >= 1400 && ?born <= 2020)', 
               `FILTER(?born >= ${period.start} && ?born <= ${period.end})`)
      .replace('LIMIT 300', 'LIMIT 20'); // Pro 50 Jahre max 20 (ultra konservativ)
    
    let retries = 3;
    let success = false;
    
    while (retries > 0 && !success) {
      try {
        const data = await queryWikidata(query);
        const batchPeople = transformPeople(data.results);
        console.log(`   ✓ ${period.label}: ${batchPeople.length} people`);
        
        allPeople.push(...batchPeople);
        success = true;
        
        // Rate limiting: 8 Sekunden zwischen erfolgreichen Batches
        if (i < timePeriods.length - 1) {
          console.log(`   ⏸  Waiting 8s before next period...`);
          await delay(8000);
        }
      } catch (error) {
        retries--;
        console.error(`   ✗ ${period.label} failed (${3-retries}/3):`, error.message);
        
        if (error.message.includes('429')) {
          console.log('   ⚠️  Rate limit hit! Waiting 60s...');
          await delay(60000);
        } else if (error.message.includes('504')) {
          console.log('   ⚠️  Timeout! Waiting 15s before retry...');
          await delay(15000);
        } else {
          console.log('   ⏸  Waiting 10s before retry...');
          await delay(10000);
        }
        
        if (retries === 0) {
          console.log(`   ⛔ Skipping ${period.label} after 3 failed attempts`);
        }
      }
    }
  }
  
  console.log(`\n📊 Total loaded: ${allPeople.length} people`);
  return allPeople;
}

/**
 * Main
 */
async function main() {
  console.log('🌐 Fetching data from Wikidata...\n');
  
  // 1. Personen laden (Zeit-basierte Batches - viel schneller!)
  console.log('📥 Loading people by time periods...');
  const people = await loadPeopleByTimePeriods();
  console.log(`✅ Loaded ${people.length} people total\n`);
  
  // 2. Beziehungen laden (vereinfacht)
  console.log('📥 Loading relations...');
  await delay(2000); // Rate limiting
  const relationsData = await queryWikidata(RELATIONS_QUERY);
  const relations = transformRelations(relationsData.results);
  console.log(`✅ Loaded ${Object.keys(relations).length} relation groups\n`);
  
  // 3. Daten speichern
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(people, null, 2), 'utf-8');
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
  
  fs.writeFileSync(RELATIONS_FILE, JSON.stringify(relations, null, 2), 'utf-8');
  console.log(`💾 Saved to: ${RELATIONS_FILE}`);
  
  // 4. Statistiken
  console.log('\n📊 Statistics:');
  console.log(`   People: ${people.length}`);
  console.log(`   Relations: ${Object.values(relations).reduce((sum, r) => sum + r.knew.length, 0)}`);
  console.log(`   Time span: ${Math.min(...people.map(p => p.born))} - ${Math.max(...people.map(p => p.died || 2024))}`);
  
  const domains = {};
  people.forEach(p => {
    p.domains.forEach(d => {
      domains[d] = (domains[d] || 0) + 1;
    });
  });
  console.log('\n   Domains:');
  Object.entries(domains).sort((a, b) => b[1] - a[1]).forEach(([d, count]) => {
    console.log(`     ${d}: ${count}`);
  });
  
  console.log('\n✅ Done!');
}

main().catch(console.error);


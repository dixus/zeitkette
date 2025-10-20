/**
 * Fetch people from Wikidata iteratively by decade
 * 
 * This script queries Wikidata's SPARQL endpoint in small chunks (by decade)
 * to avoid timeouts and rate limits. It's designed to massively expand the
 * person database with important historical figures.
 * 
 * Usage:
 *   node scripts/fetchWikidataByDecade.cjs --start-year 1800 --end-year 1900 --min-sitelinks 50
 *   node scripts/fetchWikidataByDecade.cjs --century 19 --min-sitelinks 50
 *   node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60
 */

const fs = require('fs');

// Configuration from command line
const args = process.argv.slice(2);
const config = parseArgs(args);

// Domain mapping (Wikidata occupation QID -> our domains)
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
  'Q169470': 'Science',        // physicist
  'Q593644': 'Science',        // chemist
  'Q864380': 'Science',        // biologist
  'Q350979': 'Religion',       // theologian
  'Q1234713': 'Religion',      // religious leader
  'Q81096': 'Art',             // architect
  'Q1930187': 'Business',      // entrepreneur
  'Q333634': 'Literature',     // translator
  'Q1622272': 'Science',       // historian
  'Q4964182': 'Philosophy',    // philosopher
  'Q2374149': 'Science',       // botanist
  'Q520549': 'Science',        // geologist
};

// Country QID to region code mapping (expanded)
const COUNTRY_TO_REGION = {
  Q30: 'US', Q145: 'UK', Q142: 'FR', Q38: 'IT', Q183: 'DE', Q29: 'ES', Q31: 'BE', Q55: 'NL', 
  Q39: 'CH', Q36: 'PL', Q28: 'HU', Q15180: 'CZ', Q40: 'AT', Q27: 'IE', Q45: 'PT', Q159: 'RU',
  Q148: 'CN', Q17: 'JP', Q16: 'CA', Q408: 'AU', Q252: 'ID', Q801: 'IL', Q794: 'IR', Q43: 'TR',
  Q79: 'EG', Q258: 'ZA', Q20: 'NO', Q34: 'SE', Q35: 'DK', Q33: 'FI', Q668: 'IN', Q843: 'PK',
  Q902: 'BD', Q155: 'BR', Q96: 'MX', Q298: 'CL', Q1555: 'PE', Q77: 'UY', Q414: 'AR', Q774: 'GT',
  Q41: 'GR', Q29: 'ES', Q233: 'MT', Q224: 'HR', Q403: 'RS', Q211: 'LV', Q37: 'LT', Q191: 'EE',
  Q218: 'RO', Q219: 'BG', Q212: 'UA', Q184: 'BY', Q227: 'AZ', Q230: 'GE', Q399: 'AM', Q265: 'UZ',
  Q232: 'KZ', Q863: 'TJ', Q813: 'KG', Q874: 'TM', Q889: 'AF', Q796: 'IQ', Q858: 'SY', Q822: 'LB',
  Q810: 'JO', Q851: 'SA', Q805: 'YE', Q842: 'OM', Q846: 'QA', Q878: 'AE', Q817: 'KW', Q398: 'BH',
  Q1049: 'SD', Q1025: 'MA', Q948: 'TN', Q262: 'DZ', Q1028: 'LY', Q1033: 'NG', Q1032: 'NE',
  Q1037: 'SN', Q1041: 'KE', Q1036: 'ET', Q1044: 'SL', Q1039: 'CD', Q1019: 'MG', Q1029: 'MZ',
  Q1014: 'BW', Q1030: 'NA', Q1027: 'MU', Q1042: 'GH', Q1005: 'GM', Q1006: 'GN', Q1007: 'GW',
  Q1008: 'CI', Q1009: 'CM', Q1011: 'CV', Q1013: 'ML', Q1020: 'MR', Q1025: 'MA', Q1246: 'XK',
  Q884: 'KR', Q865: 'TW', Q334: 'SG', Q833: 'MY', Q928: 'PH', Q869: 'TH', Q881: 'VN', Q819: 'LA',
  Q424: 'KH', Q836: 'MM', Q711: 'MN', Q423: 'KP', Q917: 'BT', Q854: 'LK', Q424: 'KH', Q229: 'CY'
};

function parseArgs(args) {
  const config = {
    startYear: null,
    endYear: null,
    minSitelinks: 60,
    decadeSize: 10,
    delayMs: 2000,  // Increased default delay to avoid rate limiting
    maxRetries: 3,
    maxResults: 1000,  // Max results per decade
    dryRun: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--start-year':
        config.startYear = parseInt(args[++i]);
        break;
      case '--end-year':
        config.endYear = parseInt(args[++i]);
        break;
      case '--century':
        const century = parseInt(args[++i]);
        config.startYear = (century - 1) * 100 + 1;
        config.endYear = century * 100;
        break;
      case '--min-sitelinks':
        config.minSitelinks = parseInt(args[++i]);
        break;
      case '--decade-size':
        config.decadeSize = parseInt(args[++i]);
        break;
      case '--delay':
        config.delayMs = parseInt(args[++i]);
        break;
      case '--max-results':
        config.maxResults = parseInt(args[++i]);
        break;
      case '--all':
        config.startYear = -3000;  // Start from ancient times with adaptive thresholds
        config.endYear = 2024;
        break;
      case '--all-ce-only':
        config.startYear = 1;  // From year 1 CE only
        config.endYear = 2024;
        break;
      case '--dry-run':
        config.dryRun = true;
        break;
      case '--verbose':
        config.verbose = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  if (config.startYear === null || config.endYear === null) {
    console.error('❌ Error: Must specify --start-year and --end-year, or --century, or --all');
    printHelp();
    process.exit(1);
  }

  return config;
}

function printHelp() {
  console.log(`
Fetch people from Wikidata by decade to avoid timeouts

Usage:
  node scripts/fetchWikidataByDecade.cjs [options]

Options:
  --start-year YEAR      Start year (e.g., 1800)
  --end-year YEAR        End year (e.g., 1900)
  --century NUM          Shorthand for a century (e.g., 19 = 1801-1900)
  --all                  Process all years (-3000 BCE to 2024 CE) with adaptive thresholds - RECOMMENDED
  --all-ce-only          Process only CE years (1 to 2024) - skip ancient period
  --min-sitelinks NUM    Minimum Wikipedia articles (default: 60)
  --decade-size NUM      Years per query chunk (default: 10)
  --delay MS             Delay between queries in ms (default: 2000)
  --max-results NUM      Max results per decade (default: 1000)
  --dry-run              Show what would be fetched without saving
  --verbose              Show detailed progress
  --help                 Show this help

Examples:
  # Fetch 19th century with high threshold
  node scripts/fetchWikidataByDecade.cjs --century 19 --min-sitelinks 80

  # Fetch specific range
  node scripts/fetchWikidataByDecade.cjs --start-year 1500 --end-year 1600 --min-sitelinks 50

  # Fetch everything (will take a while!)
  node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60
  `);
}

async function sparqlQuery(query) {
  const url = 'https://query.wikidata.org/sparql';
  
  // Use POST instead of GET to avoid caching and support longer queries
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/sparql-results+json',
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'zeitkette-decade-fetch/1.0 (educational project)',
      'cache-control': 'no-cache'  // Ensure fresh results
    },
    body: 'query=' + encodeURIComponent(query)
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`SPARQL HTTP error ${res.status}: ${res.statusText} - ${errorText.substring(0, 200)}`);
  }
  
  return res.json();
}

async function sparqlWithRetry(query, retries = 3, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await sparqlQuery(query);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`  ⚠️  Retry ${i + 1}/${retries} after error: ${error.message}`);
      await sleep(delayMs * (i + 1)); // Exponential backoff
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractYear(dateString) {
  if (!dateString) return null;
  const match = dateString.match(/([+-]?\d+)-/);
  if (!match) return null;
  return parseInt(match[1]);
}

function getDomains(occupationQids) {
  const domains = new Set();
  for (const qid of occupationQids) {
    if (OCCUPATION_TO_DOMAIN[qid]) {
      domains.add(OCCUPATION_TO_DOMAIN[qid]);
    }
  }
  return domains.size > 0 ? Array.from(domains) : ['Other'];
}

function getRegion(countryQid) {
  if (!countryQid) return null;
  const qid = countryQid.replace('http://www.wikidata.org/entity/', '');
  return COUNTRY_TO_REGION[qid] || null;
}

/**
 * Get adaptive sitelink threshold based on time period
 * Ancient figures are much rarer, so lower threshold is appropriate
 */
function getAdaptiveSitelinkThreshold(year, baseSitelinks) {
  // Don't go below base threshold if user specified a high one
  if (baseSitelinks >= 80) return baseSitelinks;
  
  // Adaptive thresholds by period
  // Very lenient for ancient periods, gradually increasing to modern
  if (year < -500) return Math.max(8, Math.floor(baseSitelinks * 0.12));  // Very ancient: 12% of base (~7)
  if (year < 0) return Math.max(10, Math.floor(baseSitelinks * 0.18));    // Ancient BCE: 18% of base (~11)
  if (year < 500) return Math.max(12, Math.floor(baseSitelinks * 0.20));  // Late Antique: 20% of base (~12)
  if (year < 1000) return Math.max(15, Math.floor(baseSitelinks * 0.25)); // Early Medieval: 25% of base (~15)
  if (year < 1500) return Math.max(25, Math.floor(baseSitelinks * 0.40)); // Medieval: 40% of base (~24)
  if (year < 1700) return Math.max(35, Math.floor(baseSitelinks * 0.60)); // Renaissance: 60% of base (~36)
  if (year < 1800) return Math.max(45, Math.floor(baseSitelinks * 0.70)); // Enlightenment: 70% of base (~42)
  if (year < 1900) return Math.max(50, Math.floor(baseSitelinks * 0.80)); // Modern: 80% of base (~48)
  if (year < 2000) return Math.max(55, Math.floor(baseSitelinks * 0.90)); // 20th century: 90% of base (~54)
  return baseSitelinks; // 21st century: full threshold
}

async function fetchDecade(startYear, endYear, minSitelinks) {
  // Build optimized SPARQL query for this decade
  // Key optimizations:
  // 1. Use date ranges instead of YEAR() function (CE dates)
  // 2. Use hint:rangeSafe for better date filtering
  // 3. Delay label service with subquery
  // 4. Filter by sitelinks early
  // 5. ADAPTIVE sitelink threshold based on time period
  
  // Use adaptive sitelink threshold based on the period
  const adaptiveSitelinks = getAdaptiveSitelinkThreshold(startYear, minSitelinks);
  
  if (config.verbose) {
    console.log(`  Adaptive threshold for ${startYear}: ${adaptiveSitelinks} (base: ${minSitelinks})`);
  }
  
  // Format dates for Wikidata (BCE dates need special formatting)
  // Wikidata format: +YYYY-MM-DD or -YYYY-MM-DD (4-digit year, zero-padded)
  const formatYear = (year) => {
    if (year < 0) {
      // BCE: -0500 for year 500 BCE
      return '-' + String(Math.abs(year)).padStart(4, '0');
    } else {
      // CE: +1500 for year 1500 CE (or just 1500, but + is clearer)
      return '+' + String(year).padStart(4, '0');
    }
  };
  
  const startDate = `"${formatYear(startYear)}-01-01T00:00:00Z"^^xsd:dateTime`;
  const endDate = `"${formatYear(endYear + 1)}-01-01T00:00:00Z"^^xsd:dateTime`;
  
  // For BCE dates, we need to use a different approach
  // Wikidata stores them as negative years, but range comparisons can be tricky
  const useYearFilter = startYear < 0;
  
  const query = useYearFilter ? `
SELECT ?person ?personLabel ?birth ?death ?sitelinks ?country ?occupation 
WITH {
  SELECT ?person ?birth ?death ?sitelinks ?country ?occupation WHERE {
    # Start with humans
    ?person wdt:P31 wd:Q5;
            wdt:P569 ?birth;
            wdt:P570 ?death.
    
    # For BCE, use YEAR() function (slower but more reliable)
    FILTER(YEAR(?birth) >= ${startYear} && YEAR(?birth) <= ${endYear})
    
    # Sitelinks filter (fame threshold - adaptive for ancient periods)
    ?person wikibase:sitelinks ?sitelinks.
    FILTER(?sitelinks >= ${adaptiveSitelinks})
    
    # Optional fields
    OPTIONAL { ?person wdt:P27 ?country. }
    OPTIONAL { ?person wdt:P106 ?occupation. }
  }
  LIMIT ${config.maxResults}
} AS %results
WHERE {
  INCLUDE %results.
  # Label service runs last, only on filtered results
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de". }
}
  `.trim() : `
SELECT ?person ?personLabel ?birth ?death ?sitelinks ?country ?occupation 
WITH {
  SELECT ?person ?birth ?death ?sitelinks ?country ?occupation WHERE {
    # Start with most restrictive: humans born in date range
    ?person wdt:P31 wd:Q5;
            wdt:P569 ?birth. hint:Prior hint:rangeSafe true.
    
    # Use date range instead of YEAR() - much faster (CE dates only)
    FILTER(${startDate} <= ?birth && ?birth < ${endDate})
    
    # Has death date
    ?person wdt:P570 ?death.
    
    # Sitelinks filter (fame threshold - adaptive for ancient periods)
    ?person wikibase:sitelinks ?sitelinks.
    FILTER(?sitelinks >= ${adaptiveSitelinks})
    
    # Optional fields
    OPTIONAL { ?person wdt:P27 ?country. }
    OPTIONAL { ?person wdt:P106 ?occupation. }
  }
  LIMIT ${config.maxResults}
} AS %results
WHERE {
  INCLUDE %results.
  # Label service runs last, only on filtered results
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de". }
}
  `.trim();

  const data = await sparqlWithRetry(query, config.maxRetries, config.delayMs);
  const rows = data.results.bindings;

  // Group by person (since occupation can create multiple rows)
  const peopleMap = new Map();
  
  for (const row of rows) {
    const qid = row.person.value.replace('http://www.wikidata.org/entity/', '');
    
    if (!peopleMap.has(qid)) {
      peopleMap.set(qid, {
        qid,
        name: row.personLabel?.value || qid,
        born: extractYear(row.birth?.value),
        died: extractYear(row.death?.value),
        sitelinks: row.sitelinks ? parseInt(row.sitelinks.value) : 0,
        countryQid: row.country?.value,
        occupationQids: []
      });
    }
    
    const person = peopleMap.get(qid);
    if (row.occupation?.value) {
      const occQid = row.occupation.value.replace('http://www.wikidata.org/entity/', '');
      if (!person.occupationQids.includes(occQid)) {
        person.occupationQids.push(occQid);
      }
    }
  }

  // Convert to our format
  const people = [];
  for (const [, p] of peopleMap) {
    // Validate
    if (!p.born || !p.died) continue;
    if (p.died - p.born < 15) continue; // Minimum lifespan
    if (p.died - p.born > 120) continue; // Maximum reasonable lifespan
    
    const region = getRegion(p.countryQid);
    if (!region) continue; // Require region
    
    const domains = getDomains(p.occupationQids);
    
    people.push({
      name: p.name,
      born: p.born,
      died: p.died,
      domains,
      region,
      qid: p.qid,
      sitelinks: p.sitelinks
    });
  }

  return people;
}

function loadPeople() {
  const path = './public/people.json';
  if (!fs.existsSync(path)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function savePeople(people) {
  const path = './public/people.json';
  const sorted = [...people].sort((a, b) => b.sitelinks - a.sitelinks);
  fs.writeFileSync(path, JSON.stringify(sorted, null, 2), 'utf8');
}

function saveProgress(stats) {
  const path = './scripts/fetch_progress.json';
  fs.writeFileSync(path, JSON.stringify(stats, null, 2), 'utf8');
}

async function main() {
  console.log('🌍 Wikidata Decade Fetcher');
  console.log('━'.repeat(60));
  console.log(`📅 Years: ${config.startYear} to ${config.endYear}`);
  console.log(`🎯 Min sitelinks: ${config.minSitelinks} (adaptive by period)`);
  console.log(`📦 Chunk size: ${config.decadeSize} years`);
  console.log(`⏱️  Delay: ${config.delayMs}ms between queries`);
  console.log(`🔍 Dry run: ${config.dryRun ? 'YES' : 'NO'}`);
  console.log('━'.repeat(60));
  console.log();
  console.log('💡 Using adaptive sitelink thresholds:');
  console.log('   Very Ancient (< -500 BCE): ~12% of base');
  console.log('   Ancient (-500 to 0 BCE): ~18% of base');
  console.log('   Late Antique (1-500 CE): ~20% of base');
  console.log('   Early Medieval (500-1000): ~25% of base');
  console.log('   Medieval (1000-1500): ~40% of base');
  console.log('   Renaissance (1500-1700): ~60% of base');
  console.log('   Enlightenment (1700-1800): ~70% of base');
  console.log('   Modern (1800-1900): ~80% of base');
  console.log('   20th century (1900-2000): ~90% of base');
  console.log('   21st century (2000+): 100% of base');
  console.log();

  const existingPeople = loadPeople();
  const existingQids = new Set(existingPeople.map(p => p.qid));
  console.log(`📊 Current database: ${existingPeople.length} people`);
  console.log();

  const stats = {
    startTime: new Date().toISOString(),
    config,
    decades: [],
    totalFetched: 0,
    totalNew: 0,
    totalSkipped: 0,
    errors: []
  };

  const newPeople = [];
  let decadeCount = 0;
  
  // Process in chunks
  for (let year = config.startYear; year <= config.endYear; year += config.decadeSize) {
    const endYear = Math.min(year + config.decadeSize - 1, config.endYear);
    decadeCount++;
    
    const decadeLabel = year < 0 
      ? `${Math.abs(year)} BCE - ${Math.abs(endYear)} BCE`
      : `${year} - ${endYear}`;
    
    process.stdout.write(`📅 ${decadeLabel.padEnd(25)} ... `);
    
    try {
      const people = await fetchDecade(year, endYear, config.minSitelinks);
      const newInDecade = people.filter(p => !existingQids.has(p.qid));
      
      stats.totalFetched += people.length;
      stats.totalNew += newInDecade.length;
      stats.totalSkipped += people.length - newInDecade.length;
      
      newPeople.push(...newInDecade);
      
      // Add to existing set to avoid duplicates in later decades
      newInDecade.forEach(p => existingQids.add(p.qid));
      
      const statusIcon = newInDecade.length > 0 ? '✨' : '  ';
      console.log(`${statusIcon} ${people.length} found, ${newInDecade.length} new`);
      
      stats.decades.push({
        startYear: year,
        endYear,
        fetched: people.length,
        new: newInDecade.length
      });
      
      // Save progress periodically
      if (decadeCount % 10 === 0) {
        saveProgress(stats);
      }
      
      // Rate limiting
      await sleep(config.delayMs);
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      stats.errors.push({
        decade: decadeLabel,
        error: error.message
      });
    }
  }

  console.log();
  console.log('━'.repeat(60));
  console.log('📊 Summary');
  console.log('━'.repeat(60));
  console.log(`✨ New people found: ${stats.totalNew}`);
  console.log(`📦 Total fetched: ${stats.totalFetched}`);
  console.log(`⏭️  Already in database: ${stats.totalSkipped}`);
  console.log(`❌ Errors: ${stats.errors.length}`);
  console.log();

  if (stats.totalNew > 0 && !config.dryRun) {
    const updatedPeople = [...existingPeople, ...newPeople];
    savePeople(updatedPeople);
    console.log(`💾 Saved ${updatedPeople.length} people to public/people.json`);
    console.log(`   (${existingPeople.length} existing + ${newPeople.length} new)`);
  } else if (config.dryRun) {
    console.log('🔍 Dry run - no changes saved');
    console.log(`   Would add ${stats.totalNew} new people`);
  } else {
    console.log('ℹ️  No new people to add');
  }

  stats.endTime = new Date().toISOString();
  saveProgress(stats);
  console.log(`📄 Progress saved to scripts/fetch_progress.json`);
  console.log();

  // Show top new additions
  if (newPeople.length > 0) {
    console.log('🌟 Top 10 new additions by sitelinks:');
    const top10 = [...newPeople]
      .sort((a, b) => b.sitelinks - a.sitelinks)
      .slice(0, 10);
    
    for (const p of top10) {
      console.log(`   ${p.name.padEnd(30)} (${p.born}-${p.died}) - ${p.sitelinks} sitelinks`);
    }
  }

  console.log();
  console.log('✅ Done!');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});


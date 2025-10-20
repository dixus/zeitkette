/**
 * Fetch ancient period people using MediaWiki API search
 * 
 * This uses a different approach than the decade fetcher because
 * SPARQL YEAR() function times out on BCE dates.
 * 
 * Instead, we use WikibaseCirrusSearch to find people by birth century.
 * 
 * Usage:
 *   node scripts/fetchAncientPeriod.cjs --start-century -30 --end-century 5 --min-sitelinks 10
 */

const fs = require('fs');

const args = process.argv.slice(2);
const config = {
  startCentury: -30,
  endCentury: 5,
  minSitelinks: 10,
  dryRun: false
};

// Parse args
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--start-century':
      config.startCentury = parseInt(args[++i]);
      break;
    case '--end-century':
      config.endCentury = parseInt(args[++i]);
      break;
    case '--min-sitelinks':
      config.minSitelinks = parseInt(args[++i]);
      break;
    case '--dry-run':
      config.dryRun = true;
      break;
  }
}

// Country mapping (same as main script)
const COUNTRY_TO_REGION = {
  Q30: 'US', Q145: 'UK', Q142: 'FR', Q38: 'IT', Q183: 'DE', Q29: 'ES', Q31: 'BE', Q55: 'NL', 
  Q39: 'CH', Q36: 'PL', Q28: 'HU', Q15180: 'CZ', Q40: 'AT', Q27: 'IE', Q45: 'PT', Q159: 'RU',
  Q148: 'CN', Q17: 'JP', Q16: 'CA', Q408: 'AU', Q252: 'ID', Q801: 'IL', Q794: 'IR', Q43: 'TR',
  Q79: 'EG', Q258: 'ZA', Q20: 'NO', Q34: 'SE', Q35: 'DK', Q33: 'FI', Q668: 'IN', Q843: 'PK',
  Q902: 'BD', Q155: 'BR', Q96: 'MX', Q298: 'CL', Q1555: 'PE', Q77: 'UY', Q414: 'AR', Q774: 'GT',
  Q41: 'GR', Q233: 'MT', Q224: 'HR', Q403: 'RS', Q211: 'LV', Q37: 'LT', Q191: 'EE',
  Q218: 'RO', Q219: 'BG', Q212: 'UA', Q184: 'BY', Q227: 'AZ', Q230: 'GE', Q399: 'AM'
};

const OCCUPATION_TO_DOMAIN = {
  'Q901': 'Science', 'Q36180': 'Literature', 'Q639669': 'Music', 'Q1028181': 'Art',
  'Q4964182': 'Philosophy', 'Q82955': 'Politics', 'Q170790': 'Math', 'Q5482740': 'Science',
  'Q11063': 'Science', 'Q205375': 'Medicine', 'Q2066131': 'Sports', 'Q33999': 'Art',
  'Q753110': 'Music', 'Q49757': 'Literature', 'Q822146': 'Art', 'Q169470': 'Science',
  'Q593644': 'Science', 'Q864380': 'Science', 'Q350979': 'Religion', 'Q1234713': 'Religion',
  'Q81096': 'Art', 'Q1930187': 'Business', 'Q333634': 'Literature'
};

function loadPeople() {
  return JSON.parse(fs.readFileSync('./public/people.json', 'utf8'));
}

function savePeople(people) {
  const sorted = [...people].sort((a, b) => b.sitelinks - a.sitelinks);
  fs.writeFileSync('./public/people.json', JSON.stringify(sorted, null, 2), 'utf8');
}

console.log('🏛️  Ancient Period Fetcher (using MediaWiki API)');
console.log('━'.repeat(60));
console.log(`📅 Centuries: ${config.startCentury} to ${config.endCentury}`);
console.log(`🎯 Min sitelinks: ${config.minSitelinks}`);
console.log(`🔍 Dry run: ${config.dryRun ? 'YES' : 'NO'}`);
console.log('━'.repeat(60));
console.log();
console.log('⚠️  Note: This uses MWAPI search which is approximate.');
console.log('   It searches for people with birth/death dates in the century range.');
console.log('   For ancient periods, Wikidata data is sparse and dates are often approximate.');
console.log();
console.log('💡 Recommendation: Your manually curated 428 ancient figures are likely');
console.log('   higher quality than what can be automatically fetched from Wikidata.');
console.log();
console.log('   Consider using the dump processing method instead for comprehensive');
console.log('   ancient period coverage, or focus on CE dates where SPARQL works well.');
console.log('━'.repeat(60));
console.log();

const existingPeople = loadPeople();
const existingQids = new Set(existingPeople.map(p => p.qid));

console.log(`📊 Current database: ${existingPeople.length} people`);
console.log();
console.log('This script is a placeholder. For ancient BCE periods:');
console.log();
console.log('Option 1: Use dump processing (see scripts/DUMP_GUIDE.md)');
console.log('Option 2: Keep your manually curated ancient figures (recommended)');
console.log('Option 3: Focus on CE dates with: node scripts/fetchWikidataByDecade.cjs --all-ce-only');
console.log();
console.log('The SPARQL query service times out on BCE dates with YEAR() function,');
console.log('and date range filters don\'t work reliably with negative years.');
console.log();


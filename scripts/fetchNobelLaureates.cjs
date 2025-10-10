const fs = require('fs');

// Node 18+ has global fetch
async function sparql(query) {
  const url = 'https://query.wikidata.org/sparql';
  const res = await fetch(url + '?query=' + encodeURIComponent(query), {
    headers: {
      'accept': 'application/sparql-results+json',
      'user-agent': 'zeitkette-nobel-fetch/1.0 (https://github.com/)'
    }
  });
  if (!res.ok) throw new Error('SPARQL HTTP error ' + res.status);
  return res.json();
}

function yearFromTime(value) {
  // Wikidata time format like "+1901-01-01T00:00:00Z"
  if (!value) return null;
  const m = value.match(/([+-]?\d{1,6})-/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

function mapCategoryToDomain(categoryLabel) {
  const l = categoryLabel.toLowerCase();
  if (l.includes('physics') || l.includes('chemistry')) return ['Science'];
  if (l.includes('medicine') || l.includes('physiology')) return ['Medicine'];
  if (l.includes('literature')) return ['Literature'];
  if (l.includes('peace')) return ['Politics'];
  if (l.includes('economic')) return ['Business'];
  return ['Science'];
}

function mapCountryQidToRegion(qid) {
  const m = {
    Q30: 'US', Q145: 'UK', Q142: 'FR', Q38: 'IT', Q183: 'DE', Q29: 'ES', Q31: 'BE', Q55: 'NL', Q39: 'CH', Q36: 'PL',
    Q28: 'HU', Q15180: 'CZ', Q40: 'AT', Q27: 'IE', Q45: 'PT', Q159: 'RU', Q148: 'CN', Q17: 'JP', Q16: 'CA', Q408: 'AU',
    Q252: 'ID', Q801: 'IL', Q794: 'IR', Q43: 'TR', Q79: 'EG', Q258: 'ZA', Q20: 'NO', Q34: 'SE', Q35: 'DK', Q33: 'FI',
    Q668: 'IN', Q843: 'PK', Q902: 'BD', Q155: 'BR', Q96: 'MX', Q298: 'CL', Q1555: 'PE', Q77: 'UY', Q414: 'AR', Q774: 'GT'
  };
  return m[qid] || null;
}

function loadPeople() {
  return JSON.parse(fs.readFileSync('./public/people.json', 'utf8'));
}

function savePeople(people) {
  fs.writeFileSync('./public/people.json', JSON.stringify(people, null, 2));
  fs.writeFileSync('./public/people.json', JSON.stringify(people, null, 2));
}

function saveAwardsCache(records) {
  fs.writeFileSync('./scripts/nobel_awards_cache.json', JSON.stringify(records, null, 2));
}

async function main() {
  console.log('Fetching Nobel laureates from Wikidata...');
  const query = `
  SELECT ?person ?personLabel ?sitelinks ?birth ?death ?country ?countryLabel ?award ?awardLabel ?year WHERE {
    VALUES ?award { wd:Q38104 wd:Q44585 wd:Q80061 wd:Q37922 wd:Q35637 wd:Q47170 }
    ?person wdt:P31 wd:Q5; wdt:P166 ?award.
    OPTIONAL { ?person wikibase:sitelinks ?sitelinks. }
    OPTIONAL { ?person wdt:P569 ?birth. }
    OPTIONAL { ?person wdt:P570 ?death. }
    OPTIONAL { ?person wdt:P27 ?country. }
    OPTIONAL { ?person p:P166 ?awardStmt. ?awardStmt ps:P166 ?award; pq:P585 ?awardTime. BIND(YEAR(?awardTime) AS ?year) }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;

  const data = await sparql(query);
  const rows = data.results.bindings;

  // Normalize rows
  const records = rows.map(r => ({
    qid: r.person.value.replace('http://www.wikidata.org/entity/', ''),
    name: r.personLabel?.value || '',
    sitelinks: r.sitelinks ? parseInt(r.sitelinks.value, 10) : 0,
    born: yearFromTime(r.birth?.value) ?? null,
    died: yearFromTime(r.death?.value) ?? null,
    countryQid: r.country ? r.country.value.replace('http://www.wikidata.org/entity/', '') : null,
    awardQid: r.award.value.replace('http://www.wikidata.org/entity/', ''),
    awardLabel: r.awardLabel?.value || '',
    year: r.year ? parseInt(r.year.value, 10) : null,
  }));

  // Group by person, collect awards
  const byPerson = new Map();
  for (const rec of records) {
    if (!byPerson.has(rec.qid)) byPerson.set(rec.qid, { ...rec, awards: [] });
    const p = byPerson.get(rec.qid);
    p.name = rec.name || p.name;
    p.sitelinks = Math.max(p.sitelinks || 0, rec.sitelinks || 0);
    p.born = p.born ?? rec.born;
    p.died = p.died ?? rec.died;
    p.countryQid = p.countryQid || rec.countryQid;
    p.awards.push({ awardQid: rec.awardQid, awardLabel: rec.awardLabel, year: rec.year });
  }

  const people = loadPeople();
  const existingQids = new Set(people.map(p => p.qid));

  const toAdd = [];
  for (const [, p] of byPerson) {
    if (existingQids.has(p.qid)) continue;
    if (!p.name || !p.born) continue; // require minimum data
    const domains = mapCategoryToDomain(p.awards[0]?.awardLabel || '');
    const region = p.countryQid ? mapCountryQidToRegion(p.countryQid) : null;
    if (!region) continue; // require region
    const diedYear = p.died != null ? p.died : 9999;
    const sitelinks = p.sitelinks || 0;
    toAdd.push({
      name: p.name,
      born: p.born,
      died: diedYear,
      domains,
      region,
      qid: p.qid,
      sitelinks
    });
  }

  const updated = [...people, ...toAdd];
  savePeople(updated);
  saveAwardsCache(records);

  console.log(`Added ${toAdd.length} Nobel laureates (new). Total people: ${updated.length}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});



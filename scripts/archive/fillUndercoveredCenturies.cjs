const fs = require('fs');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function sparql(query) {
  const res = await fetch('https://query.wikidata.org/sparql?query=' + encodeURIComponent(query), {
    headers: {
      'accept': 'application/sparql-results+json',
      'user-agent': 'zeitkette-century-fill/1.1'
    }
  });
  if (!res.ok) throw new Error('SPARQL error ' + res.status);
  return res.json();
}

async function sparqlWithRetry(query, { retries = 4, baseDelayMs = 800 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await sparql(query);
    } catch (e) {
      attempt++;
      if (attempt > retries) throw e;
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 250);
      await sleep(delay);
    }
  }
}

function yearToRangeForCentury(c) {
  if (c === 0) return null;
  if (c > 0) {
    const start = (c - 1) * 100;
    const end = c * 100 - 1;
    return { start, end };
  }
  // BCE centuries (e.g., -7 => -700..-601)
  const start = c * 100; // negative
  const end = c * 100 + 99; // still negative or -1
  return { start, end };
}

function yearFromTime(value) {
  if (!value) return null;
  const m = value.match(/([+-]?\d{1,6})-/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

function mapCountryQidToRegion(qid) {
  const m = {
    Q30: 'US', Q145: 'UK', Q142: 'FR', Q38: 'IT', Q183: 'DE', Q29: 'ES', Q31: 'BE', Q55: 'NL', Q39: 'CH', Q36: 'PL',
    Q28: 'HU', Q15180: 'CZ', Q40: 'AT', Q27: 'IE', Q45: 'PT', Q159: 'RU', Q148: 'CN', Q17: 'JP', Q16: 'CA', Q408: 'AU',
    Q252: 'ID', Q801: 'IL', Q794: 'IR', Q43: 'TR', Q79: 'EG', Q258: 'ZA', Q20: 'NO', Q34: 'SE', Q35: 'DK', Q33: 'FI',
    Q668: 'IN', Q843: 'PK', Q902: 'BD', Q155: 'BR', Q96: 'MX', Q298: 'CL', Q1555: 'PE', Q77: 'UY', Q414: 'AR', Q774: 'GT',
    Q29999: 'GR', Q41: 'GR', Q38: 'IT', Q15180: 'CZ', Q28: 'HU', Q801: 'IL', Q43: 'TR', Q794: 'IR', Q397: 'UA', Q212: 'UA',
    Q403: 'RS', Q215: 'SI', Q224: 'HR', Q184: 'BY', Q213: 'CZ', Q224: 'HR', Q218: 'RO', Q221: 'MK', Q232: 'KZ', Q16: 'CA'
  };
  return m[qid] || null;
}

function mapOccupationToDomains(occ) {
  const l = (occ || '').toLowerCase();
  if (/mathematic/.test(l)) return ['Math'];
  if (/physic|chemist|astronom|biolog|geolog|scientist|engineer/.test(l)) return ['Science'];
  if (/physician|surgeon|nurse|medicine|psycholog/.test(l)) return ['Medicine'];
  if (/philosoph/.test(l)) return ['Philosophy'];
  if (/poet|writer|novelist|author|playwright|dramatist/.test(l)) return ['Literature'];
  if (/painter|sculptor|artist|architect|actor|actress|film director|director|screenwriter|photograph/.test(l)) return ['Art'];
  if (/singer|composer|musician|conductor|pianist|violinist/.test(l)) return ['Music'];
  if (/politic|emperor|king|queen|ruler|statesman|governor|president|prime minister|monarch/.test(l)) return ['Politics'];
  if (/business|entrepreneur|industrialist|investor/.test(l)) return ['Business'];
  if (/footballer|athlete|basketball|tennis|golfer|boxer|runner|sprinter|swimmer|cricketer|baseball|soccer|coach/.test(l)) return ['Sports'];
  if (/priest|monk|imam|rabbi|bishop|pope|saint|theolog/.test(l)) return ['Religion'];
  return ['Science'];
}

function loadCoverage() {
  return JSON.parse(fs.readFileSync('./scripts/coverage_report.json', 'utf8'));
}

function loadPeople() {
  return JSON.parse(fs.readFileSync('./data/people.json', 'utf8'));
}

function savePeople(people) {
  fs.writeFileSync('./data/people.json', JSON.stringify(people, null, 2));
  fs.writeFileSync('./public/people.json', JSON.stringify(people, null, 2));
}

async function fetchForCentury(c, limitPerCentury = 60) {
  const range = yearToRangeForCentury(c);
  if (!range) return [];
  const query = `
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  SELECT ?p ?pLabel ?sitelinks ?birth ?death ?cit ?citLabel ?occLabel WHERE {
    ?p wdt:P31 wd:Q5.
    OPTIONAL { ?p wikibase:sitelinks ?sitelinks }
    OPTIONAL { ?p wdt:P569 ?birth }
    OPTIONAL { ?p wdt:P570 ?death }
    OPTIONAL { ?p wdt:P27 ?cit }
    OPTIONAL { ?p wdt:P106 ?occ. ?occ rdfs:label ?occLabel FILTER(LANG(?occLabel)='en') }
    FILTER(BOUND(?birth))
    FILTER(?birth >= "${range.start}-01-01T00:00:00Z"^^xsd:dateTime && ?birth <= "${range.end}-12-31T23:59:59Z"^^xsd:dateTime)
    FILTER(BOUND(?sitelinks) && ?sitelinks >= 80)
    SERVICE wikibase:label { bd:serviceParam wikibase:language 'en'. }
  }
  ORDER BY DESC(?sitelinks)
  LIMIT ${limitPerCentury}
  `;
  const data = await sparqlWithRetry(query);
  return data.results.bindings.map(r => ({
    qid: r.p.value.replace('http://www.wikidata.org/entity/', ''),
    name: r.pLabel?.value || '',
    sitelinks: r.sitelinks ? parseInt(r.sitelinks.value, 10) : 0,
    born: yearFromTime(r.birth?.value) ?? null,
    died: yearFromTime(r.death?.value) ?? 9999,
    countryQid: r.cit ? r.cit.value.replace('http://www.wikidata.org/entity/', '') : null,
    occupationLabel: r.occLabel?.value || ''
  }));
}

async function main() {
  // Optional CLI: --century=N to target one century, --limit=N to override per-century limit
  const args = process.argv.slice(2);
  const argCentury = args.find(a => a.startsWith('--century='));
  const argLimit = args.find(a => a.startsWith('--limit='));
  const oneCentury = argCentury ? parseInt(argCentury.split('=')[1], 10) : null;
  const limitOverride = argLimit ? parseInt(argLimit.split('=')[1], 10) : null;

  const coverage = loadCoverage();
  const under = oneCentury != null ? [oneCentury] : coverage.gaps.map(g => g.century);
  console.log('Under-covered centuries:', under.join(', '));

  const people = loadPeople();
  const existingQids = new Set(people.map(p => p.qid));

  let totalAdded = 0;
  const toAppend = [];

  for (const c of under) {
    console.log('Fetching for century', c, '...');
    // Smaller limits for ancient to reduce server load
    const limit = limitOverride != null ? limitOverride : (c <= 4 ? 60 : c <= 14 ? 80 : 120);
    const rows = await fetchForCentury(c, limit);
    for (const r of rows) {
      if (existingQids.has(r.qid)) continue;
      const region = r.countryQid ? mapCountryQidToRegion(r.countryQid) : null;
      if (!region) continue;
      const domains = mapOccupationToDomains(r.occupationLabel);
      if (!domains || domains.length === 0) continue;
      if (!r.name || r.born == null) continue;
      toAppend.push({
        name: r.name,
        born: r.born,
        died: r.died ?? 9999,
        domains,
        region,
        qid: r.qid,
        sitelinks: r.sitelinks
      });
      existingQids.add(r.qid);
      totalAdded += 1;
    }
    // Gentle delay to avoid rate limits
    if (oneCentury == null) await sleep(1200);
  }

  console.log('Prepared to append:', toAppend.length);
  const updated = [...people, ...toAppend];
  savePeople(updated);
  fs.writeFileSync('./scripts/century_fill_added.json', JSON.stringify(toAppend, null, 2));
  console.log('Appended', toAppend.length, 'people. Total is now', updated.length);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});



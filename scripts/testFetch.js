/**
 * Quick test to verify Wikidata query works
 */

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';

const TEST_QUERY = `
SELECT ?person ?personLabel ?born ?died ?sitelinks
WHERE {
  ?person wdt:P31 wd:Q5;
          wdt:P569 ?bornDate;
          wdt:P570 ?diedDate.
  
  ?person wikibase:sitelinks ?sitelinks.
  
  BIND(YEAR(?bornDate) as ?born)
  BIND(YEAR(?diedDate) as ?died)
  
  # Test with physicists from 1900-1950 (should include Heisenberg!)
  FILTER(?born >= 1900 && ?born <= 1950)
  FILTER(?died >= 1925 && ?died <= 2024)
  FILTER(?died - ?born >= 25)
  FILTER(?sitelinks >= 80)
  
  SERVICE wikibase:label { 
    bd:serviceParam wikibase:language "de,en". 
  }
}
ORDER BY DESC(?sitelinks)
LIMIT 20
`;

async function test() {
  console.log('🧪 Testing Wikidata query for 1900-1950 physicists...\n');
  
  const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(TEST_QUERY)}&format=json`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/sparql-results+json',
      'User-Agent': 'ZeitketteBot/1.0 Educational'
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    console.error(`HTTP ${response.status}: ${text}`);
    throw new Error(`Query failed`);
  }
  
  const data = await response.json();
  
  console.log(`✅ Found ${data.results.bindings.length} people:\n`);
  
  data.results.bindings.forEach(p => {
    const name = p.personLabel.value;
    const born = p.born.value;
    const died = p.died.value;
    const sitelinks = p.sitelinks.value;
    console.log(`  ${name.padEnd(30)} ${born}-${died} (${sitelinks} articles)`);
  });
  
  const hasHeisenberg = data.results.bindings.some(p => 
    p.personLabel.value.includes('Heisenberg')
  );
  
  console.log(`\n${hasHeisenberg ? '✅' : '❌'} Heisenberg ${hasHeisenberg ? 'FOUND' : 'MISSING'}!`);
}

test().catch(console.error);


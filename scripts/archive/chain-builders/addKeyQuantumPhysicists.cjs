const fs = require('fs');

// Key quantum physicists that are missing from the dataset
const keyPhysicists = [
  { name: 'Erwin Schrödinger', qid: 'Q84296', born: 1887, died: 1961, domains: ['Science'], region: 'AT', sitelinks: 140 },
  { name: 'Werner Heisenberg', qid: 'Q103293', born: 1901, died: 1976, domains: ['Science'], region: 'DE', sitelinks: 135 },
  { name: 'Max Born', qid: 'Q37939', born: 1882, died: 1970, domains: ['Science'], region: 'DE', sitelinks: 110 },
  { name: 'Arnold Sommerfeld', qid: 'Q78613', born: 1868, died: 1951, domains: ['Science'], region: 'DE', sitelinks: 95 },
  { name: 'Max von Laue', qid: 'Q77078', born: 1879, died: 1960, domains: ['Science'], region: 'DE', sitelinks: 90 },
  { name: 'Peter Debye', qid: 'Q105478', born: 1884, died: 1966, domains: ['Science'], region: 'NL', sitelinks: 95 },
  { name: 'Murray Gell-Mann', qid: 'Q125245', born: 1929, died: 2019, domains: ['Science'], region: 'US', sitelinks: 110 },
  { name: 'Steven Weinberg', qid: 'Q188620', born: 1933, died: 2021, domains: ['Science'], region: 'US', sitelinks: 105 },
  { name: 'John Archibald Wheeler', qid: 'Q213926', born: 1911, died: 2008, domains: ['Science'], region: 'US', sitelinks: 95 },
  { name: 'Carl Friedrich von Weizsäcker', qid: 'Q57260', born: 1912, died: 2007, domains: ['Science', 'Philosophy'], region: 'DE', sitelinks: 85 },
  { name: 'Pascual Jordan', qid: 'Q57242', born: 1902, died: 1980, domains: ['Science'], region: 'DE', sitelinks: 80 },
  { name: 'Hendrik Lorentz', qid: 'Q39739', born: 1853, died: 1928, domains: ['Science'], region: 'NL', sitelinks: 115 },
  { name: 'Arthur Compton', qid: 'Q169071', born: 1892, died: 1962, domains: ['Science'], region: 'US', sitelinks: 95 },
  { name: 'Clinton Davisson', qid: 'Q312413', born: 1881, died: 1958, domains: ['Science'], region: 'US', sitelinks: 75 },
  { name: 'George Paget Thomson', qid: 'Q317521', born: 1892, died: 1975, domains: ['Science'], region: 'GB', sitelinks: 80 },
  { name: 'Satyendra Nath Bose', qid: 'Q46805', born: 1894, died: 1974, domains: ['Science'], region: 'IN', sitelinks: 105 },
  { name: 'Eugene Wigner', qid: 'Q104414', born: 1902, died: 1995, domains: ['Science'], region: 'US', sitelinks: 95 },
  { name: 'John von Neumann', qid: 'Q17247', born: 1903, died: 1957, domains: ['Math', 'Science'], region: 'US', sitelinks: 130 },
  { name: 'Julian Schwinger', qid: 'Q104475', born: 1918, died: 1994, domains: ['Science'], region: 'US', sitelinks: 90 },
  { name: 'Sin-Itiro Tomonaga', qid: 'Q185637', born: 1906, died: 1979, domains: ['Science'], region: 'JP', sitelinks: 85 },
  { name: 'Freeman Dyson', qid: 'Q310408', born: 1923, died: 2020, domains: ['Science'], region: 'GB', sitelinks: 100 },
  { name: 'Chen Ning Yang', qid: 'Q185743', born: 1922, died: null, domains: ['Science'], region: 'CN', sitelinks: 95 },
  { name: 'Tsung-Dao Lee', qid: 'Q185721', born: 1926, died: 2024, domains: ['Science'], region: 'CN', sitelinks: 90 },
  { name: 'John Stewart Bell', qid: 'Q309430', born: 1928, died: 1990, domains: ['Science'], region: 'GB', sitelinks: 85 },
  { name: 'Alain Aspect', qid: 'Q448174', born: 1947, died: null, domains: ['Science'], region: 'FR', sitelinks: 85 },
];

function loadPeople() {
  return JSON.parse(fs.readFileSync('./public/people.json', 'utf8'));
}

function savePeople(people) {
  fs.writeFileSync('./public/people.json', JSON.stringify(people, null, 2));
  fs.writeFileSync('./public/people.json', JSON.stringify(people, null, 2));
}

function main() {
  const people = loadPeople();
  const existingQids = new Set(people.map(p => p.qid));
  
  const toAdd = [];
  for (const physicist of keyPhysicists) {
    if (existingQids.has(physicist.qid)) {
      console.log(`⚠️  Already exists: ${physicist.name}`);
      continue;
    }
    toAdd.push(physicist);
    console.log(`✅ Adding: ${physicist.name}`);
    existingQids.add(physicist.qid);
  }
  
  if (toAdd.length === 0) {
    console.log('\nNo new physicists to add.');
    return;
  }
  
  console.log(`\nAdding ${toAdd.length} key quantum physicists`);
  const updated = [...people, ...toAdd];
  savePeople(updated);
  console.log(`Total people: ${updated.length}`);
}

main();


const fs = require('fs');

// Key computer science pioneers to add if missing
const csPioneers = [
  { name: 'Charles Babbage', qid: 'Q19828', born: 1791, died: 1871, domains: ['Science', 'Math'], region: 'GB', sitelinks: 130 },
  { name: 'Ada Lovelace', qid: 'Q7259', born: 1815, died: 1852, domains: ['Science', 'Math'], region: 'GB', sitelinks: 140 },
  { name: 'George Boole', qid: 'Q131309', born: 1815, died: 1864, domains: ['Math'], region: 'GB', sitelinks: 110 },
  { name: 'Alan Turing', qid: 'Q7251', born: 1912, died: 1954, domains: ['Science', 'Math'], region: 'GB', sitelinks: 160 },
  { name: 'Alonzo Church', qid: 'Q179049', born: 1903, died: 1995, domains: ['Math'], region: 'US', sitelinks: 85 },
  { name: 'Kurt Gödel', qid: 'Q43270', born: 1906, died: 1978, domains: ['Math', 'Philosophy'], region: 'AT', sitelinks: 125 },
  { name: 'Claude Shannon', qid: 'Q145794', born: 1916, died: 2001, domains: ['Science', 'Math'], region: 'US', sitelinks: 110 },
  { name: 'Norbert Wiener', qid: 'Q190132', born: 1894, died: 1964, domains: ['Math', 'Science'], region: 'US', sitelinks: 95 },
  { name: 'Grace Hopper', qid: 'Q11428', born: 1906, died: 1992, domains: ['Science'], region: 'US', sitelinks: 105 },
  { name: 'John McCarthy', qid: 'Q92614', born: 1927, died: 2011, domains: ['Science'], region: 'US', sitelinks: 95 },
  { name: 'Marvin Minsky', qid: 'Q204815', born: 1927, died: 2016, domains: ['Science'], region: 'US', sitelinks: 90 },
  { name: 'Donald Knuth', qid: 'Q17457', born: 1938, died: null, domains: ['Science'], region: 'US', sitelinks: 95 },
  { name: 'Edsger W. Dijkstra', qid: 'Q92604', born: 1930, died: 2002, domains: ['Science'], region: 'NL', sitelinks: 90 },
  { name: 'Dennis Ritchie', qid: 'Q92621', born: 1941, died: 2011, domains: ['Science'], region: 'US', sitelinks: 90 },
  { name: 'Ken Thompson', qid: 'Q92624', born: 1943, died: null, domains: ['Science'], region: 'US', sitelinks: 85 },
  { name: 'Bjarne Stroustrup', qid: 'Q92616', born: 1950, died: null, domains: ['Science'], region: 'DK', sitelinks: 85 },
  { name: 'Tim Berners-Lee', qid: 'Q80', born: 1955, died: null, domains: ['Science'], region: 'GB', sitelinks: 160 },
  { name: 'Linus Torvalds', qid: 'Q34253', born: 1969, died: null, domains: ['Science'], region: 'FI', sitelinks: 130 },
];

// Computer science dependency graph
const csRelations = [
  // Early Computing Concepts
  { from: 'Q19828', to: 'Q7259', type: 'collaborated', desc: 'Charles Babbage ↔ Ada Lovelace (Analytical Engine)' },
  { from: 'Q19828', to: 'Q7251', type: 'influenced', desc: 'Babbage → Turing (computing concepts)' },
  
  // Mathematical Logic Foundations
  { from: 'Q131309', to: 'Q145794', type: 'influenced', desc: 'George Boole → Claude Shannon (Boolean algebra)' },
  { from: 'Q43270', to: 'Q7251', type: 'influenced', desc: 'Kurt Gödel → Alan Turing (computability)' },
  { from: 'Q179049', to: 'Q7251', type: 'influenced', desc: 'Alonzo Church → Turing (lambda calculus)' },
  { from: 'Q179049', to: 'Q92614', type: 'teacher', desc: 'Church → John McCarthy (AI)' },
  
  // Von Neumann Architecture
  { from: 'Q7251', to: 'Q17247', type: 'influenced', desc: 'Turing → von Neumann (stored-program concept)' },
  { from: 'Q17247', to: 'Q92614', type: 'influenced', desc: 'von Neumann → McCarthy' },
  
  // Information Theory
  { from: 'Q145794', to: 'Q17247', type: 'collaborated', desc: 'Shannon ↔ von Neumann' },
  { from: 'Q190132', to: 'Q145794', type: 'influenced', desc: 'Norbert Wiener → Shannon (cybernetics)' },
  
  // Programming Languages
  { from: 'Q11428', to: 'Q92621', type: 'influenced', desc: 'Grace Hopper → Dennis Ritchie (compilers)' },
  { from: 'Q92621', to: 'Q92624', type: 'collaborated', desc: 'Dennis Ritchie ↔ Ken Thompson (C, UNIX)' },
  { from: 'Q92621', to: 'Q92616', type: 'influenced', desc: 'Ritchie → Bjarne Stroustrup (C++)' },
  
  // Artificial Intelligence
  { from: 'Q92614', to: 'Q204815', type: 'collaborated', desc: 'John McCarthy ↔ Marvin Minsky (AI pioneers)' },
  { from: 'Q7251', to: 'Q92614', type: 'influenced', desc: 'Turing → McCarthy (AI concepts)' },
  
  // Algorithms & Theory
  { from: 'Q17247', to: 'Q17457', type: 'influenced', desc: 'von Neumann → Donald Knuth (algorithms)' },
  { from: 'Q92604', to: 'Q17457', type: 'contemporary', desc: 'Edsger Dijkstra ↔ Knuth (algorithms)' },
  
  // Modern Computing
  { from: 'Q92624', to: 'Q34253', type: 'influenced', desc: 'Ken Thompson → Linus Torvalds (UNIX → Linux)' },
  { from: 'Q80', to: 'Q34253', type: 'contemporary', desc: 'Tim Berners-Lee ↔ Torvalds (Internet era)' },
  
  // Cross-domain
  { from: 'Q17247', to: 'Q132537', type: 'collaborated', desc: 'von Neumann ↔ Oppenheimer (Manhattan Project)' },
];

function loadPeople() {
  return JSON.parse(fs.readFileSync('./public/people.json', 'utf8'));
}

function savePeople(people) {
  fs.writeFileSync('./public/people.json', JSON.stringify(people, null, 2));
  fs.writeFileSync('./public/people.json', JSON.stringify(people, null, 2));
}

function loadRelations() {
  return JSON.parse(fs.readFileSync('./public/relations.json', 'utf8'));
}

function saveRelations(relations) {
  fs.writeFileSync('./public/relations.json', JSON.stringify(relations, null, 2));
  fs.writeFileSync('./public/relations.json', JSON.stringify(relations, null, 2));
}

function main() {
  console.log('=== Adding Computer Science Pioneers ===\n');
  
  // First, add missing people
  let people = loadPeople();
  const existingQids = new Set(people.map(p => p.qid));
  
  const toAdd = [];
  for (const pioneer of csPioneers) {
    if (existingQids.has(pioneer.qid)) {
      console.log(`⚠️  Already exists: ${pioneer.name}`);
      continue;
    }
    toAdd.push(pioneer);
    console.log(`✅ Adding: ${pioneer.name}`);
    existingQids.add(pioneer.qid);
  }
  
  if (toAdd.length > 0) {
    console.log(`\nAdding ${toAdd.length} CS pioneers`);
    people = [...people, ...toAdd];
    savePeople(people);
    console.log(`Total people: ${people.length}\n`);
  }
  
  // Now add relations
  console.log('=== Adding Computer Science Dependency Chain ===\n');
  
  const relations = loadRelations();
  const qidToName = new Map(people.map(p => [p.qid, p.name]));
  const qids = new Set(people.map(p => p.qid));
  
  let added = 0;
  let skippedMissing = 0;
  let skippedDuplicate = 0;
  
  for (const rel of csRelations) {
    // Verify both QIDs exist
    if (!qids.has(rel.from) || !qids.has(rel.to)) {
      skippedMissing++;
      console.log(`⚠️  Skipped: ${rel.desc} - QID not found`);
      continue;
    }
    
    const targetName = qidToName.get(rel.to);
    
    // Initialize relations for this QID if not exists
    if (!relations[rel.from]) {
      relations[rel.from] = { knew: [] };
    }
    
    // Check if relation already exists
    const exists = relations[rel.from].knew.some(k => k.name === targetName);
    if (exists) {
      skippedDuplicate++;
      continue;
    }
    
    // Add the relation
    relations[rel.from].knew.push({
      name: targetName,
      type: rel.type,
      confidence: 0.95
    });
    added++;
    console.log(`✅ ${rel.desc}`);
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Added: ${added} CS relations`);
  console.log(`Skipped (missing QIDs): ${skippedMissing}`);
  console.log(`Skipped (duplicates): ${skippedDuplicate}`);
  
  saveRelations(relations);
  
  // Count total relations
  let total = 0;
  for (const qid in relations) {
    total += relations[qid].knew.length;
  }
  console.log(`Total relations in dataset: ${total}`);
}

main();


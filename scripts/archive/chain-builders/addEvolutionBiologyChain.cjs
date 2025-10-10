const fs = require('fs');

// Key evolution/biology figures to add if missing
const bioFigures = [
  { name: 'Jean-Baptiste Lamarck', qid: 'Q82122', born: 1744, died: 1829, domains: ['Science'], region: 'FR', sitelinks: 110 },
  { name: 'Georges Cuvier', qid: 'Q171969', born: 1769, died: 1832, domains: ['Science'], region: 'FR', sitelinks: 100 },
  { name: 'Alfred Russel Wallace', qid: 'Q160627', born: 1823, died: 1913, domains: ['Science'], region: 'GB', sitelinks: 105 },
  { name: 'Thomas Henry Huxley', qid: 'Q185062', born: 1825, died: 1895, domains: ['Science'], region: 'GB', sitelinks: 95 },
  { name: 'Ernst Haeckel', qid: 'Q48246', born: 1834, died: 1919, domains: ['Science'], region: 'DE', sitelinks: 105 },
  { name: 'Gregor Mendel', qid: 'Q37970', born: 1822, died: 1884, domains: ['Science'], region: 'CZ', sitelinks: 130 },
  { name: 'August Weismann', qid: 'Q60015', born: 1834, died: 1914, domains: ['Science'], region: 'DE', sitelinks: 85 },
  { name: 'Hugo de Vries', qid: 'Q156349', born: 1848, died: 1935, domains: ['Science'], region: 'NL', sitelinks: 85 },
  { name: 'Thomas Hunt Morgan', qid: 'Q216710', born: 1866, died: 1945, domains: ['Science'], region: 'US', sitelinks: 90 },
  { name: 'Ronald Fisher', qid: 'Q216723', born: 1890, died: 1962, domains: ['Science', 'Math'], region: 'GB', sitelinks: 95 },
  { name: 'J.B.S. Haldane', qid: 'Q208375', born: 1892, died: 1964, domains: ['Science'], region: 'GB', sitelinks: 85 },
  { name: 'Sewall Wright', qid: 'Q380045', born: 1889, died: 1988, domains: ['Science'], region: 'US', sitelinks: 80 },
  { name: 'Theodosius Dobzhansky', qid: 'Q316331', born: 1900, died: 1975, domains: ['Science'], region: 'RU', sitelinks: 85 },
  { name: 'Ernst Mayr', qid: 'Q75613', born: 1904, died: 2005, domains: ['Science'], region: 'DE', sitelinks: 95 },
  { name: 'Stephen Jay Gould', qid: 'Q194166', born: 1941, died: 2002, domains: ['Science'], region: 'US', sitelinks: 100 },
  { name: 'Richard Dawkins', qid: 'Q160026', born: 1941, died: null, domains: ['Science'], region: 'GB', sitelinks: 120 },
  { name: 'E. O. Wilson', qid: 'Q82171', born: 1929, died: 2021, domains: ['Science'], region: 'US', sitelinks: 95 },
];

// Evolution/Biology dependency graph
const bioRelations = [
  // Early Evolution Theory
  { from: 'Q82122', to: 'Q1035', type: 'influenced', desc: 'Lamarck → Darwin (evolutionary thought)' },
  { from: 'Q171969', to: 'Q1035', type: 'influenced', desc: 'Georges Cuvier → Darwin (paleontology)' },
  
  // Darwin's Circle
  { from: 'Q1035', to: 'Q160627', type: 'contemporary', desc: 'Charles Darwin ↔ Alfred Russel Wallace (co-discovery)' },
  { from: 'Q1035', to: 'Q185062', type: 'collaborated', desc: 'Darwin → Thomas Henry Huxley (defender)' },
  { from: 'Q1035', to: 'Q48246', type: 'influenced', desc: 'Darwin → Ernst Haeckel' },
  
  // Genetics Emerges
  { from: 'Q37970', to: 'Q216710', type: 'influenced', desc: 'Gregor Mendel → Thomas Hunt Morgan (rediscovery)' },
  { from: 'Q37970', to: 'Q156349', type: 'influenced', desc: 'Mendel → Hugo de Vries' },
  
  // Weismann Barrier
  { from: 'Q60015', to: 'Q216710', type: 'influenced', desc: 'August Weismann → Morgan (germ plasm theory)' },
  
  // Modern Synthesis
  { from: 'Q216710', to: 'Q316331', type: 'influenced', desc: 'Morgan → Theodosius Dobzhansky' },
  { from: 'Q216723', to: 'Q316331', type: 'influenced', desc: 'Ronald Fisher → Dobzhansky (population genetics)' },
  { from: 'Q208375', to: 'Q316331', type: 'influenced', desc: 'J.B.S. Haldane → Dobzhansky' },
  { from: 'Q380045', to: 'Q316331', type: 'collaborated', desc: 'Sewall Wright ↔ Dobzhansky' },
  { from: 'Q316331', to: 'Q75613', type: 'contemporary', desc: 'Dobzhansky ↔ Ernst Mayr (synthesis)' },
  
  // Molecular Evolution
  { from: 'Q216710', to: 'Q123280', type: 'influenced', desc: 'Morgan → Francis Crick (genetics foundation)' },
  { from: 'Q123280', to: 'Q160026', type: 'influenced', desc: 'Crick → Richard Dawkins (molecular view)' },
  
  // Neo-Darwinism
  { from: 'Q75613', to: 'Q194166', type: 'teacher', desc: 'Ernst Mayr → Stephen Jay Gould' },
  { from: 'Q194166', to: 'Q160026', type: 'debated', desc: 'Gould ↔ Dawkins (punctuated equilibrium vs gradualism)' },
  
  // Sociobiology
  { from: 'Q82171', to: 'Q160026', type: 'contemporary', desc: 'E. O. Wilson ↔ Dawkins (sociobiology)' },
  
  // Cross-domain: Embryology
  { from: 'Q48246', to: 'Q185062', type: 'contemporary', desc: 'Haeckel ↔ Huxley' },
  
  // Population Genetics Founders
  { from: 'Q216723', to: 'Q208375', type: 'contemporary', desc: 'Fisher ↔ Haldane (British school)' },
  { from: 'Q216723', to: 'Q380045', type: 'debated', desc: 'Fisher ↔ Wright (selection vs drift)' },
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
  console.log('=== Adding Evolutionary Biology Figures ===\n');
  
  // First, add missing people
  let people = loadPeople();
  const existingQids = new Set(people.map(p => p.qid));
  
  const toAdd = [];
  for (const figure of bioFigures) {
    if (existingQids.has(figure.qid)) {
      console.log(`⚠️  Already exists: ${figure.name}`);
      continue;
    }
    toAdd.push(figure);
    console.log(`✅ Adding: ${figure.name}`);
    existingQids.add(figure.qid);
  }
  
  if (toAdd.length > 0) {
    console.log(`\nAdding ${toAdd.length} evolutionary biology figures`);
    people = [...people, ...toAdd];
    savePeople(people);
    console.log(`Total people: ${people.length}\n`);
  }
  
  // Now add relations
  console.log('=== Adding Evolutionary Biology Dependency Chain ===\n');
  
  const relations = loadRelations();
  const qidToName = new Map(people.map(p => [p.qid, p.name]));
  const qids = new Set(people.map(p => p.qid));
  
  let added = 0;
  let skippedMissing = 0;
  let skippedDuplicate = 0;
  
  for (const rel of bioRelations) {
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
  console.log(`Added: ${added} evolution biology relations`);
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


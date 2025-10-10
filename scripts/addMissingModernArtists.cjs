const fs = require('fs');

// Missing modern artists
const missingArtists = [
  { name: 'Jackson Pollock', qid: 'Q37571', born: 1912, died: 1956, domains: ['Art'], region: 'US', sitelinks: 125 },
  { name: 'Andy Warhol', qid: 'Q5603', born: 1928, died: 1987, domains: ['Art'], region: 'US', sitelinks: 145 },
];

// Relations involving these artists
const relations = [
  { from: 'Q5582', to: 'Q37571', type: 'influenced', desc: 'Picasso → Pollock' },
  { from: 'Q37571', to: 'Q132305', type: 'contemporary', desc: 'Pollock ↔ de Kooning (abstract expressionism)' },
  { from: 'Q37571', to: 'Q473568', type: 'influenced', desc: 'Pollock → Kline' },
  { from: 'Q5582', to: 'Q5603', type: 'influenced', desc: 'Picasso → Warhol (mass culture)' },
  { from: 'Q5603', to: 'Q151679', type: 'contemporary', desc: 'Warhol ↔ Lichtenstein (pop art)' },
  { from: 'Q5603', to: 'Q155057', type: 'contemporary', desc: 'Warhol ↔ Jasper Johns' },
  { from: 'Q37571', to: 'Q164358', type: 'influenced', desc: 'Pollock → Rauschenberg' },
];

function loadPeople() {
  return JSON.parse(fs.readFileSync('./data/people.json', 'utf8'));
}

function savePeople(people) {
  fs.writeFileSync('./data/people.json', JSON.stringify(people, null, 2));
  fs.writeFileSync('./public/people.json', JSON.stringify(people, null, 2));
}

function loadRelations() {
  return JSON.parse(fs.readFileSync('./data/relations.json', 'utf8'));
}

function saveRelations(rels) {
  fs.writeFileSync('./data/relations.json', JSON.stringify(rels, null, 2));
  fs.writeFileSync('./public/relations.json', JSON.stringify(rels, null, 2));
}

function main() {
  let people = loadPeople();
  const existingQids = new Set(people.map(p => p.qid));
  
  // Add missing people
  const toAdd = missingArtists.filter(a => !existingQids.has(a.qid));
  if (toAdd.length > 0) {
    console.log(`Adding ${toAdd.length} missing modern artists`);
    people = [...people, ...toAdd];
    savePeople(people);
    console.log(`Total people: ${people.length}\n`);
  }
  
  // Add relations
  const rels = loadRelations();
  const qidToName = new Map(people.map(p => [p.qid, p.name]));
  const qids = new Set(people.map(p => p.qid));
  
  let added = 0;
  for (const rel of relations) {
    if (!qids.has(rel.from) || !qids.has(rel.to)) continue;
    const targetName = qidToName.get(rel.to);
    if (!rels[rel.from]) rels[rel.from] = { knew: [] };
    if (rels[rel.from].knew.some(k => k.name === targetName)) continue;
    
    rels[rel.from].knew.push({
      name: targetName,
      type: rel.type,
      confidence: 0.95
    });
    added++;
    console.log(`✅ ${rel.desc}`);
  }
  
  console.log(`\nAdded ${added} relations`);
  saveRelations(rels);
  
  let total = 0;
  for (const qid in rels) total += rels[qid].knew.length;
  console.log(`Total relations: ${total}`);
}

main();


const fs = require('fs');
const path = require('path');

// Load data
const people = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/people.json'), 'utf8'));
const relations = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/relations.json'), 'utf8'));

// Lorentz connections - he was crucial for quantum mechanics!
const lorentzRelations = [
  { from: 'Q39739', to: 'Q937', type: 'colleague', desc: 'Lorentz ↔ Einstein (special relativity)' },
  { from: 'Q39739', to: 'Q9021', type: 'colleague', desc: 'Lorentz → Planck (quantum theory)' },
  { from: 'Q39739', to: 'Q38096', type: 'influenced', desc: 'Lorentz → Bohr' },
  { from: 'Q937', to: 'Q39739', type: 'influenced', desc: 'Einstein influenced by Lorentz' },
  { from: 'Q9021', to: 'Q39739', type: 'colleague', desc: 'Planck ↔ Lorentz' },
];

let addedCount = 0;

for (const rel of lorentzRelations) {
  const fromPerson = people.find(p => p.qid === rel.from);
  const toPerson = people.find(p => p.qid === rel.to);
  
  if (!fromPerson || !toPerson) {
    console.log(`⚠️  Skipped: ${rel.desc} - Person not found`);
    continue;
  }
  
  if (!relations[rel.from]) {
    relations[rel.from] = { knew: [] };
  }
  if (!relations[rel.from].knew) {
    relations[rel.from].knew = [];
  }
  
  const exists = relations[rel.from].knew.some(r => 
    r.qid === rel.to && r.type === rel.type
  );
  
  if (!exists) {
    relations[rel.from].knew.push({
      qid: rel.to,
      type: rel.type,
      confidence: 0.95
    });
    console.log(`✅ Added: ${rel.desc}`);
    addedCount++;
  }
}

fs.writeFileSync(
  path.join(__dirname, '../public/relations.json'),
  JSON.stringify(relations, null, 2)
);

console.log(`\n✨ Added ${addedCount} Lorentz relations`);


const fs = require('fs');
const path = require('path');

const chain = require('../src/config/domainChains.js').DOMAIN_CHAINS['quantum-mechanics'];
const people = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/people.json'), 'utf8'));
const relations = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/relations.json'), 'utf8'));

// All QIDs in the quantum chain
const chainQids = chain.qids;

console.log('Quantum Mechanics Chain QIDs:', chainQids);

// Comprehensive relations - ONLY between people in the chain (using correct QIDs)
const quantumRelations = [
  // Planck's students and colleagues
  { from: 'Q9021', to: 'Q77078', type: 'teacher', desc: 'Planck → von Laue' },
  { from: 'Q9021', to: 'Q9007', type: 'influenced', desc: 'Planck → Bohr' },
  { from: 'Q9021', to: 'Q937', type: 'colleague', desc: 'Planck ↔ Einstein' },
  { from: 'Q9021', to: 'Q39739', type: 'colleague', desc: 'Planck ↔ Lorentz' },
  { from: 'Q9021', to: 'Q37939', type: 'influenced', desc: 'Planck → Born' },
  
  // Einstein's network
  { from: 'Q937', to: 'Q9007', type: 'colleague', desc: 'Einstein ↔ Bohr (debates)' },
  { from: 'Q937', to: 'Q84296', type: 'influenced', desc: 'Einstein → Schrödinger' },
  { from: 'Q937', to: 'Q83331', type: 'influenced', desc: 'Einstein → de Broglie' },
  { from: 'Q937', to: 'Q39739', type: 'influenced', desc: 'Einstein influenced by Lorentz' },
  { from: 'Q937', to: 'Q65989', type: 'colleague', desc: 'Einstein → Pauli' },
  { from: 'Q937', to: 'Q37939', type: 'colleague', desc: 'Einstein ↔ Born' },
  
  // Lorentz connections
  { from: 'Q39739', to: 'Q937', type: 'colleague', desc: 'Lorentz → Einstein' },
  { from: 'Q39739', to: 'Q9021', type: 'colleague', desc: 'Lorentz → Planck' },
  { from: 'Q39739', to: 'Q9007', type: 'influenced', desc: 'Lorentz → Bohr' },
  
  // Bohr's Copenhagen school
  { from: 'Q9007', to: 'Q103293', type: 'teacher', desc: 'Bohr → Heisenberg' },
  { from: 'Q9007', to: 'Q65989', type: 'influenced', desc: 'Bohr → Pauli' },
  { from: 'Q9007', to: 'Q84296', type: 'colleague', desc: 'Bohr ↔ Schrödinger' },
  { from: 'Q9007', to: 'Q83331', type: 'colleague', desc: 'Bohr → de Broglie' },
  { from: 'Q9007', to: 'Q47480', type: 'influenced', desc: 'Bohr → Dirac' },
  { from: 'Q9007', to: 'Q213926', type: 'influenced', desc: 'Bohr → Wheeler' },
  { from: 'Q9007', to: 'Q37939', type: 'colleague', desc: 'Bohr ↔ Born' },
  
  // Born's connections
  { from: 'Q37939', to: 'Q103293', type: 'teacher', desc: 'Born → Heisenberg (Göttingen)' },
  { from: 'Q37939', to: 'Q132537', type: 'teacher', desc: 'Born → Oppenheimer' },
  { from: 'Q37939', to: 'Q65989', type: 'colleague', desc: 'Born ↔ Pauli' },
  { from: 'Q37939', to: 'Q84296', type: 'colleague', desc: 'Born → Schrödinger' },
  
  // Sommerfeld's Munich school
  { from: 'Q78613', to: 'Q103293', type: 'teacher', desc: 'Sommerfeld → Heisenberg' },
  { from: 'Q78613', to: 'Q65989', type: 'teacher', desc: 'Sommerfeld → Pauli' },
  { from: 'Q78613', to: 'Q105478', type: 'teacher', desc: 'Sommerfeld → Debye' },
  
  // Heisenberg's connections
  { from: 'Q103293', to: 'Q65989', type: 'colleague', desc: 'Heisenberg ↔ Pauli' },
  { from: 'Q103293', to: 'Q84296', type: 'colleague', desc: 'Heisenberg → Schrödinger' },
  { from: 'Q103293', to: 'Q47480', type: 'colleague', desc: 'Heisenberg ↔ Dirac' },
  { from: 'Q103293', to: 'Q57260', type: 'colleague', desc: 'Heisenberg → von Weizsäcker' },
  { from: 'Q103293', to: 'Q57242', type: 'colleague', desc: 'Heisenberg → Jordan' },
  
  // Pauli connections
  { from: 'Q65989', to: 'Q84296', type: 'colleague', desc: 'Pauli ↔ Schrödinger' },
  { from: 'Q65989', to: 'Q47480', type: 'colleague', desc: 'Pauli ↔ Dirac' },
  { from: 'Q65989', to: 'Q103293', type: 'colleague', desc: 'Pauli ↔ Heisenberg' },
  { from: 'Q65989', to: 'Q9007', type: 'colleague', desc: 'Pauli ↔ Bohr' },
  
  // Schrödinger connections
  { from: 'Q84296', to: 'Q83331', type: 'influenced', desc: 'Schrödinger influenced by de Broglie' },
  { from: 'Q84296', to: 'Q47480', type: 'colleague', desc: 'Schrödinger ↔ Dirac' },
  
  // de Broglie connections
  { from: 'Q83331', to: 'Q84296', type: 'influenced', desc: 'de Broglie → Schrödinger' },
  { from: 'Q83331', to: 'Q9007', type: 'colleague', desc: 'de Broglie ↔ Bohr' },
  
  // Dirac's connections
  { from: 'Q47480', to: 'Q39246', type: 'influenced', desc: 'Dirac → Feynman' },
  { from: 'Q47480', to: 'Q132537', type: 'colleague', desc: 'Dirac ↔ Oppenheimer' },
  
  // Oppenheimer connections
  { from: 'Q132537', to: 'Q39246', type: 'teacher', desc: 'Oppenheimer → Feynman (Los Alamos)' },
  
  // Feynman's generation
  { from: 'Q39246', to: 'Q125245', type: 'colleague', desc: 'Feynman → Gell-Mann (Caltech)' },
  { from: 'Q39246', to: 'Q213926', type: 'teacher', desc: 'Feynman studied with Wheeler' },
  
  // Wheeler's students
  { from: 'Q213926', to: 'Q39246', type: 'teacher', desc: 'Wheeler → Feynman' },
  { from: 'Q213926', to: 'Q9007', type: 'colleague', desc: 'Wheeler ↔ Bohr' },
  
  // Jordan connections
  { from: 'Q57242', to: 'Q103293', type: 'colleague', desc: 'Jordan ↔ Heisenberg (matrix mechanics)' },
  { from: 'Q57242', to: 'Q65989', type: 'colleague', desc: 'Jordan ↔ Pauli' },
  { from: 'Q57242', to: 'Q37939', type: 'colleague', desc: 'Jordan ↔ Born' },
  
  // von Weizsäcker connections
  { from: 'Q57260', to: 'Q103293', type: 'colleague', desc: 'von Weizsäcker → Heisenberg' },
  
  // von Laue connections
  { from: 'Q77078', to: 'Q937', type: 'colleague', desc: 'von Laue ↔ Einstein' },
  { from: 'Q77078', to: 'Q9021', type: 'teacher', desc: 'von Laue studied with Planck' },
  
  // Debye connections
  { from: 'Q105478', to: 'Q78613', type: 'colleague', desc: 'Debye → Sommerfeld' },
  { from: 'Q105478', to: 'Q937', type: 'colleague', desc: 'Debye → Einstein' },
  
  // Yang and Lee (parity violation)
  { from: 'Q185743', to: 'Q185721', type: 'colleague', desc: 'Yang ↔ Lee (Nobel 1957)' },
  { from: 'Q185721', to: 'Q185743', type: 'colleague', desc: 'Lee ↔ Yang' },
  { from: 'Q185743', to: 'Q125245', type: 'colleague', desc: 'Yang → Gell-Mann' },
  
  // Bell and quantum foundations
  { from: 'Q309430', to: 'Q9007', type: 'influenced', desc: 'Bell influenced by Bohr debates' },
  { from: 'Q309430', to: 'Q937', type: 'influenced', desc: 'Bell influenced by Einstein' },
  
  // Aspect (Bell tests)
  { from: 'Q448174', to: 'Q309430', type: 'influenced', desc: 'Aspect tested Bell inequalities' },
  { from: 'Q448174', to: 'Q9007', type: 'influenced', desc: 'Aspect → Bohr interpretation' },
  
  // Gell-Mann connections
  { from: 'Q125245', to: 'Q39246', type: 'colleague', desc: 'Gell-Mann ↔ Feynman (Caltech)' },
  
  // von Neumann connections
  { from: 'Q17247', to: 'Q9007', type: 'colleague', desc: 'von Neumann ↔ Bohr (quantum foundations)' },
  { from: 'Q17247', to: 'Q103293', type: 'colleague', desc: 'von Neumann → Heisenberg (mathematical formalism)' },
  { from: 'Q17247', to: 'Q132537', type: 'colleague', desc: 'von Neumann → Oppenheimer (Manhattan Project)' },
];

let addedCount = 0;
let existsCount = 0;
let skippedCount = 0;

for (const rel of quantumRelations) {
  // Verify both people are in the chain
  if (!chainQids.includes(rel.from)) {
    console.log(`⚠️  ${rel.from} not in chain: ${rel.desc}`);
    skippedCount++;
    continue;
  }
  if (!chainQids.includes(rel.to)) {
    console.log(`⚠️  ${rel.to} not in chain: ${rel.desc}`);
    skippedCount++;
    continue;
  }
  
  // Initialize relations array for person if needed
  if (!relations[rel.from]) {
    relations[rel.from] = { knew: [] };
  }
  if (!relations[rel.from].knew) {
    relations[rel.from].knew = [];
  }
  
  // Check if relation already exists
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
  } else {
    existsCount++;
  }
}

// Save updated relations
fs.writeFileSync(
  path.join(__dirname, '../public/relations.json'),
  JSON.stringify(relations, null, 2)
);

console.log('\n' + '='.repeat(60));
console.log(`✨ Quantum Network Complete!`);
console.log(`   Added: ${addedCount} new relations`);
console.log(`   Already existed: ${existsCount}`);
console.log(`   Skipped (not in chain): ${skippedCount}`);
console.log('='.repeat(60));


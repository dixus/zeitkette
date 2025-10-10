const fs = require('fs');
const path = require('path');

// Load data
const people = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/people.json'), 'utf8'));
const relations = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/relations.json'), 'utf8'));

// Comprehensive quantum mechanics relations
const quantumRelations = [
  // Early foundations
  { from: 'Q9021', to: 'Q77078', type: 'teacher', desc: 'Max Planck → Max von Laue (Berlin)' },
  { from: 'Q9021', to: 'Q38096', type: 'influenced', desc: 'Max Planck → Niels Bohr (quantum theory)' },
  
  // Einstein's influence
  { from: 'Q937', to: 'Q84296', type: 'influenced', desc: 'Einstein → Schrödinger (wave mechanics)' },
  { from: 'Q937', to: 'Q38096', type: 'colleague', desc: 'Einstein ↔ Bohr (debates)' },
  { from: 'Q937', to: 'Q7186', type: 'influenced', desc: 'Einstein → de Broglie (matter waves)' },
  
  // Bohr's Copenhagen school
  { from: 'Q38096', to: 'Q103293', type: 'influenced', desc: 'Bohr → Heisenberg (uncertainty)' },
  { from: 'Q38096', to: 'Q84296', type: 'colleague', desc: 'Bohr → Schrödinger (interpretation debates)' },
  { from: 'Q38096', to: 'Q82122', type: 'influenced', desc: 'Bohr → Pauli (exclusion principle)' },
  { from: 'Q38096', to: 'Q7186', type: 'colleague', desc: 'Bohr → de Broglie' },
  
  // Sommerfeld school
  { from: 'Q78613', to: 'Q103293', type: 'teacher', desc: 'Sommerfeld → Heisenberg (Munich)' },
  { from: 'Q78613', to: 'Q82122', type: 'teacher', desc: 'Sommerfeld → Pauli (Munich)' },
  { from: 'Q78613', to: 'Q84296', type: 'influenced', desc: 'Sommerfeld → Schrödinger' },
  { from: 'Q78613', to: 'Q154675', type: 'teacher', desc: 'Sommerfeld → Bethe (Munich)' },
  
  // Heisenberg's network
  { from: 'Q103293', to: 'Q82122', type: 'colleague', desc: 'Heisenberg ↔ Pauli (matrix mechanics)' },
  { from: 'Q103293', to: 'Q84296', type: 'colleague', desc: 'Heisenberg → Schrödinger (complementarity)' },
  { from: 'Q103293', to: 'Q7186', type: 'colleague', desc: 'Heisenberg → de Broglie' },
  
  // de Broglie connections
  { from: 'Q7186', to: 'Q84296', type: 'influenced', desc: 'de Broglie → Schrödinger (wave equation inspiration)' },
  
  // Dirac's contributions
  { from: 'Q47480', to: 'Q38096', type: 'influenced', desc: 'Dirac influenced by Bohr' },
  { from: 'Q47480', to: 'Q103293', type: 'colleague', desc: 'Dirac ↔ Heisenberg' },
  { from: 'Q47480', to: 'Q84296', type: 'colleague', desc: 'Dirac ↔ Schrödinger' },
  { from: 'Q47480', to: 'Q39246', type: 'influenced', desc: 'Dirac → Oppenheimer' },
  { from: 'Q47480', to: 'Q39246', type: 'teacher', desc: 'Dirac → Feynman (QED)' },
  
  // Born's influence
  { from: 'Q58939', to: 'Q103293', type: 'teacher', desc: 'Born → Heisenberg (Göttingen)' },
  { from: 'Q58939', to: 'Q82122', type: 'colleague', desc: 'Born ↔ Pauli' },
  { from: 'Q58939', to: 'Q39246', type: 'teacher', desc: 'Born → Oppenheimer (Göttingen)' },
  { from: 'Q58939', to: 'Q84296', type: 'colleague', desc: 'Born → Schrödinger (probability interpretation)' },
  
  // Pauli connections
  { from: 'Q82122', to: 'Q84296', type: 'colleague', desc: 'Pauli ↔ Schrödinger' },
  { from: 'Q82122', to: 'Q47480', type: 'colleague', desc: 'Pauli ↔ Dirac' },
  
  // Oppenheimer's role
  { from: 'Q39246', to: 'Q39246', type: 'teacher', desc: 'Oppenheimer → Feynman (Berkeley/Los Alamos)' },
  
  // Feynman's generation
  { from: 'Q39246', to: 'Q184366', type: 'colleague', desc: 'Feynman ↔ Schwinger (QED)' },
  { from: 'Q39246', to: 'Q105667', type: 'colleague', desc: 'Feynman ↔ Tomonaga (QED, Nobel 1965)' },
  { from: 'Q184366', to: 'Q105667', type: 'colleague', desc: 'Schwinger ↔ Tomonaga (QED)' },
  
  // Modern era
  { from: 'Q39246', to: 'Q181477', type: 'influenced', desc: 'Feynman → Gell-Mann (Caltech)' },
  { from: 'Q181477', to: 'Q41453', type: 'colleague', desc: 'Gell-Mann ↔ Weinberg (particle physics)' },
  
  // John von Neumann's contributions
  { from: 'Q17455', to: 'Q38096', type: 'colleague', desc: 'von Neumann ↔ Bohr (quantum foundations)' },
  { from: 'Q17455', to: 'Q103293', type: 'colleague', desc: 'von Neumann → Heisenberg (mathematical formalism)' },
  { from: 'Q17455', to: 'Q39246', type: 'colleague', desc: 'von Neumann → Oppenheimer (Manhattan Project)' },
  
  // Bethe's network
  { from: 'Q154675', to: 'Q39246', type: 'colleague', desc: 'Bethe ↔ Oppenheimer (Los Alamos)' },
  { from: 'Q154675', to: 'Q39246', type: 'teacher', desc: 'Bethe → Feynman (Cornell)' },
  
  // Wheeler's influence
  { from: 'Q312255', to: 'Q39246', type: 'teacher', desc: 'Wheeler → Feynman (Princeton)' },
  { from: 'Q312255', to: 'Q38096', type: 'colleague', desc: 'Wheeler → Bohr' },
  
  // Wigner's contributions
  { from: 'Q78517', to: 'Q17455', type: 'colleague', desc: 'Wigner ↔ von Neumann (Princeton)' },
  { from: 'Q78517', to: 'Q82122', type: 'colleague', desc: 'Wigner → Pauli' },
  
  // Later generations
  { from: 'Q41453', to: 'Q188463', type: 'colleague', desc: 'Weinberg ↔ Glashow (electroweak)' },
  { from: 'Q41453', to: 'Q166531', type: 'colleague', desc: 'Weinberg ↔ Salam (Nobel 1979)' },
  
  // Experimental connections
  { from: 'Q9021', to: 'Q937', type: 'colleague', desc: 'Planck ↔ Einstein (Berlin)' },
  { from: 'Q84296', to: 'Q47480', type: 'colleague', desc: 'Schrödinger ↔ Dirac (wave-particle)' },
  
  // Landau's school
  { from: 'Q185145', to: 'Q38096', type: 'influenced', desc: 'Landau influenced by Bohr (Copenhagen)' },
  
  // Fermi connections
  { from: 'Q11506', to: 'Q38096', type: 'influenced', desc: 'Fermi influenced by Bohr' },
  { from: 'Q11506', to: 'Q39246', type: 'colleague', desc: 'Fermi ↔ Oppenheimer (Manhattan Project)' },
  
  // Yang-Mills
  { from: 'Q184108', to: 'Q41453', type: 'influenced', desc: 'Yang → Weinberg (gauge theory)' },
  
  // Modern connections
  { from: 'Q38096', to: 'Q312255', type: 'influenced', desc: 'Bohr → Wheeler' },
  { from: 'Q47480', to: 'Q39246', type: 'influenced', desc: 'Dirac → Feynman' },
];

let addedCount = 0;
let skippedCount = 0;

for (const rel of quantumRelations) {
  // Verify both people exist
  const fromPerson = people.find(p => p.qid === rel.from);
  const toPerson = people.find(p => p.qid === rel.to);
  
  if (!fromPerson || !toPerson) {
    console.log(`⚠️  Skipped: ${rel.desc} - Person not found`);
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
    console.log(`⏭️  Exists: ${rel.desc}`);
  }
}

// Save updated relations
fs.writeFileSync(
  path.join(__dirname, '../public/relations.json'),
  JSON.stringify(relations, null, 2)
);

console.log('\n✨ Enhancement complete!');
console.log(`Added ${addedCount} new relations`);
console.log(`Skipped ${skippedCount} (people not found)`);
console.log(`Total quantum mechanics connections now enriched`);


const fs = require('fs');

// Complete quantum mechanics dependency graph
// Based on historical teacher-student, collaboration, and influence relationships
const quantumRelations = [
  // Early Quantum Theory Foundation
  { from: 'Q9021', to: 'Q937', type: 'influenced', desc: 'Max Planck → Einstein (photoelectric effect)' },
  { from: 'Q9021', to: 'Q77078', type: 'teacher', desc: 'Max Planck → Max von Laue' },
  
  // Einstein's Influence
  { from: 'Q937', to: 'Q9047', type: 'influenced', desc: 'Einstein → Niels Bohr (atomic model)' },
  { from: 'Q937', to: 'Q83331', type: 'influenced', desc: 'Einstein → de Broglie (matter waves)' },
  { from: 'Q937', to: 'Q84296', type: 'influenced', desc: 'Einstein → Schrödinger' },
  
  // Sommerfeld School (Munich)
  { from: 'Q78613', to: 'Q65989', type: 'teacher', desc: 'Arnold Sommerfeld → Wolfgang Pauli' },
  { from: 'Q78613', to: 'Q103293', type: 'teacher', desc: 'Arnold Sommerfeld → Werner Heisenberg' },
  { from: 'Q78613', to: 'Q105478', type: 'teacher', desc: 'Arnold Sommerfeld → Peter Debye' },
  { from: 'Q78613', to: 'Q77078', type: 'contemporary', desc: 'Sommerfeld ↔ Max von Laue' },
  
  // Bohr's Copenhagen School
  { from: 'Q9047', to: 'Q103293', type: 'teacher', desc: 'Niels Bohr → Werner Heisenberg' },
  { from: 'Q9047', to: 'Q65989', type: 'collaborated', desc: 'Bohr collaborated with Pauli' },
  { from: 'Q9047', to: 'Q47480', type: 'influenced', desc: 'Bohr → Paul Dirac' },
  
  // De Broglie's Wave Mechanics
  { from: 'Q83331', to: 'Q84296', type: 'influenced', desc: 'de Broglie → Schrödinger (wave equation)' },
  
  // Heisenberg's Matrix Mechanics
  { from: 'Q103293', to: 'Q65989', type: 'collaborated', desc: 'Heisenberg ↔ Pauli (matrix mechanics)' },
  { from: 'Q103293', to: 'Q47480', type: 'contemporary', desc: 'Heisenberg ↔ Dirac' },
  
  // Pauli's Contributions
  { from: 'Q65989', to: 'Q47480', type: 'collaborated', desc: 'Pauli ↔ Dirac' },
  
  // Schrödinger's Wave Mechanics
  { from: 'Q84296', to: 'Q47480', type: 'contemporary', desc: 'Schrödinger ↔ Dirac (equivalent formulations)' },
  
  // Dirac's Synthesis
  { from: 'Q47480', to: 'Q39246', type: 'influenced', desc: 'Dirac → Richard Feynman' },
  { from: 'Q47480', to: 'Q123280', type: 'influenced', desc: 'Dirac → Francis Crick (methodology)' },
  
  // Born's Probability Interpretation
  { from: 'Q37939', to: 'Q103293', type: 'collaborated', desc: 'Max Born → Heisenberg' },
  { from: 'Q37939', to: 'Q65989', type: 'collaborated', desc: 'Max Born → Pauli' },
  { from: 'Q37939', to: 'Q132537', type: 'teacher', desc: 'Max Born → J. Robert Oppenheimer' },
  
  // Quantum Electrodynamics (QED)
  { from: 'Q39246', to: 'Q125245', type: 'collaborated', desc: 'Feynman ↔ Murray Gell-Mann' },
  { from: 'Q132537', to: 'Q39246', type: 'teacher', desc: 'Oppenheimer → Feynman' },
  
  // Experimental Quantum Physics
  { from: 'Q131729', to: 'Q123280', type: 'collaborated', desc: 'W.L. Bragg → Crick (X-ray crystallography)' },
  { from: 'Q131729', to: 'Q7487', type: 'influenced', desc: 'Bragg → Dorothy Hodgkin' },
  
  // Statistical Mechanics & Quantum
  { from: 'Q84296', to: 'Q39246', type: 'influenced', desc: 'Schrödinger → Feynman' },
  
  // Quantum Field Theory
  { from: 'Q39246', to: 'Q188620', type: 'influenced', desc: 'Feynman → Steven Weinberg' },
  { from: 'Q47480', to: 'Q188620', type: 'influenced', desc: 'Dirac → Weinberg' },
  
  // Later Quantum Theory
  { from: 'Q39246', to: 'Q213926', type: 'influenced', desc: 'Feynman → John Wheeler' },
  { from: 'Q103293', to: 'Q57260', type: 'influenced', desc: 'Heisenberg → Carl Friedrich von Weizsäcker' },
  
  // Quantum Chemistry
  { from: 'Q65989', to: 'Q48983', type: 'influenced', desc: 'Pauli → Linus Pauling (quantum chemistry)' },
  
  // Philosophy of Quantum Mechanics
  { from: 'Q9047', to: 'Q937', type: 'debated', desc: 'Bohr ↔ Einstein (Copenhagen vs. realism)' },
  { from: 'Q103293', to: 'Q84296', type: 'debated', desc: 'Heisenberg ↔ Schrödinger (matrix vs. wave)' }
];

function loadPeople() {
  return JSON.parse(fs.readFileSync('./public/people.json', 'utf8'));
}

function loadRelations() {
  return JSON.parse(fs.readFileSync('./public/relations.json', 'utf8'));
}

function saveRelations(relations) {
  fs.writeFileSync('./public/relations.json', JSON.stringify(relations, null, 2));
  fs.writeFileSync('./public/relations.json', JSON.stringify(relations, null, 2));
}

function main() {
  const people = loadPeople();
  const relations = loadRelations();
  const qidToName = new Map(people.map(p => [p.qid, p.name]));
  const qids = new Set(people.map(p => p.qid));
  
  let added = 0;
  let skippedMissing = 0;
  let skippedDuplicate = 0;
  
  console.log('=== Adding Quantum Mechanics Dependency Chain ===\n');
  
  for (const rel of quantumRelations) {
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
  console.log(`Added: ${added} quantum mechanics relations`);
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


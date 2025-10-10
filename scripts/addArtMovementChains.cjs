const fs = require('fs');

// Art History - From Renaissance to Modern Art
const artFigures = [
  // Proto-Renaissance & Early Renaissance
  { name: 'Giotto di Bondone', qid: 'Q7814', born: 1267, died: 1337, domains: ['Art'], region: 'IT', sitelinks: 120 },
  { name: 'Masaccio', qid: 'Q5811', born: 1401, died: 1428, domains: ['Art'], region: 'IT', sitelinks: 100 },
  { name: 'Fra Angelico', qid: 'Q5432', born: 1395, died: 1455, domains: ['Art'], region: 'IT', sitelinks: 100 },
  { name: 'Piero della Francesca', qid: 'Q5602', born: 1415, died: 1492, domains: ['Art'], region: 'IT', sitelinks: 105 },
  { name: 'Sandro Botticelli', qid: 'Q5669', born: 1445, died: 1510, domains: ['Art'], region: 'IT', sitelinks: 125 },
  
  // High Renaissance
  { name: 'Raphael', qid: 'Q5597', born: 1483, died: 1520, domains: ['Art'], region: 'IT', sitelinks: 135 },
  { name: 'Titian', qid: 'Q47551', born: 1488, died: 1576, domains: ['Art'], region: 'IT', sitelinks: 120 },
  
  // Baroque
  { name: 'Caravaggio', qid: 'Q42207', born: 1571, died: 1610, domains: ['Art'], region: 'IT', sitelinks: 130 },
  { name: 'Peter Paul Rubens', qid: 'Q5599', born: 1577, died: 1640, domains: ['Art'], region: 'BE', sitelinks: 130 },
  { name: 'Diego Velázquez', qid: 'Q297', born: 1599, died: 1660, domains: ['Art'], region: 'ES', sitelinks: 130 },
  { name: 'Johannes Vermeer', qid: 'Q41264', born: 1632, died: 1675, domains: ['Art'], region: 'NL', sitelinks: 135 },
  
  // Rococo
  { name: 'Antoine Watteau', qid: 'Q183221', born: 1684, died: 1721, domains: ['Art'], region: 'FR', sitelinks: 95 },
  { name: 'François Boucher', qid: 'Q180932', born: 1703, died: 1770, domains: ['Art'], region: 'FR', sitelinks: 95 },
  { name: 'Jean-Honoré Fragonard', qid: 'Q127171', born: 1732, died: 1806, domains: ['Art'], region: 'FR', sitelinks: 95 },
  
  // Neoclassicism & Romanticism
  { name: 'Jacques-Louis David', qid: 'Q83155', born: 1748, died: 1825, domains: ['Art'], region: 'FR', sitelinks: 110 },
  { name: 'J.M.W. Turner', qid: 'Q159758', born: 1775, died: 1851, domains: ['Art'], region: 'GB', sitelinks: 115 },
  { name: 'John Constable', qid: 'Q159297', born: 1776, died: 1837, domains: ['Art'], region: 'GB', sitelinks: 105 },
  { name: 'Caspar David Friedrich', qid: 'Q104884', born: 1774, died: 1840, domains: ['Art'], region: 'DE', sitelinks: 110 },
  { name: 'Eugène Delacroix', qid: 'Q33477', born: 1798, died: 1863, domains: ['Art'], region: 'FR', sitelinks: 115 },
  { name: 'Jean-Auguste-Dominique Ingres', qid: 'Q23380', born: 1780, died: 1867, domains: ['Art'], region: 'FR', sitelinks: 100 },
  
  // Realism
  { name: 'Gustave Courbet', qid: 'Q34618', born: 1819, died: 1877, domains: ['Art'], region: 'FR', sitelinks: 110 },
  { name: 'Jean-François Millet', qid: 'Q148458', born: 1814, died: 1875, domains: ['Art'], region: 'FR', sitelinks: 95 },
  { name: 'Honoré Daumier', qid: 'Q187506', born: 1808, died: 1879, domains: ['Art'], region: 'FR', sitelinks: 100 },
  
  // Impressionism (The Golden Chain!)
  { name: 'Édouard Manet', qid: 'Q40599', born: 1832, died: 1883, domains: ['Art'], region: 'FR', sitelinks: 125 },
  { name: 'Edgar Degas', qid: 'Q46373', born: 1834, died: 1917, domains: ['Art'], region: 'FR', sitelinks: 120 },
  { name: 'Paul Cézanne', qid: 'Q35548', born: 1839, died: 1906, domains: ['Art'], region: 'FR', sitelinks: 130 },
  { name: 'Auguste Rodin', qid: 'Q30755', born: 1840, died: 1917, domains: ['Art'], region: 'FR', sitelinks: 130 },
  { name: 'Berthe Morisot', qid: 'Q105320', born: 1841, died: 1895, domains: ['Art'], region: 'FR', sitelinks: 95 },
  { name: 'Mary Cassatt', qid: 'Q173223', born: 1844, died: 1926, domains: ['Art'], region: 'US', sitelinks: 100 },
  { name: 'Paul Gauguin', qid: 'Q37693', born: 1848, died: 1903, domains: ['Art'], region: 'FR', sitelinks: 130 },
  { name: 'Georges Seurat', qid: 'Q34013', born: 1859, died: 1891, domains: ['Art'], region: 'FR', sitelinks: 110 },
  { name: 'Henri de Toulouse-Lautrec', qid: 'Q82445', born: 1864, died: 1901, domains: ['Art'], region: 'FR', sitelinks: 115 },
  
  // Post-Impressionism
  { name: 'Odilon Redon', qid: 'Q154349', born: 1840, died: 1916, domains: ['Art'], region: 'FR', sitelinks: 90 },
  { name: 'Pierre Bonnard', qid: 'Q33692', born: 1867, died: 1947, domains: ['Art'], region: 'FR', sitelinks: 100 },
  { name: 'Édouard Vuillard', qid: 'Q239394', born: 1868, died: 1940, domains: ['Art'], region: 'FR', sitelinks: 90 },
  
  // Fauvism & Expressionism
  { name: 'Henri Matisse', qid: 'Q5592', born: 1869, died: 1954, domains: ['Art'], region: 'FR', sitelinks: 140 },
  { name: 'André Derain', qid: 'Q156272', born: 1880, died: 1954, domains: ['Art'], region: 'FR', sitelinks: 95 },
  { name: 'Maurice de Vlaminck', qid: 'Q241098', born: 1876, died: 1958, domains: ['Art'], region: 'FR', sitelinks: 85 },
  { name: 'Edvard Munch', qid: 'Q41406', born: 1863, died: 1944, domains: ['Art'], region: 'NO', sitelinks: 125 },
  { name: 'Egon Schiele', qid: 'Q44032', born: 1890, died: 1918, domains: ['Art'], region: 'AT', sitelinks: 110 },
  
  // Cubism & Modern
  { name: 'Georges Braque', qid: 'Q34853', born: 1882, died: 1963, domains: ['Art'], region: 'FR', sitelinks: 115 },
  { name: 'Juan Gris', qid: 'Q151152', born: 1887, died: 1927, domains: ['Art'], region: 'ES', sitelinks: 90 },
  { name: 'Fernand Léger', qid: 'Q160057', born: 1881, died: 1955, domains: ['Art'], region: 'FR', sitelinks: 100 },
  
  // Surrealism
  { name: 'René Magritte', qid: 'Q7836', born: 1898, died: 1967, domains: ['Art'], region: 'BE', sitelinks: 120 },
  { name: 'Max Ernst', qid: 'Q154842', born: 1891, died: 1976, domains: ['Art'], region: 'DE', sitelinks: 105 },
  { name: 'Joan Miró', qid: 'Q152384', born: 1893, died: 1983, domains: ['Art'], region: 'ES', sitelinks: 115 },
  
  // Abstract Expressionism
  { name: 'Mark Rothko', qid: 'Q48188', born: 1903, died: 1970, domains: ['Art'], region: 'US', sitelinks: 110 },
  { name: 'Willem de Kooning', qid: 'Q132305', born: 1904, died: 1997, domains: ['Art'], region: 'NL', sitelinks: 105 },
  { name: 'Franz Kline', qid: 'Q473568', born: 1910, died: 1962, domains: ['Art'], region: 'US', sitelinks: 85 },
  
  // Pop Art
  { name: 'Roy Lichtenstein', qid: 'Q151679', born: 1923, died: 1997, domains: ['Art'], region: 'US', sitelinks: 110 },
  { name: 'Jasper Johns', qid: 'Q155057', born: 1930, died: null, domains: ['Art'], region: 'US', sitelinks: 100 },
  { name: 'Robert Rauschenberg', qid: 'Q164358', born: 1925, died: 2008, domains: ['Art'], region: 'US', sitelinks: 100 },
];

// Art Movement dependency graph
const artRelations = [
  // Renaissance foundations
  { from: 'Q7814', to: 'Q5811', type: 'influenced', desc: 'Giotto → Masaccio (perspective revolution)' },
  { from: 'Q5811', to: 'Q5432', type: 'contemporary', desc: 'Masaccio ↔ Fra Angelico' },
  { from: 'Q5811', to: 'Q5602', type: 'influenced', desc: 'Masaccio → Piero della Francesca' },
  { from: 'Q5602', to: 'Q762', type: 'influenced', desc: 'Piero → Leonardo (perspective)' },
  { from: 'Q762', to: 'Q5597', type: 'teacher', desc: 'Leonardo → Raphael (influenced)' },
  { from: 'Q5669', to: 'Q5597', type: 'influenced', desc: 'Botticelli → Raphael' },
  { from: 'Q762', to: 'Q5592', type: 'influenced', desc: 'Leonardo → Michelangelo (anatomy)' },
  { from: 'Q5597', to: 'Q47551', type: 'contemporary', desc: 'Raphael ↔ Titian' },
  
  // Baroque masters
  { from: 'Q5592', to: 'Q42207', type: 'influenced', desc: 'Michelangelo → Caravaggio (chiaroscuro)' },
  { from: 'Q47551', to: 'Q42207', type: 'influenced', desc: 'Titian → Caravaggio (color)' },
  { from: 'Q42207', to: 'Q5599', type: 'influenced', desc: 'Caravaggio → Rubens (dramatic light)' },
  { from: 'Q5599', to: 'Q297', type: 'influenced', desc: 'Rubens → Velázquez' },
  { from: 'Q42207', to: 'Q297', type: 'influenced', desc: 'Caravaggio → Velázquez (naturalism)' },
  { from: 'Q297', to: 'Q41264', type: 'influenced', desc: 'Velázquez → Vermeer (light)' },
  
  // Rococo
  { from: 'Q183221', to: 'Q180932', type: 'influenced', desc: 'Watteau → Boucher (rococo style)' },
  { from: 'Q180932', to: 'Q127171', type: 'teacher', desc: 'Boucher → Fragonard (student)' },
  
  // Neoclassicism
  { from: 'Q5599', to: 'Q83155', type: 'influenced', desc: 'Rubens → David (studied)' },
  
  // Romanticism
  { from: 'Q83155', to: 'Q33477', type: 'teacher', desc: 'David → Delacroix (trained with)' },
  { from: 'Q159758', to: 'Q159297', type: 'contemporary', desc: 'Turner ↔ Constable (English landscape)' },
  { from: 'Q159758', to: 'Q40599', type: 'influenced', desc: 'Turner → Manet (light, color)' },
  { from: 'Q104884', to: 'Q159758', type: 'contemporary', desc: 'Friedrich ↔ Turner (romantic landscape)' },
  
  // Realism
  { from: 'Q33477', to: 'Q34618', type: 'influenced', desc: 'Delacroix → Courbet' },
  { from: 'Q34618', to: 'Q40599', type: 'influenced', desc: 'Courbet → Manet (realism to impressionism)' },
  { from: 'Q148458', to: 'Q37693', type: 'influenced', desc: 'Millet → Gauguin (rural themes)' },
  
  // Birth of Impressionism
  { from: 'Q40599', to: 'Q296', type: 'influenced', desc: 'Manet → Claude Monet (father of impressionism)' },
  { from: 'Q40599', to: 'Q5593', type: 'influenced', desc: 'Manet → Pierre-Auguste Renoir' },
  { from: 'Q40599', to: 'Q46373', type: 'influenced', desc: 'Manet → Degas' },
  { from: 'Q40599', to: 'Q105320', type: 'influenced', desc: 'Manet → Berthe Morisot' },
  { from: 'Q296', to: 'Q5593', type: 'collaborated', desc: 'Monet ↔ Renoir (painted together)' },
  { from: 'Q296', to: 'Q105320', type: 'collaborated', desc: 'Monet ↔ Morisot' },
  
  // Impressionist circle
  { from: 'Q46373', to: 'Q173223', type: 'mentored', desc: 'Degas → Mary Cassatt' },
  { from: 'Q5593', to: 'Q35548', type: 'influenced', desc: 'Renoir → Cézanne (studied together)' },
  { from: 'Q296', to: 'Q35548', type: 'contemporary', desc: 'Monet ↔ Cézanne' },
  
  // Post-Impressionism
  { from: 'Q35548', to: 'Q5582', type: 'influenced', desc: 'Cézanne → Picasso (structure, form)' },
  { from: 'Q35548', to: 'Q5592', type: 'influenced', desc: 'Cézanne → Matisse (color, structure)' },
  { from: 'Q296', to: 'Q5580', type: 'influenced', desc: 'Monet → Van Gogh (color)' },
  { from: 'Q5593', to: 'Q30755', type: 'contemporary', desc: 'Renoir ↔ Rodin (sculpture)' },
  { from: 'Q5580', to: 'Q37693', type: 'influenced', desc: 'Van Gogh → Gauguin (lived together)' },
  { from: 'Q37693', to: 'Q5592', type: 'influenced', desc: 'Gauguin → Matisse (color theory)' },
  { from: 'Q34013', to: 'Q5582', type: 'influenced', desc: 'Seurat → Picasso (composition)' },
  
  // Fauvism
  { from: 'Q5592', to: 'Q156272', type: 'teacher', desc: 'Matisse → Derain (fauvist leader)' },
  { from: 'Q5592', to: 'Q241098', type: 'influenced', desc: 'Matisse → Vlaminck (fauvism)' },
  { from: 'Q37693', to: 'Q5592', type: 'influenced', desc: 'Gauguin → Matisse (primitivism)' },
  
  // Expressionism
  { from: 'Q5580', to: 'Q41406', type: 'influenced', desc: 'Van Gogh → Munch (emotional intensity)' },
  { from: 'Q41406', to: 'Q44032', type: 'influenced', desc: 'Munch → Schiele (expressionism)' },
  
  // Cubism
  { from: 'Q35548', to: 'Q5582', type: 'influenced', desc: 'Cézanne → Picasso (analytical cubism)' },
  { from: 'Q5582', to: 'Q34853', type: 'collaborated', desc: 'Picasso ↔ Braque (invented cubism)' },
  { from: 'Q5582', to: 'Q151152', type: 'influenced', desc: 'Picasso → Juan Gris' },
  { from: 'Q34853', to: 'Q160057', type: 'influenced', desc: 'Braque → Léger' },
  
  // Surrealism
  { from: 'Q5582', to: 'Q5589', type: 'influenced', desc: 'Picasso → Dalí (surrealist phase)' },
  { from: 'Q5589', to: 'Q7836', type: 'contemporary', desc: 'Dalí ↔ Magritte (surrealism)' },
  { from: 'Q5589', to: 'Q154842', type: 'contemporary', desc: 'Dalí ↔ Max Ernst' },
  { from: 'Q5589', to: 'Q152384', type: 'influenced', desc: 'Dalí → Miró (surrealist movement)' },
  
  // Abstract Expressionism
  { from: 'Q5582', to: 'Q7920', type: 'influenced', desc: 'Picasso → Pollock' },
  { from: 'Q5592', to: 'Q48188', type: 'influenced', desc: 'Matisse → Rothko (color fields)' },
  { from: 'Q7920', to: 'Q132305', type: 'contemporary', desc: 'Pollock ↔ de Kooning (abstract expressionism)' },
  { from: 'Q7920', to: 'Q473568', type: 'influenced', desc: 'Pollock → Kline' },
  
  // Pop Art
  { from: 'Q5582', to: 'Q5603', type: 'influenced', desc: 'Picasso → Warhol (mass culture)' },
  { from: 'Q5603', to: 'Q151679', type: 'contemporary', desc: 'Warhol ↔ Lichtenstein (pop art)' },
  { from: 'Q5603', to: 'Q155057', type: 'contemporary', desc: 'Warhol ↔ Jasper Johns' },
  { from: 'Q7920', to: 'Q164358', type: 'influenced', desc: 'Pollock → Rauschenberg' },
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

function saveRelations(relations) {
  fs.writeFileSync('./data/relations.json', JSON.stringify(relations, null, 2));
  fs.writeFileSync('./public/relations.json', JSON.stringify(relations, null, 2));
}

function main() {
  console.log('=== Adding Art History Figures ===\n');
  
  // First, add missing people
  let people = loadPeople();
  const existingQids = new Set(people.map(p => p.qid));
  
  const toAdd = [];
  for (const artist of artFigures) {
    if (existingQids.has(artist.qid)) {
      console.log(`⚠️  Already exists: ${artist.name}`);
      continue;
    }
    toAdd.push(artist);
    console.log(`✅ Adding: ${artist.name}`);
    existingQids.add(artist.qid);
  }
  
  if (toAdd.length > 0) {
    console.log(`\nAdding ${toAdd.length} art history figures`);
    people = [...people, ...toAdd];
    savePeople(people);
    console.log(`Total people: ${people.length}\n`);
  }
  
  // Now add relations
  console.log('=== Adding Art Movement Dependency Chain ===\n');
  
  const relations = loadRelations();
  const qidToName = new Map(people.map(p => [p.qid, p.name]));
  const qids = new Set(people.map(p => p.qid));
  
  let added = 0;
  let skippedMissing = 0;
  let skippedDuplicate = 0;
  
  for (const rel of artRelations) {
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
  console.log(`Added: ${added} art movement relations`);
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


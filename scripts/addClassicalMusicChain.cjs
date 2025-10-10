const fs = require('fs');

// Classical Music Composers - Complete lineage and influence network
const musicFigures = [
  // Baroque masters
  { name: 'Claudio Monteverdi', qid: 'Q53068', born: 1567, died: 1643, domains: ['Music'], region: 'IT', sitelinks: 105 },
  { name: 'Heinrich Schütz', qid: 'Q153643', born: 1585, died: 1672, domains: ['Music'], region: 'DE', sitelinks: 85 },
  { name: 'Jean-Baptiste Lully', qid: 'Q1192', born: 1632, died: 1687, domains: ['Music'], region: 'IT', sitelinks: 95 },
  { name: 'Henry Purcell', qid: 'Q5939', born: 1659, died: 1695, domains: ['Music'], region: 'GB', sitelinks: 100 },
  { name: 'Arcangelo Corelli', qid: 'Q180578', born: 1653, died: 1713, domains: ['Music'], region: 'IT', sitelinks: 90 },
  { name: 'Antonio Vivaldi', qid: 'Q1340', born: 1678, died: 1741, domains: ['Music'], region: 'IT', sitelinks: 125 },
  { name: 'Domenico Scarlatti', qid: 'Q191526', born: 1685, died: 1757, domains: ['Music'], region: 'IT', sitelinks: 95 },
  { name: 'Georg Philipp Telemann', qid: 'Q57282', born: 1681, died: 1767, domains: ['Music'], region: 'DE', sitelinks: 90 },
  
  // Classical period
  { name: 'Christoph Willibald Gluck', qid: 'Q41055', born: 1714, died: 1787, domains: ['Music'], region: 'DE', sitelinks: 95 },
  { name: 'Carl Philipp Emanuel Bach', qid: 'Q76428', born: 1714, died: 1788, domains: ['Music'], region: 'DE', sitelinks: 90 },
  { name: 'Joseph Haydn', qid: 'Q7349', born: 1732, died: 1809, domains: ['Music'], region: 'AT', sitelinks: 125 },
  { name: 'Luigi Boccherini', qid: 'Q309728', born: 1743, died: 1805, domains: ['Music'], region: 'IT', sitelinks: 85 },
  { name: 'Antonio Salieri', qid: 'Q51088', born: 1750, died: 1825, domains: ['Music'], region: 'IT', sitelinks: 100 },
  
  // Romantic period
  { name: 'Carl Maria von Weber', qid: 'Q154812', born: 1786, died: 1826, domains: ['Music'], region: 'DE', sitelinks: 100 },
  { name: 'Gioachino Rossini', qid: 'Q9726', born: 1792, died: 1868, domains: ['Music'], region: 'IT', sitelinks: 115 },
  { name: 'Franz Schubert', qid: 'Q7312', born: 1797, died: 1828, domains: ['Music'], region: 'AT', sitelinks: 130 },
  { name: 'Hector Berlioz', qid: 'Q1103', born: 1803, died: 1869, domains: ['Music'], region: 'FR', sitelinks: 105 },
  { name: 'Felix Mendelssohn', qid: 'Q46096', born: 1809, died: 1847, domains: ['Music'], region: 'DE', sitelinks: 115 },
  { name: 'Frédéric Chopin', qid: 'Q1268', born: 1810, died: 1849, domains: ['Music'], region: 'PL', sitelinks: 140 },
  { name: 'Robert Schumann', qid: 'Q7351', born: 1810, died: 1856, domains: ['Music'], region: 'DE', sitelinks: 115 },
  { name: 'Franz Liszt', qid: 'Q41309', born: 1811, died: 1886, domains: ['Music'], region: 'HU', sitelinks: 130 },
  { name: 'Giuseppe Verdi', qid: 'Q7317', born: 1813, died: 1901, domains: ['Music'], region: 'IT', sitelinks: 130 },
  { name: 'Anton Bruckner', qid: 'Q81752', born: 1824, died: 1896, domains: ['Music'], region: 'AT', sitelinks: 100 },
  { name: 'Johannes Brahms', qid: 'Q7294', born: 1833, died: 1897, domains: ['Music'], region: 'DE', sitelinks: 125 },
  { name: 'Camille Saint-Saëns', qid: 'Q193691', born: 1835, died: 1921, domains: ['Music'], region: 'FR', sitelinks: 105 },
  { name: 'Max Bruch', qid: 'Q57286', born: 1838, died: 1920, domains: ['Music'], region: 'DE', sitelinks: 90 },
  { name: 'Modest Mussorgsky', qid: 'Q132682', born: 1839, died: 1881, domains: ['Music'], region: 'RU', sitelinks: 105 },
  { name: 'Antonín Dvořák', qid: 'Q7298', born: 1841, died: 1904, domains: ['Music'], region: 'CZ', sitelinks: 115 },
  { name: 'Edvard Grieg', qid: 'Q80621', born: 1843, died: 1907, domains: ['Music'], region: 'NO', sitelinks: 110 },
  { name: 'Nikolai Rimsky-Korsakov', qid: 'Q93188', born: 1844, died: 1908, domains: ['Music'], region: 'RU', sitelinks: 105 },
  { name: 'Gabriel Fauré', qid: 'Q104919', born: 1845, died: 1924, domains: ['Music'], region: 'FR', sitelinks: 95 },
  { name: 'Giacomo Puccini', qid: 'Q7311', born: 1858, died: 1924, domains: ['Music'], region: 'IT', sitelinks: 120 },
  { name: 'Gustav Mahler', qid: 'Q7304', born: 1860, died: 1911, domains: ['Music'], region: 'AT', sitelinks: 125 },
  { name: 'Claude Debussy', qid: 'Q4700', born: 1862, died: 1918, domains: ['Music'], region: 'FR', sitelinks: 130 },
  { name: 'Jean Sibelius', qid: 'Q83087', born: 1865, died: 1957, domains: ['Music'], region: 'FI', sitelinks: 110 },
  { name: 'Sergei Rachmaninoff', qid: 'Q131407', born: 1873, died: 1943, domains: ['Music'], region: 'RU', sitelinks: 115 },
  
  // 20th century
  { name: 'Maurice Ravel', qid: 'Q1178', born: 1875, died: 1937, domains: ['Music'], region: 'FR', sitelinks: 125 },
  { name: 'Béla Bartók', qid: 'Q83326', born: 1881, died: 1945, domains: ['Music'], region: 'HU', sitelinks: 110 },
  { name: 'Alban Berg', qid: 'Q78476', born: 1885, died: 1935, domains: ['Music'], region: 'AT', sitelinks: 100 },
  { name: 'Sergei Prokofiev', qid: 'Q131180', born: 1891, died: 1953, domains: ['Music'], region: 'RU', sitelinks: 115 },
  { name: 'Paul Hindemith', qid: 'Q151504', born: 1895, died: 1963, domains: ['Music'], region: 'DE', sitelinks: 95 },
  { name: 'George Gershwin', qid: 'Q123829', born: 1898, died: 1937, domains: ['Music'], region: 'US', sitelinks: 125 },
  { name: 'Aaron Copland', qid: 'Q192178', born: 1900, died: 1990, domains: ['Music'], region: 'US', sitelinks: 100 },
  { name: 'Dmitri Shostakovich', qid: 'Q76364', born: 1906, died: 1975, domains: ['Music'], region: 'RU', sitelinks: 120 },
  { name: 'Benjamin Britten', qid: 'Q133686', born: 1913, died: 1976, domains: ['Music'], region: 'GB', sitelinks: 105 },
  { name: 'Leonard Bernstein', qid: 'Q152505', born: 1918, died: 1990, domains: ['Music'], region: 'US', sitelinks: 115 },
  { name: 'Pierre Boulez', qid: 'Q152158', born: 1925, died: 2016, domains: ['Music'], region: 'FR', sitelinks: 100 },
  { name: 'Karlheinz Stockhausen', qid: 'Q154556', born: 1928, died: 2007, domains: ['Music'], region: 'DE', sitelinks: 95 },
  { name: 'John Williams', qid: 'Q156803', born: 1932, died: null, domains: ['Music'], region: 'US', sitelinks: 120 },
  { name: 'Philip Glass', qid: 'Q193234', born: 1937, died: null, domains: ['Music'], region: 'US', sitelinks: 110 },
];

// Classical Music dependency graph
const musicRelations = [
  // Early Baroque influence
  { from: 'Q53068', to: 'Q153643', type: 'influenced', desc: 'Monteverdi → Schütz (opera to German sacred)' },
  { from: 'Q53068', to: 'Q1192', type: 'influenced', desc: 'Monteverdi → Lully (opera development)' },
  
  // Baroque masters
  { from: 'Q180578', to: 'Q1340', type: 'influenced', desc: 'Corelli → Vivaldi (concerto form)' },
  { from: 'Q1340', to: 'Q1339', type: 'influenced', desc: 'Vivaldi → J.S. Bach (concerto style)' },
  { from: 'Q1340', to: 'Q7302', type: 'influenced', desc: 'Vivaldi → Handel (Baroque style)' },
  { from: 'Q57282', to: 'Q1339', type: 'contemporary', desc: 'Telemann ↔ Bach (friends, colleagues)' },
  { from: 'Q191526', to: 'Q7312', type: 'influenced', desc: 'D. Scarlatti → Schubert (keyboard works)' },
  
  // Bach's legacy
  { from: 'Q1339', to: 'Q76428', type: 'teacher', desc: 'J.S. Bach → C.P.E. Bach (son)' },
  { from: 'Q1339', to: 'Q7349', type: 'influenced', desc: 'Bach → Haydn (counterpoint)' },
  { from: 'Q1339', to: 'Q255', type: 'influenced', desc: 'Bach → Mozart (studied fugues)' },
  { from: 'Q1339', to: 'Q7294', type: 'influenced', desc: 'Bach → Brahms (studied deeply)' },
  
  // Handel influence
  { from: 'Q7302', to: 'Q41055', type: 'influenced', desc: 'Handel → Gluck (opera reform)' },
  { from: 'Q7302', to: 'Q255', type: 'influenced', desc: 'Handel → Mozart (oratorio style)' },
  
  // Classical Vienna School
  { from: 'Q76428', to: 'Q7349', type: 'influenced', desc: 'C.P.E. Bach → Haydn (sonata form)' },
  { from: 'Q7349', to: 'Q255', type: 'teacher', desc: 'Haydn → Mozart (early influence)' },
  { from: 'Q255', to: 'Q254', type: 'teacher', desc: 'Mozart → Beethoven (lessons)' },
  { from: 'Q7349', to: 'Q254', type: 'teacher', desc: 'Haydn → Beethoven (student)' },
  { from: 'Q51088', to: 'Q254', type: 'teacher', desc: 'Salieri → Beethoven (counterpoint)' },
  { from: 'Q51088', to: 'Q7312', type: 'teacher', desc: 'Salieri → Schubert (composition)' },
  
  // Beethoven's massive influence
  { from: 'Q254', to: 'Q7312', type: 'influenced', desc: 'Beethoven → Schubert (symphonic form)' },
  { from: 'Q254', to: 'Q7294', type: 'influenced', desc: 'Beethoven → Brahms (symphonic tradition)' },
  { from: 'Q254', to: 'Q1511', type: 'influenced', desc: 'Beethoven → Wagner (drama, development)' },
  { from: 'Q254', to: 'Q81752', type: 'influenced', desc: 'Beethoven → Bruckner (symphonic scope)' },
  { from: 'Q254', to: 'Q7304', type: 'influenced', desc: 'Beethoven → Mahler (symphonic expansion)' },
  
  // Romantic generation
  { from: 'Q154812', to: 'Q1511', type: 'influenced', desc: 'Weber → Wagner (German opera)' },
  { from: 'Q7312', to: 'Q7294', type: 'influenced', desc: 'Schubert → Brahms (lieder tradition)' },
  { from: 'Q46096', to: 'Q7351', type: 'influenced', desc: 'Mendelssohn → Schumann' },
  { from: 'Q7351', to: 'Q7294', type: 'influenced', desc: 'Schumann → Brahms (mentored)' },
  { from: 'Q1268', to: 'Q41309', type: 'contemporary', desc: 'Chopin ↔ Liszt (piano virtuosos)' },
  { from: 'Q41309', to: 'Q1511', type: 'influenced', desc: 'Liszt → Wagner (harmonic innovation)' },
  
  // Wagner vs Brahms schools
  { from: 'Q1511', to: 'Q81752', type: 'influenced', desc: 'Wagner → Bruckner (orchestration)' },
  { from: 'Q1511', to: 'Q7304', type: 'influenced', desc: 'Wagner → Mahler (music drama)' },
  { from: 'Q1511', to: 'Q7315', type: 'influenced', desc: 'Wagner → Richard Strauss' },
  { from: 'Q7294', to: 'Q193691', type: 'contemporary', desc: 'Brahms ↔ Saint-Saëns' },
  { from: 'Q7294', to: 'Q7298', type: 'mentored', desc: 'Brahms → Dvořák (supported)' },
  
  // National schools
  { from: 'Q132682', to: 'Q93188', type: 'influenced', desc: 'Mussorgsky → Rimsky-Korsakov (Russian)' },
  { from: 'Q93188', to: 'Q131180', type: 'influenced', desc: 'Rimsky-Korsakov → Prokofiev' },
  { from: 'Q93188', to: 'Q76364', type: 'influenced', desc: 'Rimsky-Korsakov → Shostakovich (Russian tradition)' },
  
  // Late Romantic to Modern
  { from: 'Q7304', to: 'Q78476', type: 'influenced', desc: 'Mahler → Berg (orchestration)' },
  { from: 'Q7304', to: 'Q81752', type: 'conductor of', desc: 'Mahler conducted Bruckner' },
  { from: 'Q7315', to: 'Q78476', type: 'contemporary', desc: 'R. Strauss ↔ Berg' },
  
  // French Impressionism
  { from: 'Q104919', to: 'Q4700', type: 'influenced', desc: 'Fauré → Debussy' },
  { from: 'Q4700', to: 'Q1178', type: 'influenced', desc: 'Debussy → Ravel (impressionism)' },
  { from: 'Q1178', to: 'Q152158', type: 'influenced', desc: 'Ravel → Boulez' },
  
  // 20th century modernism
  { from: 'Q83326', to: 'Q151504', type: 'contemporary', desc: 'Bartók ↔ Hindemith' },
  { from: 'Q131180', to: 'Q76364', type: 'influenced', desc: 'Prokofiev → Shostakovich' },
  { from: 'Q133686', to: 'Q152505', type: 'contemporary', desc: 'Britten ↔ Bernstein' },
  { from: 'Q152158', to: 'Q154556', type: 'contemporary', desc: 'Boulez ↔ Stockhausen (avant-garde)' },
  
  // Film/minimalism
  { from: 'Q152505', to: 'Q156803', type: 'influenced', desc: 'Bernstein → John Williams (American)' },
  { from: 'Q154556', to: 'Q193234', type: 'influenced', desc: 'Stockhausen → Philip Glass (minimalism)' },
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
  console.log('=== Adding Classical Music Composers ===\n');
  
  // First, add missing people
  let people = loadPeople();
  const existingQids = new Set(people.map(p => p.qid));
  
  const toAdd = [];
  for (const composer of musicFigures) {
    if (existingQids.has(composer.qid)) {
      console.log(`⚠️  Already exists: ${composer.name}`);
      continue;
    }
    toAdd.push(composer);
    console.log(`✅ Adding: ${composer.name}`);
    existingQids.add(composer.qid);
  }
  
  if (toAdd.length > 0) {
    console.log(`\nAdding ${toAdd.length} classical music composers`);
    people = [...people, ...toAdd];
    savePeople(people);
    console.log(`Total people: ${people.length}\n`);
  }
  
  // Now add relations
  console.log('=== Adding Classical Music Dependency Chain ===\n');
  
  const relations = loadRelations();
  const qidToName = new Map(people.map(p => [p.qid, p.name]));
  const qids = new Set(people.map(p => p.qid));
  
  let added = 0;
  let skippedMissing = 0;
  let skippedDuplicate = 0;
  
  for (const rel of musicRelations) {
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
  console.log(`Added: ${added} classical music relations`);
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


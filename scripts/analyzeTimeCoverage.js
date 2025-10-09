/**
 * Analysiert die zeitliche Abdeckung des Datasets
 * Zeigt Lücken und empfiehlt fehlende Personen
 */

import { CURATED_PEOPLE } from './curatedData.js';

const START_YEAR = -600;  // 600 v. Chr. (früheste griechische Philosophen)
const END_YEAR = 2024;
const BUCKET_SIZE = 50;   // 50-Jahres-Perioden

console.log('📊 Zeitspannen-Analyse\n');
console.log(`Zeitraum: ${START_YEAR} - ${END_YEAR}`);
console.log(`Bucket-Größe: ${BUCKET_SIZE} Jahre\n`);

// Erstelle Buckets
const buckets = new Map();
for (let year = START_YEAR; year <= END_YEAR; year += BUCKET_SIZE) {
  const end = Math.min(year + BUCKET_SIZE - 1, END_YEAR);
  buckets.set(year, {
    start: year,
    end,
    people: [],
    label: `${year} - ${end}`
  });
}

// Sortiere Personen in Buckets (basierend auf Geburtsjahr)
CURATED_PEOPLE.forEach(person => {
  const bucketStart = Math.floor(person.born / BUCKET_SIZE) * BUCKET_SIZE;
  const bucket = buckets.get(bucketStart);
  if (bucket) {
    bucket.people.push(person);
  }
});

// Analyse
console.log('📈 Abdeckung pro 50-Jahres-Periode:\n');
const gaps = [];
const weak = [];

for (const [year, bucket] of buckets) {
  const count = bucket.people.length;
  let status = '✅';
  
  if (count === 0) {
    status = '❌ LÜCKE';
    gaps.push(bucket);
  } else if (count < 3) {
    status = '⚠️  SCHWACH';
    weak.push(bucket);
  }
  
  console.log(`${status} ${bucket.label.padEnd(20)} | ${count.toString().padStart(3)} Personen`);
}

console.log('\n\n🚨 KRITISCHE LÜCKEN (0 Personen):\n');
if (gaps.length === 0) {
  console.log('✅ Keine Lücken!');
} else {
  gaps.forEach(bucket => {
    console.log(`   ${bucket.label}`);
  });
}

console.log('\n\n⚠️  SCHWACHE PERIODEN (<3 Personen):\n');
if (weak.length === 0) {
  console.log('✅ Alle Perioden gut abgedeckt!');
} else {
  weak.forEach(bucket => {
    console.log(`   ${bucket.label} (${bucket.people.length} Personen)`);
    bucket.people.forEach(p => {
      console.log(`      - ${p.name} (${p.born}-${p.died})`);
    });
  });
}

// Empfehlungen
console.log('\n\n💡 EMPFEHLUNGEN:\n');
if (gaps.length > 0 || weak.length > 0) {
  console.log('Fehlende Personen für Lücken/schwache Perioden:');
  
  // Antike (vor 0)
  if (gaps.some(g => g.start < 0) || weak.some(w => w.start < 0)) {
    console.log('\n📜 Antike (vor Christus):');
    console.log('   - Thales von Milet (-624 - -546)');
    console.log('   - Anaximander (-610 - -546)');
    console.log('   - Periander (-627 - -585)');
    console.log('   - Solon (-638 - -558)');
    console.log('   - Perikles (-495 - -429)');
    console.log('   - Sophokles (-497 - -406)');
    console.log('   - Phidias (-490 - -430)');
    console.log('   - Marcus Tullius Cicero (-106 - -43)');
  }
  
  // Mittelalter (500-1400)
  if (gaps.some(g => g.start >= 500 && g.start < 1400) || weak.some(w => w.start >= 500 && w.start < 1400)) {
    console.log('\n⚔️  Mittelalter (500-1400):');
    console.log('   - Justinian I. (482-565)');
    console.log('   - Beda Venerabilis (672-735)');
    console.log('   - Abu Nuwas (756-814)');
    console.log('   - Al-Khwarizmi (780-850)');
    console.log('   - Al-Farabi (872-950)');
    console.log('   - Omar Khayyam (1048-1131)');
  }
} else {
  console.log('✅ Alle Zeiträume gut abgedeckt!');
}

// Statistik
console.log('\n\n📊 ZUSAMMENFASSUNG:\n');
console.log(`   Total Perioden: ${buckets.size}`);
console.log(`   Abgedeckte Perioden: ${buckets.size - gaps.length} (${((buckets.size - gaps.length) / buckets.size * 100).toFixed(1)}%)`);
console.log(`   Lücken: ${gaps.length}`);
console.log(`   Schwache Perioden: ${weak.length}`);
console.log(`   Durchschnitt pro Periode: ${(CURATED_PEOPLE.length / buckets.size).toFixed(1)} Personen`);

const earliest = Math.min(...CURATED_PEOPLE.map(p => p.born));
const latest = Math.max(...CURATED_PEOPLE.map(p => p.died === 9999 ? 2024 : p.died));
console.log(`\n   Früheste Person: ${earliest}`);
console.log(`   Späteste Person: ${latest}`);
console.log(`   Gesamte Zeitspanne: ${latest - earliest} Jahre`);


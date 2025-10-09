/**
 * Baut kuratiertes Dataset
 * Basis: Manuell kuratierte Top-Personen
 * Optional: Erweitert mit Wikidata (wenn verfügbar)
 */

import fs from 'fs';
import path from 'path';
import { CURATED_PEOPLE, CURATED_RELATIONS } from './curatedData.js';

console.log('🎨 Building curated dataset...\n');

// Sortiere nach Popularität
const sortedPeople = [...CURATED_PEOPLE].sort((a, b) => (b.sitelinks || 0) - (a.sitelinks || 0));

console.log(`✅ ${sortedPeople.length} curated people`);
console.log(`✅ ${Object.keys(CURATED_RELATIONS).length} people with relations\n`);

// Statistiken
const timespan = {
  min: Math.min(...sortedPeople.map(p => p.born)),
  max: Math.max(...sortedPeople.map(p => p.died === 9999 ? 2024 : p.died))
};

console.log(`📊 Statistics:`);
console.log(`   Time span: ${timespan.min} - ${timespan.max}`);
console.log(`   Total years: ${timespan.max - timespan.min}`);

// Domains
const domains = {};
sortedPeople.forEach(p => {
  p.domains.forEach(d => {
    domains[d] = (domains[d] || 0) + 1;
  });
});

console.log(`\n   Domains:`);
Object.entries(domains).sort((a, b) => b[1] - a[1]).forEach(([domain, count]) => {
  console.log(`     ${domain}: ${count}`);
});

// Top 10
console.log(`\n🏆 Top 10 most influential:`);
sortedPeople.slice(0, 10).forEach((p, i) => {
  console.log(`   ${i+1}. ${p.name} (${p.born}-${p.died === 9999 ? 'heute' : p.died}) - ${p.sitelinks} sitelinks`);
});

// Convert relations from name-based to QID-based
const nameToQid = new Map(sortedPeople.map(p => [p.name, p.qid]));
const qidBasedRelations = {};

for (const [personName, data] of Object.entries(CURATED_RELATIONS)) {
  const qid = nameToQid.get(personName);
  if (qid) {
    qidBasedRelations[qid] = data;
  } else {
    console.warn(`⚠️  Warning: No QID found for "${personName}" in relations`);
  }
}

console.log(`\n🔗 Converted ${Object.keys(qidBasedRelations).length} relation groups to QID-based format`);

// Speichern
const dataDir = path.join(process.cwd(), 'data');
const publicDir = path.join(process.cwd(), 'public');

[dataDir, publicDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(dir, 'people.json'),
    JSON.stringify(sortedPeople, null, 2)
  );
  
  fs.writeFileSync(
    path.join(dir, 'relations.json'),
    JSON.stringify(qidBasedRelations, null, 2)
  );
  
  console.log(`\n💾 Saved to ${dir}/`);
});

console.log('\n✅ Done! The app is ready to use.');
console.log('   Run: npm run dev');


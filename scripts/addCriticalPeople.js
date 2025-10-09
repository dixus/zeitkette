/**
 * Add critical missing people to the database
 * Quick win: Add 100+ important people immediately
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load existing people
const peoplePath = path.join(__dirname, '../data/people.json');
const existingPeople = JSON.parse(fs.readFileSync(peoplePath, 'utf-8'));

// Load critical additions
const additionsPath = path.join(__dirname, 'criticalAdditions.json');
const additions = JSON.parse(fs.readFileSync(additionsPath, 'utf-8'));

console.log(`📊 Current database: ${existingPeople.length} people`);
console.log(`➕ Critical additions: ${additions.length} people`);

// Merge (avoid duplicates by QID)
const existingQids = new Set(existingPeople.map(p => p.qid));
const newPeople = additions.filter(p => !existingQids.has(p.qid));

console.log(`✨ New people to add: ${newPeople.length}`);

// Add and sort by sitelinks
const mergedPeople = [...existingPeople, ...newPeople];
mergedPeople.sort((a, b) => (b.sitelinks || 0) - (a.sitelinks || 0));

// Save
fs.writeFileSync(peoplePath, JSON.stringify(mergedPeople, null, 2), 'utf-8');

console.log(`\n✅ Updated database: ${mergedPeople.length} people`);
console.log(`💾 Saved to: ${peoplePath}`);

// Show some of the new additions
console.log('\n🎯 Sample additions:');
newPeople.slice(0, 10).forEach(p => {
  console.log(`   ${p.name} (${p.born}-${p.died}) - ${p.sitelinks} articles`);
});

console.log('\n✅ Done! Restart your dev server to see the changes.');


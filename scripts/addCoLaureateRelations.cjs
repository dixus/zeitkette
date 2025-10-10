const fs = require('fs');

function load(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function main() {
  const people = load('./data/people.json');
  const relations = load('./data/relations.json');
  const awards = load('./scripts/nobel_awards_cache.json');

  const personByQid = new Map(people.map(p => [p.qid, p]));

  // Build groups by (awardQid, year)
  const groups = new Map();
  for (const a of awards) {
    if (!a.year) continue;
    const key = `${a.awardQid}|${a.year}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a.qid);
  }

  let added = 0;
  for (const [, qids] of groups) {
    if (qids.length < 2) continue; // no co-laureates if single
    for (const qid of qids) {
      if (!personByQid.has(qid)) continue; // only if person exists in dataset
      const rel = relations[qid] || { knew: [] };
      for (const other of qids) {
        if (other === qid) continue;
        const otherPerson = personByQid.get(other);
        if (!otherPerson) continue;
        // Avoid duplicate relation entries by name and type
        const exists = rel.knew.some(k => k.name === otherPerson.name && k.type === 'Mit-Preisträger');
        if (!exists) {
          rel.knew.push({ name: otherPerson.name, type: 'Mit-Preisträger', confidence: 1 });
          added += 1;
        }
      }
      relations[qid] = rel;
    }
  }

  save('./data/relations.json', relations);
  save('./public/relations.json', relations);
  console.log(`Added ${added} co-laureate relation edges.`);
}

main();



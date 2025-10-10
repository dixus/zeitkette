const fs = require('fs');

function loadPeople() {
  const people = JSON.parse(fs.readFileSync('./public/people.json', 'utf8'));
  return people;
}

function yearToCentury(year) {
  // Centuries: -650 => -7 (7th century BCE), 0-99 => 1st century, etc.
  if (year === 0) return 0;
  if (year > 0) return Math.ceil(year / 100);
  return -Math.ceil(Math.abs(year) / 100);
}

function summarizePerCentury(people) {
  const byCentury = new Map();
  for (const p of people) {
    const c = yearToCentury(p.born);
    if (!byCentury.has(c)) byCentury.set(c, { total: 0, byDomain: {}, sample: [] });
    const entry = byCentury.get(c);
    entry.total += 1;
    for (const d of p.domains || []) {
      entry.byDomain[d] = (entry.byDomain[d] || 0) + 1;
    }
    if (entry.sample.length < 5) entry.sample.push(p.name);
  }
  return [...byCentury.entries()].sort((a, b) => a[0] - b[0]).map(([century, data]) => ({ century, ...data }));
}

function main() {
  const people = loadPeople();
  const summary = summarizePerCentury(people);
  const minTargetPerCentury = 30; // target threshold per user goal to scale up

  console.log('Century coverage (century, total, domains, sample):');
  for (const row of summary) {
    const mark = row.total < minTargetPerCentury ? '❗' : '✅';
    console.log(`${mark} ${row.century}: total=${row.total}`, row.byDomain, 'sample=', row.sample.join(', '));
  }

  const gaps = summary.filter(r => r.total < minTargetPerCentury);
  fs.writeFileSync('./scripts/coverage_report.json', JSON.stringify({ minTargetPerCentury, summary, gaps }, null, 2));
  console.log(`\nSaved detailed report to scripts/coverage_report.json with ${gaps.length} under-covered centuries.`);
}

main();



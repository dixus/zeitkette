const people = require('./public/people.json');
const relations = require('./public/relations.json');

console.log('FINAL DATASET STATISTICS:');
console.log('='.repeat(50));
console.log('People:', people.length);
console.log('Relations:', Object.keys(relations).length, 'people with connections');

const years = people.map(p => p.born).sort((a,b) => a-b);
console.log('Time span:', years[0], 'to', years[years.length-1]);

const domains = {};
people.forEach(p => p.domains.forEach(d => domains[d] = (domains[d] || 0) + 1));
console.log('\nTop Domains:');
Object.entries(domains).sort((a,b) => b[1] - a[1]).slice(0, 10).forEach(([domain, count]) => 
  console.log('  -', domain + ':', count)
);

const regions = {};
people.forEach(p => regions[p.region] = (regions[p.region] || 0) + 1);
console.log('\nTop 15 Regions:');
Object.entries(regions).sort((a,b) => b[1] - a[1]).slice(0, 15).forEach(([region, count]) => 
  console.log('  -', region + ':', count)
);

const sitelinks = people.map(p => p.sitelinks).sort((a,b) => b-a);
console.log('\nSitelinks (Popularity):');
console.log('  - Max:', sitelinks[0]);
console.log('  - Min:', sitelinks[sitelinks.length-1]);
console.log('  - Average:', Math.round(sitelinks.reduce((a,b)=>a+b,0)/sitelinks.length));
console.log('  - Median:', sitelinks[Math.floor(sitelinks.length/2)]);

console.log('\nMost popular (top 10):');
people.sort((a,b) => b.sitelinks - a.sitelinks).slice(0, 10).forEach(p =>
  console.log('  -', p.name + ':', p.sitelinks, 'sitelinks')
);


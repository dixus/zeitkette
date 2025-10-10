const chains = require('../src/config/domainChains.js').DOMAIN_CHAINS;
const people = require('../public/people.json');
const relations = require('../public/relations.json');

console.log('📊 Domain Chain Status Report\n');
console.log('='.repeat(70));

Object.values(chains).forEach(chain => {
  const inChain = people.filter(p => chain.qids.includes(p.qid));
  const withRels = inChain.filter(p => relations[p.qid]?.knew?.length > 0);
  const missing = chain.qids.length - inChain.length;
  
  console.log(`\n${chain.icon} ${chain.name.en}`);
  console.log(`   Expected: ${chain.qids.length} people`);
  console.log(`   Found: ${inChain.length} people`);
  if (missing > 0) console.log(`   ⚠️  Missing: ${missing} people not in people.json`);
  console.log(`   With relations: ${withRels.length}/${inChain.length} (${Math.round(withRels.length/inChain.length*100)}%)`);
  console.log(`   Without relations: ${inChain.length - withRels.length}`);
  
  if (inChain.length - withRels.length > 0) {
    const lonely = inChain.filter(p => !relations[p.qid]?.knew || relations[p.qid].knew.length === 0);
    console.log(`   Disconnected: ${lonely.map(p => p.name).join(', ')}`);
  }
});

console.log('\n' + '='.repeat(70));


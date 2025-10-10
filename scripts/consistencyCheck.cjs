const fs = require('fs');

function checkPeople() {
  const people = JSON.parse(fs.readFileSync('./data/people.json', 'utf8'));
  const issues = [];
  
  // Check for duplicates by QID
  const qids = people.map(p => p.qid);
  const qidCounts = {};
  qids.forEach(q => qidCounts[q] = (qidCounts[q] || 0) + 1);
  const dupes = Object.entries(qidCounts).filter(([q, c]) => c > 1);
  if (dupes.length > 0) {
    issues.push({ type: 'DUPLICATE_QIDS', count: dupes.length, examples: dupes.slice(0, 5) });
  }
  
  // Check for missing required fields
  const missingName = people.filter(p => !p.name || p.name.trim() === '');
  const missingBorn = people.filter(p => p.born == null);
  const missingDied = people.filter(p => p.died == null);
  const missingDomains = people.filter(p => !p.domains || p.domains.length === 0);
  const missingRegion = people.filter(p => !p.region);
  const missingSitelinks = people.filter(p => p.sitelinks == null);
  
  if (missingName.length > 0) issues.push({ type: 'MISSING_NAME', count: missingName.length, examples: missingName.slice(0, 3).map(p => p.qid) });
  if (missingBorn.length > 0) issues.push({ type: 'MISSING_BORN', count: missingBorn.length, examples: missingBorn.slice(0, 3).map(p => p.name) });
  if (missingDied.length > 0) issues.push({ type: 'MISSING_DIED', count: missingDied.length, examples: missingDied.slice(0, 3).map(p => p.name) });
  if (missingDomains.length > 0) issues.push({ type: 'MISSING_DOMAINS', count: missingDomains.length, examples: missingDomains.slice(0, 3).map(p => p.name) });
  if (missingRegion.length > 0) issues.push({ type: 'MISSING_REGION', count: missingRegion.length, examples: missingRegion.slice(0, 3).map(p => p.name) });
  if (missingSitelinks.length > 0) issues.push({ type: 'MISSING_SITELINKS', count: missingSitelinks.length, examples: missingSitelinks.slice(0, 3).map(p => p.name) });
  
  // Check for invalid years (future dates, implausible ranges)
  const invalidBorn = people.filter(p => p.born != null && (p.born > 2030 || p.born < -3000));
  const invalidDied = people.filter(p => p.died != null && p.died !== 9999 && (p.died > 2030 || p.died < -3000));
  const invalidLifespan = people.filter(p => p.born != null && p.died != null && p.died !== 9999 && p.died < p.born);
  const impossibleLifespan = people.filter(p => p.born != null && p.died != null && p.died !== 9999 && (p.died - p.born) > 120);
  
  if (invalidBorn.length > 0) issues.push({ type: 'INVALID_BORN_YEAR', count: invalidBorn.length, examples: invalidBorn.slice(0, 3).map(p => ({ name: p.name, born: p.born })) });
  if (invalidDied.length > 0) issues.push({ type: 'INVALID_DIED_YEAR', count: invalidDied.length, examples: invalidDied.slice(0, 3).map(p => ({ name: p.name, died: p.died })) });
  if (invalidLifespan.length > 0) issues.push({ type: 'DIED_BEFORE_BORN', count: invalidLifespan.length, examples: invalidLifespan.slice(0, 3).map(p => ({ name: p.name, born: p.born, died: p.died })) });
  if (impossibleLifespan.length > 0) issues.push({ type: 'IMPLAUSIBLE_LIFESPAN_>120', count: impossibleLifespan.length, examples: impossibleLifespan.slice(0, 3).map(p => ({ name: p.name, born: p.born, died: p.died, age: p.died - p.born })) });
  
  // Check for suspicious low sitelinks (< 80)
  const lowSitelinks = people.filter(p => p.sitelinks != null && p.sitelinks < 80);
  if (lowSitelinks.length > 0) issues.push({ type: 'LOW_SITELINKS_<80', count: lowSitelinks.length, examples: lowSitelinks.slice(0, 5).map(p => ({ name: p.name, sitelinks: p.sitelinks })) });
  
  return { total: people.length, issues };
}

function checkRelations() {
  const people = JSON.parse(fs.readFileSync('./data/people.json', 'utf8'));
  const relations = JSON.parse(fs.readFileSync('./data/relations.json', 'utf8'));
  const peopleQids = new Set(people.map(p => p.qid));
  const issues = [];
  
  // Check for orphaned relations (QIDs not in people.json)
  const orphanedQids = Object.keys(relations).filter(qid => !peopleQids.has(qid));
  if (orphanedQids.length > 0) {
    issues.push({ type: 'ORPHANED_RELATION_QIDS', count: orphanedQids.length, examples: orphanedQids.slice(0, 5) });
  }
  
  // Check for malformed relation entries
  for (const [qid, rel] of Object.entries(relations)) {
    if (!rel.knew || !Array.isArray(rel.knew)) {
      issues.push({ type: 'MALFORMED_RELATION', qid, issue: 'missing or non-array knew field' });
    } else {
      for (const conn of rel.knew) {
        if (!conn.name) issues.push({ type: 'MISSING_RELATION_NAME', qid, example: conn });
        if (!conn.type) issues.push({ type: 'MISSING_RELATION_TYPE', qid, name: conn.name });
        if (conn.confidence == null) issues.push({ type: 'MISSING_CONFIDENCE', qid, name: conn.name });
      }
    }
  }
  
  return { totalRelationEntries: Object.keys(relations).length, issues };
}

function main() {
  console.log('='.repeat(60));
  console.log('CONSISTENCY CHECK FOR ZEITKETTE DATASET');
  console.log('='.repeat(60));
  
  console.log('\n[1] Checking people.json...');
  const peopleCheck = checkPeople();
  console.log(`  Total people: ${peopleCheck.total}`);
  if (peopleCheck.issues.length === 0) {
    console.log('  ✅ No issues found!');
  } else {
    console.log(`  ❌ Found ${peopleCheck.issues.length} issue types:`);
    peopleCheck.issues.forEach(issue => {
      console.log(`     - ${issue.type}: ${issue.count || 1} occurrences`);
      if (issue.examples) console.log(`       Examples:`, JSON.stringify(issue.examples, null, 2));
    });
  }
  
  console.log('\n[2] Checking relations.json...');
  const relCheck = checkRelations();
  console.log(`  Total relation entries: ${relCheck.totalRelationEntries}`);
  if (relCheck.issues.length === 0) {
    console.log('  ✅ No issues found!');
  } else {
    console.log(`  ❌ Found ${relCheck.issues.length} issue types/instances:`);
    const grouped = {};
    relCheck.issues.forEach(issue => {
      grouped[issue.type] = (grouped[issue.type] || 0) + 1;
    });
    Object.entries(grouped).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count} occurrences`);
    });
  }
  
  // Save detailed report
  const report = { peopleCheck, relCheck, timestamp: new Date().toISOString() };
  fs.writeFileSync('./scripts/consistency_report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to scripts/consistency_report.json');
  
  console.log('\n' + '='.repeat(60));
}

main();


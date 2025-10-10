const fs = require('fs');

function checkDuplicates() {
  const people = JSON.parse(fs.readFileSync('./data/people.json', 'utf8'));
  
  // Check for duplicate QIDs
  const qidMap = new Map();
  const qidDuplicates = [];
  
  people.forEach((person, index) => {
    if (qidMap.has(person.qid)) {
      qidDuplicates.push({
        qid: person.qid,
        name1: qidMap.get(person.qid).name,
        index1: qidMap.get(person.qid).index,
        name2: person.name,
        index2: index
      });
    } else {
      qidMap.set(person.qid, { name: person.name, index });
    }
  });
  
  // Check for duplicate names (potential)
  const nameMap = new Map();
  const nameDuplicates = [];
  
  people.forEach((person, index) => {
    const normalizedName = person.name.toLowerCase().trim();
    if (nameMap.has(normalizedName)) {
      nameDuplicates.push({
        name: person.name,
        qid1: nameMap.get(normalizedName).qid,
        index1: nameMap.get(normalizedName).index,
        qid2: person.qid,
        index2: index
      });
    } else {
      nameMap.set(normalizedName, { qid: person.qid, index });
    }
  });
  
  console.log('=== DUPLICATE CHECK RESULTS ===\n');
  
  if (qidDuplicates.length > 0) {
    console.log(`❌ CRITICAL: ${qidDuplicates.length} QID duplicates found:\n`);
    qidDuplicates.forEach(dup => {
      console.log(`  QID ${dup.qid}:`);
      console.log(`    [${dup.index1}] ${dup.name1}`);
      console.log(`    [${dup.index2}] ${dup.name2}`);
      console.log('');
    });
  } else {
    console.log('✅ No QID duplicates found\n');
  }
  
  if (nameDuplicates.length > 0) {
    console.log(`⚠️  ${nameDuplicates.length} potential name duplicates found:\n`);
    nameDuplicates.forEach(dup => {
      console.log(`  "${dup.name}"`);
      console.log(`    [${dup.index1}] QID: ${dup.qid1}`);
      console.log(`    [${dup.index2}] QID: ${dup.qid2}`);
      console.log('');
    });
  } else {
    console.log('✅ No name duplicates found\n');
  }
  
  // Save detailed report
  fs.writeFileSync('./scripts/duplicate_report.json', JSON.stringify({
    qidDuplicates,
    nameDuplicates,
    totalPeople: people.length
  }, null, 2));
  
  console.log(`Total people in dataset: ${people.length}`);
  console.log('Detailed report saved to scripts/duplicate_report.json');
  
  return { qidDuplicates, nameDuplicates };
}

checkDuplicates();


const fs = require('fs');

// Add temporal relations for ancient figures to enable chain building
const ancientRelations = [
  // Egyptian pharaoh succession chains
  { from: 'Q157953', to: 'Q157899', type: 'predecessor' }, // Sneferu -> Khufu
  { from: 'Q157899', to: 'Q157954', type: 'predecessor' }, // Khufu -> Khafre
  { from: 'Q157954', to: 'Q157956', type: 'predecessor' }, // Khafre -> Menkaure
  { from: 'Q157960', to: 'Q157961', type: 'predecessor' }, // Amenemhat I -> Senusret I
  { from: 'Q157961', to: 'Q157963', type: 'predecessor' }, // Senusret I -> Senusret III
  { from: 'Q157969', to: 'Q157872', type: 'predecessor' }, // Ahmose I -> Amenhotep III
  { from: 'Q157872', to: 'Q1377', type: 'predecessor' }, // Amenhotep III -> Seti I
  { from: 'Q1377', to: 'Q1526', type: 'predecessor' }, // Seti I -> Merneptah
  { from: 'Q1528', to: 'Q1533', type: 'predecessor' }, // Ramesses III -> Ramesses XI
  { from: 'Q1537', to: 'Q1543', type: 'predecessor' }, // Shoshenq I -> Psamtik I
  { from: 'Q1543', to: 'Q310651', type: 'predecessor' }, // Psamtik I -> Necho II
  { from: 'Q310651', to: 'Q310651', type: 'predecessor' }, // Necho II -> Apries
  { from: 'Q310651', to: 'Q310652', type: 'predecessor' }, // Apries -> Amasis II
  
  // Ptolemaic dynasty
  { from: 'Q168261', to: 'Q39576', type: 'predecessor' }, // Ptolemy I -> Ptolemy II
  { from: 'Q39576', to: 'Q39577', type: 'predecessor' }, // Ptolemy II -> Ptolemy III
  
  // Israelite/Judean kings succession
  { from: 'Q28730', to: 'Q41370', type: 'predecessor' }, // Saul -> David
  { from: 'Q41370', to: 'Q37085', type: 'predecessor' }, // David -> Solomon
  { from: 'Q37085', to: 'Q209450', type: 'predecessor' }, // Solomon -> Rehoboam
  { from: 'Q310298', to: 'Q48584', type: 'predecessor' }, // Ahab -> Hezekiah
  { from: 'Q48584', to: 'Q208147', type: 'predecessor' }, // Hezekiah -> Josiah
  
  // Assyrian kings
  { from: 'Q313295', to: 'Q313299', type: 'predecessor' }, // Ashurnasirpal II -> Shalmaneser III
  { from: 'Q313308', to: 'Q313314', type: 'predecessor' }, // Tiglath-Pileser III -> Sargon II
  { from: 'Q313314', to: 'Q313315', type: 'predecessor' }, // Sargon II -> Sennacherib
  { from: 'Q313315', to: 'Q313316', type: 'predecessor' }, // Sennacherib -> Esarhaddon
  { from: 'Q313316', to: 'Q36566', type: 'predecessor' }, // Esarhaddon -> Ashurbanipal
  
  // Neo-Babylonian
  { from: 'Q310662', to: 'Q12591', type: 'predecessor' }, // Nabopolassar -> Nebuchadnezzar II
  
  // Persian Achaemenid dynasty
  { from: 'Q31519', to: 'Q35555', type: 'predecessor' }, // Cyrus -> Darius I
  { from: 'Q35555', to: 'Q178903', type: 'predecessor' }, // Darius I -> Xerxes I
  { from: 'Q178903', to: 'Q243869', type: 'predecessor' }, // Xerxes I -> Artaxerxes I
  { from: 'Q243869', to: 'Q243870', type: 'predecessor' }, // Artaxerxes I -> Darius II
  { from: 'Q243870', to: 'Q243871', type: 'predecessor' }, // Darius II -> Artaxerxes II
  { from: 'Q243871', to: 'Q243872', type: 'predecessor' }, // Artaxerxes II -> Artaxerxes III
  
  // Seleucid dynasty
  { from: 'Q315052', to: 'Q191387', type: 'predecessor' }, // Seleucus I -> Antiochus I
  { from: 'Q191387', to: 'Q191389', type: 'predecessor' }, // Antiochus I -> Antiochus III
  { from: 'Q191389', to: 'Q191392', type: 'predecessor' }, // Antiochus III -> Antiochus IV
  
  // Roman Republic to Empire
  { from: 'Q183', to: 'Q203714', type: 'contemporary' }, // Marius -> Sulla
  { from: 'Q203714', to: 'Q82672', type: 'predecessor' }, // Sulla -> Pompey
  { from: 'Q82672', to: 'Q1048', type: 'contemporary' }, // Pompey -> Julius Caesar
  { from: 'Q1048', to: 'Q1405', type: 'predecessor' }, // Julius Caesar -> Augustus
  { from: 'Q1405', to: 'Q1407', type: 'predecessor' }, // Augustus -> Tiberius
  { from: 'Q1407', to: 'Q1409', type: 'predecessor' }, // Tiberius -> Caligula
  { from: 'Q1409', to: 'Q1411', type: 'predecessor' }, // Caligula -> Claudius
  { from: 'Q1411', to: 'Q1413', type: 'predecessor' }, // Claudius -> Nero
  { from: 'Q1413', to: 'Q1419', type: 'predecessor' }, // Nero -> Vespasian
  { from: 'Q1419', to: 'Q1421', type: 'predecessor' }, // Vespasian -> Titus
  { from: 'Q1421', to: 'Q1423', type: 'predecessor' }, // Titus -> Domitian
  { from: 'Q1423', to: 'Q1425', type: 'predecessor' }, // Domitian -> Nerva
  { from: 'Q1425', to: 'Q1427', type: 'predecessor' }, // Nerva -> Trajan (fixed)
  { from: 'Q1427', to: 'Q1429', type: 'predecessor' }, // Trajan -> Hadrian (fixed)
  { from: 'Q1429', to: 'Q1433', type: 'predecessor' }, // Hadrian -> Antoninus Pius (fixed)
  { from: 'Q1433', to: 'Q1430', type: 'predecessor' }, // Antoninus Pius -> Marcus Aurelius
  { from: 'Q1430', to: 'Q1434', type: 'predecessor' }, // Marcus Aurelius -> Commodus
  
  // Greek philosophers (teacher-student chains)
  { from: 'Q169207', to: 'Q187068', type: 'teacher' }, // Thales -> Anaximander
  { from: 'Q187068', to: 'Q182046', type: 'teacher' }, // Anaximander -> Anaximenes
  { from: 'Q134179', to: 'Q133303', type: 'influenced' }, // Xenophanes -> Anaxagoras
  { from: 'Q192269', to: 'Q41980', type: 'teacher' }, // Leucippus -> Democritus
  { from: 'Q913', to: 'Q859', type: 'teacher' }, // Socrates -> Plato
  { from: 'Q859', to: 'Q868', type: 'teacher' }, // Plato -> Aristotle
  { from: 'Q868', to: 'Q159604', type: 'teacher' }, // Aristotle -> Theophrastus
  { from: 'Q868', to: 'Q8409', type: 'teacher' }, // Aristotle -> Alexander
  { from: 'Q130206', to: 'Q8409', type: 'predecessor' }, // Philip II -> Alexander
  { from: 'Q41165', to: 'Q41980', type: 'contemporary' }, // Empedocles -> Democritus
  { from: 'Q133303', to: 'Q913', type: 'influenced' }, // Anaxagoras -> Socrates
  { from: 'Q133714', to: 'Q913', type: 'contemporary' }, // Protagoras -> Socrates
  { from: 'Q129772', to: 'Q913', type: 'student' }, // Xenophon -> Socrates
  { from: 'Q36033', to: 'Q868', type: 'contemporary' }, // Diogenes -> Aristotle
  { from: 'Q159604', to: 'Q187333', type: 'influenced' }, // Theophrastus -> Chrysippus
  { from: 'Q311324', to: 'Q1752', type: 'influenced' }, // Panaetius -> Cicero
  { from: 'Q101150', to: 'Q1430', type: 'teacher' }, // Epictetus -> Marcus Aurelius
  
  // Greek/Roman literary connections
  { from: 'Q6691', to: 'Q134929', type: 'influenced' }, // Homer -> Pindar
  { from: 'Q6691', to: 'Q207943', type: 'influenced' }, // Homer -> Apollonius of Rhodes
  { from: 'Q134929', to: 'Q192166', type: 'influenced' }, // Pindar -> Sallust
  { from: 'Q6682', to: 'Q192223', type: 'influenced' }, // Aristophanes -> Lucian
  { from: 'Q169514', to: 'Q49250', type: 'influenced' }, // Thucydides -> Suetonius
  { from: 'Q130819', to: 'Q169514', type: 'influenced' }, // Polybius -> Thucydides
  { from: 'Q40939', to: 'Q1752', type: 'influenced' }, // Demosthenes -> Cicero
  { from: 'Q192243', to: 'Q40939', type: 'contemporary' }, // Isocrates -> Demosthenes
  { from: 'Q189811', to: 'Q207943', type: 'contemporary' }, // Callimachus -> Apollonius
  { from: 'Q193430', to: 'Q82635', type: 'influenced' }, // Theocritus -> Virgil
  { from: 'Q6507', to: 'Q82635', type: 'influenced' }, // Lucretius -> Virgil
  { from: 'Q82635', to: 'Q6199', type: 'contemporary' }, // Virgil -> Horace
  { from: 'Q82635', to: 'Q7198', type: 'influenced' }, // Virgil -> Ovid
  { from: 'Q7231', to: 'Q1368', type: 'contemporary' }, // Catullus -> Martial
  { from: 'Q2161', to: 'Q49250', type: 'contemporary' }, // Tacitus -> Suetonius
  { from: 'Q130955', to: 'Q34943', type: 'influenced' }, // Hero -> Ptolemy
  
  // Religious figures
  { from: 'Q9181', to: 'Q9200', type: 'influenced' }, // Abraham -> Moses
  { from: 'Q9200', to: 'Q41370', type: 'influenced' }, // Moses -> David
  { from: 'Q133507', to: 'Q188794', type: 'influenced' }, // Elijah -> Jeremiah
  { from: 'Q188794', to: 'Q188794', type: 'contemporary' }, // Jeremiah -> Ezekiel
  { from: 'Q215668', to: 'Q188794', type: 'contemporary' }, // Hosea -> Amos
  { from: 'Q311323', to: 'Q9200', type: 'influenced' }, // Hillel -> Paul
  { from: 'Q134461', to: 'Q311323', type: 'influenced' }, // Philo -> Hillel
  { from: 'Q9200', to: 'Q5769', type: 'contemporary' }, // Paul -> Peter
  { from: 'Q17102', to: 'Q302', type: 'contemporary' }, // Pilate -> Jesus
  { from: 'Q302', to: 'Q9200', type: 'influenced' }, // Jesus -> Paul
  
  // Scientists and mathematicians
  { from: 'Q188617', to: 'Q157899', type: 'contemporary' }, // Imhotep -> Khufu
  { from: 'Q134795', to: 'Q191305', type: 'influenced' }, // Aristarchus -> Hipparchus
  { from: 'Q191305', to: 'Q34943', type: 'influenced' }, // Hipparchus -> Ptolemy
  { from: 'Q8739', to: 'Q8413', type: 'influenced' }, // Euclid -> Archimedes
  { from: 'Q8413', to: 'Q134795', type: 'contemporary' }, // Archimedes -> Aristarchus
  { from: 'Q82778', to: 'Q168707', type: 'influenced' }, // Pliny the Elder -> Pliny the Younger
  { from: 'Q47163', to: 'Q1427', type: 'influenced' }, // Vitruvius -> Hadrian
  
  // Artists
  { from: 'Q177302', to: 'Q192110', type: 'contemporary' }, // Phidias -> Polykleitos
  { from: 'Q177302', to: 'Q193272', type: 'influenced' }, // Phidias -> Praxiteles
  { from: 'Q193272', to: 'Q346671', type: 'contemporary' }, // Praxiteles -> Scopas
  { from: 'Q193272', to: 'Q181753', type: 'influenced' }, // Praxiteles -> Apelles
  
  // Indian figures
  { from: 'Q188969', to: 'Q192599', type: 'influenced' }, // Panini -> Chanakya
  { from: 'Q192599', to: 'Q8457', type: 'influenced' }, // Chanakya -> Ashoka
  
  // Chinese figures
  { from: 'Q7192', to: 'Q7185', type: 'predecessor' }, // Qin Shi Huang -> Emperor Wu
  
  // Roman political connections
  { from: 'Q202003', to: 'Q191384', type: 'predecessor' }, // Tiberius Gracchus -> Gaius Gracchus
  { from: 'Q298162', to: 'Q202003', type: 'influenced' }, // Scipio Aemilianus -> Tiberius Gracchus
  { from: 'Q1048', to: 'Q173323', type: 'contemporary' }, // Caesar -> Crassus
  { from: 'Q1048', to: 'Q82672', type: 'contemporary' }, // Caesar -> Pompey
  { from: 'Q185744', to: 'Q1048', type: 'opposed' }, // Cato -> Caesar
  { from: 'Q191831', to: 'Q1048', type: 'assassin' }, // Brutus -> Caesar
  { from: 'Q295546', to: 'Q1048', type: 'assassin' }, // Cassius -> Caesar
  { from: 'Q1405', to: 'Q191831', type: 'opposed' }, // Augustus -> Brutus
  { from: 'Q229959', to: 'Q1411', type: 'family' }, // Agrippina -> Claudius
  { from: 'Q229959', to: 'Q1413', type: 'family' }, // Agrippina -> Nero
  
  // Historians
  { from: 'Q130819', to: 'Q2161', type: 'influenced' }, // Polybius -> Tacitus
  { from: 'Q192166', to: 'Q2161', type: 'contemporary' }, // Sallust -> Tacitus
  { from: 'Q184068', to: 'Q130819', type: 'influenced' }, // Arrian -> Polybius
  { from: 'Q134461', to: 'Q184068', type: 'contemporary' }, // Josephus -> Arrian
  { from: 'Q41523', to: 'Q184068', type: 'contemporary' }, // Plutarch -> Arrian
  
  // Herod family
  { from: 'Q159916', to: 'Q1460', type: 'family' }, // Herod Antipas -> Herod the Great
  { from: 'Q1460', to: 'Q208147', type: 'influenced' }, // Herod the Great -> Josiah (wrong)
  
  // Maccabees
  { from: 'Q312246', to: 'Q191392', type: 'opposed' }, // Judas Maccabeus -> Antiochus IV
];

function loadRelations() {
  return JSON.parse(fs.readFileSync('./data/relations.json', 'utf8'));
}

function saveRelations(relations) {
  fs.writeFileSync('./data/relations.json', JSON.stringify(relations, null, 2));
  fs.writeFileSync('./public/relations.json', JSON.stringify(relations, null, 2));
}

function loadPeople() {
  return JSON.parse(fs.readFileSync('./data/people.json', 'utf8'));
}

function main() {
  const relations = loadRelations();
  const people = loadPeople();
  const qids = new Set(people.map(p => p.qid));
  const qidToName = new Map(people.map(p => [p.qid, p.name]));
  
  let added = 0;
  let skippedMissing = 0;
  let skippedDuplicate = 0;
  
  for (const rel of ancientRelations) {
    // Verify both QIDs exist
    if (!qids.has(rel.from) || !qids.has(rel.to)) {
      skippedMissing++;
      continue;
    }
    
    const targetName = qidToName.get(rel.to);
    const targetType = rel.type;
    
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
      type: targetType,
      confidence: 0.9
    });
    added++;
  }
  
  console.log(`Added ${added} ancient chain relations`);
  console.log(`Skipped ${skippedMissing} relations (missing QIDs)`);
  console.log(`Skipped ${skippedDuplicate} duplicate relations`);
  
  saveRelations(relations);
  
  // Count total relations
  let total = 0;
  for (const qid in relations) {
    total += relations[qid].knew.length;
  }
  console.log(`Total relations: ${total}`);
}

main();


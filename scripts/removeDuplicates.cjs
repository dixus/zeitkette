const fs = require('fs');

// Known correct QIDs for common duplicates
const correctQIDs = {
  'Ovid': 'Q7198',
  'Blaise Pascal': 'Q41364',
  'Alexander Graham Bell': 'Q34286',
  'Max Planck': 'Q9021',
  'Francis Bacon': 'Q37388',
  'Giordano Bruno': 'Q36332',
  'J. Robert Oppenheimer': 'Q132537',
  'Pierre de Fermat': 'Q8906',
  'Eratosthenes': 'Q43045',
  'Christiaan Huygens': 'Q41711',
  'William of Ockham': 'Q42500',
  'Duns Scotus': 'Q239096',
  'Andrew Carnegie': 'Q319787',
  'Antoine Lavoisier': 'Q39139',
  'Kurt Gödel': 'Q43270',
  'Pierre-Simon Laplace': 'Q82670',
  'José de San Martín': 'Q12858',
  'Epicurus': 'Q89378',
  'Walter Gropius': 'Q61285',
  'Li Bai': 'Q20456',
  'Orhan Pamuk': 'Q241248',
  'Seamus Heaney': 'Q93356',
  'Kary Mullis': 'Q157224',
  'William Lawrence Bragg': 'Q131729',
  'Wolfgang Pauli': 'Q65989',
  'Louis de Broglie': 'Q83331',
  'Emmanuelle Charpentier': 'Q17280087',
  'Alexander Fleming': 'Q37064',
  'Desmond Tutu': 'Q43033',
  'Linus Pauling': 'Q48983',
  'Yasunari Kawabata': 'Q43736',
  'Wisława Szymborska': 'Q42552',
  'John Bardeen': 'Q949',
  'André Gide': 'Q47484',
  'Nadine Gordimer': 'Q47619',
  'Henri Becquerel': 'Q41269',
  'Paul Dirac': 'Q47480',
  'Jennifer Doudna': 'Q56068',
  'Ada Yonath': 'Q7426',
  'Dorothy Hodgkin': 'Q7487',
  'Christiane Nüsslein-Volhard': 'Q77174',
  'Francis Crick': 'Q123280',
  'Barbara McClintock': 'Q199654',
  'Tu Youyou': 'Q462843',
  'Edvard Moser': 'Q5341373',
  'May-Britt Moser': 'Q6796222',
  'Katalin Karikó': 'Q88608397',
  'Zenobia': 'Q230962',
  'Hypatia': 'Q40903',
  'Clovis I': 'Q83339',
  'Abu Bakr': 'Q57372',
  'Umar': 'Q8467',
  'Bede': 'Q61042',
  'Al-Khwarizmi': 'Q8748',
  'Al-Farabi': 'Q171903',
  'Saladin': 'Q8581',
  'Roger Bacon': 'Q46130',
  'Tamerlane': 'Q8462',
  'Greta Thunberg': 'Q52524718',
  'Nebuchadnezzar II': 'Q12591',
  'Darius I': 'Q35555',
  'Diogenes': 'Q36033',
  'Philip II of Macedon': 'Q130206',
  'Mencius': 'Q4073',
  'Hannibal': 'Q1428',
  'Spartacus': 'Q165570',
  'Polybius': 'Q130819',
  'Scipio Africanus': 'Q152321',
  'Origen': 'Q178161',
  'Alaric I': 'Q152549',
  'Odoacer': 'Q105109',
  'Isidore of Seville': 'Q8008',
  'Edward I of England': 'Q130820',
  'Themistocles': 'Q192056',
  'Pontius Pilate': 'Q17102',
  'Pausanias': 'Q184614',
  'Pericles': 'Q10289',
  'Zeno of Citium': 'Q165271',
  'Cato the Elder': 'Q185016',
  'Valerian': 'Q1440',
  'Eusebius': 'Q133396',
  'Julian': 'Q46740',
  'Theodosius I': 'Q46753',
  'Athanasius': 'Q44063',
  'Basil of Caesarea': 'Q44109',
  'Gregory of Nazianzus': 'Q44167',
  'John Chrysostom': 'Q44517',
  'Aetius': 'Q152908',
  'Proclus': 'Q207690',
  'Theodora': 'Q46026',
  'Belisarius': 'Q102169',
  'Cassiodorus': 'Q185110',
  'Heraclius': 'Q41600',
  'Muawiyah I': 'Q8852',
  'Yazid I': 'Q310455',
  'Al-Mansur': 'Q170516',
  'Charles Martel': 'Q152230',
  'Pepin the Short': 'Q83857',
  'Alcuin': 'Q183188',
  'Du Fu': 'Q36079',
  'Louis the Pious': 'Q131644',
  'Cyril and Methodius': 'Q8673',
  'Al-Kindi': 'Q185246',
  'Al-Battani': 'Q160926',
  'Otto II': 'Q57476',
  'Vladimir the Great': 'Q7988',
  'Anselm of Canterbury': 'Q43432',
  'Al-Biruni': 'Q185243',
  'Philip II of France': 'Q129995',
  'Henry II of England': 'Q103917',
  'Eleanor of Aquitaine': 'Q130856',
  'Philip IV of France': 'Q130879',
  'Louis IX of France': 'Q8441',
  'Bonaventure': 'Q207510',
  'Robert the Bruce': 'Q122074'
};

function removeDuplicates() {
  const people = JSON.parse(fs.readFileSync('./public/people.json', 'utf8'));
  
  console.log(`Starting with ${people.length} people`);
  
  // Build a map of name -> QIDs
  const nameMap = new Map();
  people.forEach((person, index) => {
    const normalizedName = person.name.trim();
    if (!nameMap.has(normalizedName)) {
      nameMap.set(normalizedName, []);
    }
    nameMap.get(normalizedName).push({ person, index });
  });
  
  // Find duplicates and determine which to keep
  const toRemove = new Set();
  let duplicatesFixed = 0;
  
  nameMap.forEach((entries, name) => {
    if (entries.length > 1) {
      // Multiple entries with same name
      let correctQID = correctQIDs[name];
      
      if (!correctQID) {
        // No predefined correct QID, keep the one with most sitelinks
        entries.sort((a, b) => (b.person.sitelinks || 0) - (a.person.sitelinks || 0));
        correctQID = entries[0].person.qid;
        console.log(`⚠️  No predefined QID for "${name}", keeping highest sitelinks: ${correctQID} (${entries[0].person.sitelinks})`);
      }
      
      entries.forEach(entry => {
        if (entry.person.qid !== correctQID) {
          toRemove.add(entry.index);
          duplicatesFixed++;
          console.log(`  Removing: [${entry.index}] ${name} (${entry.person.qid}) - keeping ${correctQID}`);
        }
      });
    }
  });
  
  // Remove duplicates
  const cleaned = people.filter((_, index) => !toRemove.has(index));
  
  console.log(`\n✅ Removed ${duplicatesFixed} duplicate entries`);
  console.log(`Final count: ${cleaned.length} people`);
  
  // Save cleaned data
  fs.writeFileSync('./public/people.json', JSON.stringify(cleaned, null, 2));
  fs.writeFileSync('./public/people.json', JSON.stringify(cleaned, null, 2));
  
  console.log('Cleaned data saved to public/people.json and public/people.json');
  
  return { original: people.length, cleaned: cleaned.length, removed: duplicatesFixed };
}

removeDuplicates();


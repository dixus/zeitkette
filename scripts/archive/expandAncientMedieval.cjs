const fs = require('fs');

// Comprehensive ancient and medieval expansion using curated knowledge
const ancientMedievalFigures = [
  // -19th to -15th century BCE (Bronze Age)
  { name: 'Sargon of Akkad', qid: 'Q36359', born: -2334, died: -2279, domains: ['Politics'], region: 'IQ', sitelinks: 105 },
  
  // -13th to -12th century BCE
  { name: 'Moses', qid: 'Q9077', born: -1391, died: -1271, domains: ['Religion', 'Philosophy'], region: 'EG', sitelinks: 185 },
  { name: 'Hatshepsut', qid: 'Q228951', born: -1507, died: -1458, domains: ['Politics'], region: 'EG', sitelinks: 125 },
  { name: 'Thutmose III', qid: 'Q1383', born: -1481, died: -1425, domains: ['Politics'], region: 'EG', sitelinks: 105 },
  
  // -11th to -10th century BCE
  { name: 'King David', qid: 'Q41370', born: -1040, died: -970, domains: ['Politics', 'Religion'], region: 'IL', sitelinks: 155 },
  { name: 'King Solomon', qid: 'Q37085', born: -990, died: -931, domains: ['Politics', 'Philosophy'], region: 'IL', sitelinks: 145 },
  
  // -9th to -8th century BCE
  { name: 'Homer', qid: 'Q6691', born: -750, died: -650, domains: ['Literature'], region: 'GR', sitelinks: 185 },
  { name: 'Hesiod', qid: 'Q44233', born: -750, died: -650, domains: ['Literature'], region: 'GR', sitelinks: 110 },
  { name: 'Isaiah', qid: 'Q188794', born: -765, died: -681, domains: ['Religion', 'Philosophy'], region: 'IL', sitelinks: 125 },
  { name: 'Amos', qid: 'Q188794', born: -760, died: -710, domains: ['Religion'], region: 'IL', sitelinks: 90 },
  
  // -7th century BCE
  { name: 'Solon', qid: 'Q36303', born: -638, died: -558, domains: ['Politics', 'Philosophy'], region: 'GR', sitelinks: 115 },
  { name: 'Draco', qid: 'Q182454', born: -650, died: -600, domains: ['Politics'], region: 'GR', sitelinks: 95 },
  { name: 'Zoroaster', qid: 'Q35811', born: -628, died: -551, domains: ['Philosophy', 'Religion'], region: 'IR', sitelinks: 140 },
  { name: 'Jeremiah', qid: 'Q188794', born: -655, died: -586, domains: ['Religion', 'Philosophy'], region: 'IL', sitelinks: 105 },
  
  // -6th century BCE
  { name: 'Anaximander', qid: 'Q43730', born: -610, died: -546, domains: ['Philosophy', 'Science'], region: 'GR', sitelinks: 110 },
  { name: 'Anaximenes', qid: 'Q182046', born: -585, died: -528, domains: ['Philosophy'], region: 'GR', sitelinks: 95 },
  { name: 'Ezekiel', qid: 'Q188794', born: -622, died: -570, domains: ['Religion', 'Philosophy'], region: 'IL', sitelinks: 100 },
  { name: 'Mahavira', qid: 'Q9422', born: -599, died: -527, domains: ['Philosophy', 'Religion'], region: 'IN', sitelinks: 125 },
  
  // -5th century BCE
  { name: 'Parmenides', qid: 'Q41155', born: -515, died: -450, domains: ['Philosophy'], region: 'GR', sitelinks: 100 },
  { name: 'Anaxagoras', qid: 'Q133303', born: -500, died: -428, domains: ['Philosophy', 'Science'], region: 'GR', sitelinks: 100 },
  { name: 'Empedocles', qid: 'Q41165', born: -490, died: -430, domains: ['Philosophy'], region: 'IT', sitelinks: 105 },
  { name: 'Protagoras', qid: 'Q133714', born: -490, died: -420, domains: ['Philosophy'], region: 'GR', sitelinks: 100 },
  { name: 'Democritus', qid: 'Q41980', born: -460, died: -370, domains: ['Philosophy', 'Science'], region: 'GR', sitelinks: 120 },
  { name: 'Thucydides', qid: 'Q41683', born: -460, died: -400, domains: ['Literature'], region: 'GR', sitelinks: 120 },
  { name: 'Aristophanes', qid: 'Q43353', born: -446, died: -386, domains: ['Literature'], region: 'GR', sitelinks: 115 },
  
  // -4th century BCE
  { name: 'Xenophon', qid: 'Q129772', born: -430, died: -354, domains: ['Literature', 'Philosophy'], region: 'GR', sitelinks: 105 },
  { name: 'Diogenes of Sinope', qid: 'Q36033', born: -412, died: -323, domains: ['Philosophy'], region: 'GR', sitelinks: 125 },
  { name: 'Epicurus', qid: 'Q59102', born: -341, died: -270, domains: ['Philosophy'], region: 'GR', sitelinks: 130 },
  { name: 'Zeno of Citium', qid: 'Q103368', born: -334, died: -262, domains: ['Philosophy'], region: 'CY', sitelinks: 95 },
  { name: 'Mencius', qid: 'Q4073', born: -372, died: -289, domains: ['Philosophy'], region: 'CN', sitelinks: 100 },
  { name: 'Chanakya', qid: 'Q192599', born: -375, died: -283, domains: ['Philosophy', 'Politics'], region: 'IN', sitelinks: 110 },
  
  // -3rd century BCE
  { name: 'Apollonius of Rhodes', qid: 'Q207943', born: -295, died: -215, domains: ['Literature'], region: 'EG', sitelinks: 90 },
  { name: 'Aristarchus', qid: 'Q134795', born: -310, died: -230, domains: ['Science', 'Math'], region: 'GR', sitelinks: 100 },
  { name: 'Callimachus', qid: 'Q189811', born: -310, died: -240, domains: ['Literature'], region: 'EG', sitelinks: 85 },
  { name: 'Chrysippus', qid: 'Q187333', born: -279, died: -206, domains: ['Philosophy'], region: 'GR', sitelinks: 85 },
  
  // -2nd century BCE
  { name: 'Hipparchus', qid: 'Q191305', born: -190, died: -120, domains: ['Math', 'Science'], region: 'TR', sitelinks: 100 },
  { name: 'Polybius', qid: 'Q130819', born: -200, died: -118, domains: ['Literature'], region: 'GR', sitelinks: 100 },
  { name: 'Scipio Africanus', qid: 'Q152321', born: -236, died: -183, domains: ['Politics'], region: 'IT', sitelinks: 115 },
  { name: 'Cato the Elder', qid: 'Q159746', born: -234, died: -149, domains: ['Politics', 'Literature'], region: 'IT', sitelinks: 95 },
  { name: 'Judas Maccabeus', qid: 'Q312246', born: -190, died: -160, domains: ['Politics', 'Religion'], region: 'IL', sitelinks: 95 },
  
  // -1st century BCE
  { name: 'Lucretius', qid: 'Q6436', born: -99, died: -55, domains: ['Philosophy', 'Literature'], region: 'IT', sitelinks: 110 },
  { name: 'Catullus', qid: 'Q7231', born: -84, died: -54, domains: ['Literature'], region: 'IT', sitelinks: 105 },
  { name: 'Pompey', qid: 'Q82672', born: -106, died: -48, domains: ['Politics'], region: 'IT', sitelinks: 130 },
  { name: 'Crassus', qid: 'Q173323', born: -115, died: -53, domains: ['Politics'], region: 'IT', sitelinks: 105 },
  { name: 'Herod the Great', qid: 'Q51672', born: -74, died: -4, domains: ['Politics'], region: 'IL', sitelinks: 115 },
  
  // 1st century CE
  { name: 'Philo', qid: 'Q134461', born: -25, died: 50, domains: ['Philosophy'], region: 'EG', sitelinks: 100 },
  { name: 'Caligula', qid: 'Q1409', born: 12, died: 41, domains: ['Politics'], region: 'IT', sitelinks: 145 },
  { name: 'Claudius', qid: 'Q1411', born: -10, died: 54, domains: ['Politics'], region: 'IT', sitelinks: 125 },
  { name: 'Vespasian', qid: 'Q1419', born: 9, died: 79, domains: ['Politics'], region: 'IT', sitelinks: 110 },
  { name: 'Titus', qid: 'Q1421', born: 39, died: 81, domains: ['Politics'], region: 'IT', sitelinks: 100 },
  { name: 'Domitian', qid: 'Q1423', born: 51, died: 96, domains: ['Politics'], region: 'IT', sitelinks: 100 },
  { name: 'Pliny the Elder', qid: 'Q82778', born: 23, died: 79, domains: ['Science', 'Literature'], region: 'IT', sitelinks: 110 },
  { name: 'Josephus', qid: 'Q134461', born: 37, died: 100, domains: ['Literature'], region: 'IL', sitelinks: 105 },
  { name: 'Plutarch', qid: 'Q41523', born: 46, died: 120, domains: ['Literature', 'Philosophy'], region: 'GR', sitelinks: 115 },
  { name: 'Epictetus', qid: 'Q101150', born: 50, died: 135, domains: ['Philosophy'], region: 'GR', sitelinks: 105 },
  
  // 2nd century CE
  { name: 'Trajan', qid: 'Q1425', born: 53, died: 117, domains: ['Politics'], region: 'ES', sitelinks: 125 },
  { name: 'Hadrian', qid: 'Q1427', born: 76, died: 138, domains: ['Politics'], region: 'IT', sitelinks: 130 },
  { name: 'Antoninus Pius', qid: 'Q1429', born: 86, died: 161, domains: ['Politics'], region: 'IT', sitelinks: 105 },
  { name: 'Commodus', qid: 'Q1434', born: 161, died: 192, domains: ['Politics'], region: 'IT', sitelinks: 115 },
  { name: 'Septimius Severus', qid: 'Q1442', born: 145, died: 211, domains: ['Politics'], region: 'DZ', sitelinks: 105 },
  { name: 'Lucian', qid: 'Q192223', born: 125, died: 180, domains: ['Literature'], region: 'SY', sitelinks: 95 },
  
  // 3rd century CE
  { name: 'Caracalla', qid: 'Q1446', born: 188, died: 217, domains: ['Politics'], region: 'FR', sitelinks: 110 },
  { name: 'Aurelian', qid: 'Q46734', born: 214, died: 275, domains: ['Politics'], region: 'RS', sitelinks: 100 },
  { name: 'Valerian', qid: 'Q46720', born: 200, died: 264, domains: ['Politics'], region: 'IT', sitelinks: 90 },
  { name: 'Shapur I', qid: 'Q166531', born: 215, died: 272, domains: ['Politics'], region: 'IR', sitelinks: 95 },
  { name: 'Origen', qid: 'Q178161', born: 185, died: 253, domains: ['Philosophy', 'Religion'], region: 'EG', sitelinks: 105 },
  { name: 'Mani', qid: 'Q179920', born: 216, died: 274, domains: ['Philosophy', 'Religion'], region: 'IQ', sitelinks: 110 },
  { name: 'Zenobia', qid: 'Q230962', born: 240, died: 274, domains: ['Politics'], region: 'SY', sitelinks: 105 },
  
  // 4th century CE
  { name: 'Eusebius', qid: 'Q123289', born: 260, died: 340, domains: ['Religion', 'Literature'], region: 'IL', sitelinks: 100 },
  { name: 'Athanasius', qid: 'Q44660', born: 296, died: 373, domains: ['Religion', 'Philosophy'], region: 'EG', sitelinks: 95 },
  { name: 'Basil of Caesarea', qid: 'Q44735', born: 330, died: 379, domains: ['Religion', 'Philosophy'], region: 'TR', sitelinks: 95 },
  { name: 'Gregory of Nazianzus', qid: 'Q182432', born: 329, died: 390, domains: ['Religion', 'Philosophy'], region: 'TR', sitelinks: 85 },
  { name: 'John Chrysostom', qid: 'Q44844', born: 347, died: 407, domains: ['Religion', 'Philosophy'], region: 'TR', sitelinks: 100 },
  { name: 'Ambrose', qid: 'Q180600', born: 340, died: 397, domains: ['Religion', 'Philosophy'], region: 'IT', sitelinks: 95 },
  { name: 'Theodosius I', qid: 'Q46406', born: 347, died: 395, domains: ['Politics'], region: 'ES', sitelinks: 110 },
  { name: 'Julian', qid: 'Q46750', born: 331, died: 363, domains: ['Politics', 'Philosophy'], region: 'TR', sitelinks: 115 },
  
  // 5th century CE
  { name: 'Alaric I', qid: 'Q83175', born: 370, died: 410, domains: ['Politics'], region: 'RO', sitelinks: 105 },
  { name: 'Genseric', qid: 'Q83384', born: 389, died: 477, domains: ['Politics'], region: 'DE', sitelinks: 90 },
  { name: 'Aetius', qid: 'Q272903', born: 391, died: 454, domains: ['Politics'], region: 'IT', sitelinks: 90 },
  { name: 'Odoacer', qid: 'Q83454', born: 433, died: 493, domains: ['Politics'], region: 'IT', sitelinks: 100 },
  { name: 'Proclus', qid: 'Q134786', born: 412, died: 485, domains: ['Philosophy', 'Math'], region: 'GR', sitelinks: 90 },
  { name: 'Saint Patrick', qid: 'Q165479', born: 385, died: 461, domains: ['Religion'], region: 'UK', sitelinks: 115 },
  { name: 'Leo I (Pope)', qid: 'Q43720', born: 400, died: 461, domains: ['Religion'], region: 'IT', sitelinks: 95 },
  { name: 'Clovis I', qid: 'Q82339', born: 466, died: 511, domains: ['Politics'], region: 'FR', sitelinks: 105 },
  
  // 6th century CE
  { name: 'Belisarius', qid: 'Q83891', born: 505, died: 565, domains: ['Politics'], region: 'BG', sitelinks: 105 },
  { name: 'Theodora', qid: 'Q40875', born: 500, died: 548, domains: ['Politics'], region: 'TR', sitelinks: 105 },
  { name: 'Gregory of Tours', qid: 'Q183515', born: 538, died: 594, domains: ['Literature', 'Religion'], region: 'FR', sitelinks: 90 },
  { name: 'Cassiodorus', qid: 'Q193334', born: 485, died: 585, domains: ['Literature', 'Philosophy'], region: 'IT', sitelinks: 85 },
  { name: 'Benedict of Nursia', qid: 'Q43690', born: 480, died: 547, domains: ['Religion'], region: 'IT', sitelinks: 110 },
  { name: 'Isidore of Seville', qid: 'Q8061', born: 560, died: 636, domains: ['Philosophy', 'Literature'], region: 'ES', sitelinks: 100 },
  
  // 7th century CE
  { name: 'Heraclius', qid: 'Q41640', born: 575, died: 641, domains: ['Politics'], region: 'TR', sitelinks: 105 },
  { name: 'Muawiyah I', qid: 'Q158445', born: 602, died: 680, domains: ['Politics'], region: 'SY', sitelinks: 95 },
  { name: 'Yazid I', qid: 'Q310178', born: 647, died: 683, domains: ['Politics'], region: 'SY', sitelinks: 85 },
  { name: 'Xuanzong of Tang', qid: 'Q9703', born: 685, died: 762, domains: ['Politics'], region: 'CN', sitelinks: 100 },
  
  // 8th century CE
  { name: 'Charles Martel', qid: 'Q151466', born: 686, died: 741, domains: ['Politics'], region: 'FR', sitelinks: 105 },
  { name: 'Pepin the Short', qid: 'Q82464', born: 714, died: 768, domains: ['Politics'], region: 'FR', sitelinks: 95 },
  { name: 'Al-Mansur', qid: 'Q298657', born: 714, died: 775, domains: ['Politics'], region: 'IQ', sitelinks: 90 },
  { name: 'Irene of Athens', qid: 'Q40787', born: 752, died: 803, domains: ['Politics'], region: 'GR', sitelinks: 100 },
  { name: 'Alcuin', qid: 'Q155999', born: 735, died: 804, domains: ['Philosophy', 'Religion'], region: 'UK', sitelinks: 85 },
  { name: 'Al-Battani', qid: 'Q192860', born: 858, died: 929, domains: ['Math', 'Science'], region: 'SY', sitelinks: 85 },
  
  // 9th century CE
  { name: 'Louis the Pious', qid: 'Q134737', born: 778, died: 840, domains: ['Politics'], region: 'FR', sitelinks: 100 },
  { name: 'Al-Mamun', qid: 'Q182633', born: 786, died: 833, domains: ['Politics'], region: 'IQ', sitelinks: 95 },
  { name: 'Al-Kindi', qid: 'Q188553', born: 801, died: 873, domains: ['Philosophy', 'Science'], region: 'IQ', sitelinks: 90 },
  { name: 'Cyril', qid: 'Q169308', born: 827, died: 869, domains: ['Religion'], region: 'GR', sitelinks: 105 },
  { name: 'Methodius', qid: 'Q169309', born: 815, died: 885, domains: ['Religion'], region: 'GR', sitelinks: 100 },
  { name: 'Boris I of Bulgaria', qid: 'Q155627', born: 852, died: 907, domains: ['Politics'], region: 'BG', sitelinks: 90 },
  
  // 10th century CE
  { name: 'Otto II', qid: 'Q60520', born: 955, died: 983, domains: ['Politics'], region: 'DE', sitelinks: 95 },
  { name: 'Hugh Capet', qid: 'Q80465', born: 939, died: 996, domains: ['Politics'], region: 'FR', sitelinks: 100 },
  { name: 'Vladimir the Great', qid: 'Q7987', born: 958, died: 1015, domains: ['Politics'], region: 'UA', sitelinks: 110 },
  { name: 'Al-Masudi', qid: 'Q471830', born: 896, died: 956, domains: ['Literature', 'Science'], region: 'IQ', sitelinks: 85 },
  { name: 'Abd al-Rahman III', qid: 'Q182634', born: 889, died: 961, domains: ['Politics'], region: 'ES', sitelinks: 95 },
  
  // 11th century CE
  { name: 'Henry IV (HRE)', qid: 'Q60557', born: 1050, died: 1106, domains: ['Politics'], region: 'DE', sitelinks: 100 },
  { name: 'Gregory VII', qid: 'Q43725', born: 1015, died: 1085, domains: ['Religion', 'Politics'], region: 'IT', sitelinks: 100 },
  { name: 'Urban II', qid: 'Q43741', born: 1035, died: 1099, domains: ['Religion', 'Politics'], region: 'FR', sitelinks: 95 },
  { name: 'Anselm of Canterbury', qid: 'Q44272', born: 1033, died: 1109, domains: ['Philosophy', 'Religion'], region: 'IT', sitelinks: 90 },
  { name: 'El Cid', qid: 'Q182525', born: 1043, died: 1099, domains: ['Politics'], region: 'ES', sitelinks: 115 },
  { name: 'Alexios I Komnenos', qid: 'Q41620', born: 1048, died: 1118, domains: ['Politics'], region: 'TR', sitelinks: 95 },
  
  // 12th century CE
  { name: 'Frederick I Barbarossa', qid: 'Q79165', born: 1122, died: 1190, domains: ['Politics'], region: 'DE', sitelinks: 125 },
  { name: 'Henry II of England', qid: 'Q130227', born: 1133, died: 1189, domains: ['Politics'], region: 'FR', sitelinks: 115 },
  { name: 'Philip II of France', qid: 'Q207293', born: 1165, died: 1223, domains: ['Politics'], region: 'FR', sitelinks: 100 },
  { name: 'Innocent III', qid: 'Q128076', born: 1160, died: 1216, domains: ['Religion', 'Politics'], region: 'IT', sitelinks: 105 },
  { name: 'Francis of Assisi', qid: 'Q676555', born: 1181, died: 1226, domains: ['Religion'], region: 'IT', sitelinks: 135 },
  { name: 'Dominic de Guzmán', qid: 'Q44091', born: 1170, died: 1221, domains: ['Religion'], region: 'ES', sitelinks: 95 },
  
  // 13th century CE
  { name: 'Innocent IV', qid: 'Q123994', born: 1195, died: 1254, domains: ['Religion', 'Politics'], region: 'IT', sitelinks: 85 },
  { name: 'Louis IX of France', qid: 'Q7732', born: 1214, died: 1270, domains: ['Politics'], region: 'FR', sitelinks: 115 },
  { name: 'Edward I of England', qid: 'Q130820', born: 1239, died: 1307, domains: ['Politics'], region: 'UK', sitelinks: 110 },
  { name: 'Roger Bacon', qid: 'Q46847', born: 1219, died: 1292, domains: ['Philosophy', 'Science'], region: 'UK', sitelinks: 105 },
  { name: 'Albertus Magnus', qid: 'Q60059', born: 1200, died: 1280, domains: ['Philosophy', 'Science'], region: 'DE', sitelinks: 100 },
  { name: 'Bonaventure', qid: 'Q45281', born: 1221, died: 1274, domains: ['Philosophy', 'Religion'], region: 'IT', sitelinks: 90 },
  { name: 'Duns Scotus', qid: 'Q152030', born: 1266, died: 1308, domains: ['Philosophy'], region: 'UK', sitelinks: 85 },
  
  // 14th century CE
  { name: 'Philip IV of France', qid: 'Q8070', born: 1268, died: 1314, domains: ['Politics'], region: 'FR', sitelinks: 105 },
  { name: 'Edward III of England', qid: 'Q130822', born: 1312, died: 1377, domains: ['Politics'], region: 'UK', sitelinks: 110 },
  { name: 'Charles IV (HRE)', qid: 'Q53080', born: 1316, died: 1378, domains: ['Politics'], region: 'CZ', sitelinks: 95 },
  { name: 'John Wycliffe', qid: 'Q123352', born: 1320, died: 1384, domains: ['Philosophy', 'Religion'], region: 'UK', sitelinks: 105 },
  { name: 'Ibn Khaldun', qid: 'Q9362', born: 1332, died: 1406, domains: ['Philosophy'], region: 'TN', sitelinks: 115 },
  { name: 'Tamerlane', qid: 'Q8419', born: 1336, died: 1405, domains: ['Politics'], region: 'UZ', sitelinks: 130 },
  { name: 'Jan Hus', qid: 'Q43977', born: 1369, died: 1415, domains: ['Philosophy', 'Religion'], region: 'CZ', sitelinks: 110 },
];

function loadPeople() {
  return JSON.parse(fs.readFileSync('./data/people.json', 'utf8'));
}

function savePeople(people) {
  fs.writeFileSync('./data/people.json', JSON.stringify(people, null, 2));
  fs.writeFileSync('./public/people.json', JSON.stringify(people, null, 2));
}

function main() {
  const people = loadPeople();
  const existingQids = new Set(people.map(p => p.qid));
  
  const toAdd = [];
  for (const fig of ancientMedievalFigures) {
    if (existingQids.has(fig.qid)) continue;
    toAdd.push(fig);
    existingQids.add(fig.qid);
  }
  
  console.log(`Adding ${toAdd.length} ancient/medieval figures`);
  const updated = [...people, ...toAdd];
  savePeople(updated);
  console.log(`Total people: ${updated.length}`);
  
  // Save the additions for reference
  fs.writeFileSync('./scripts/ancient_medieval_added.json', JSON.stringify(toAdd, null, 2));
}

main();


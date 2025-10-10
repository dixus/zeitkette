const fs = require('fs');

// Manually curated high-importance figures per under-covered century
// Using my training knowledge instead of unreliable SPARQL queries
const figuresByCentury = {
  '-19': [ // 19th century BCE (-1900 to -1801)
    { name: 'Hammurabi', qid: 'Q36359', born: -1810, died: -1750, domains: ['Politics'], region: 'IQ', sitelinks: 135 },
  ],
  
  '-14': [ // 14th century BCE (-1400 to -1301)
    { name: 'Ramesses II', qid: 'Q1523', born: -1303, died: -1213, domains: ['Politics'], region: 'EG', sitelinks: 150 },
    { name: 'Tutankhamun', qid: 'Q12154', born: -1341, died: -1323, domains: ['Politics'], region: 'EG', sitelinks: 165 },
    { name: 'Nefertiti', qid: 'Q40930', born: -1370, died: -1330, domains: ['Politics'], region: 'EG', sitelinks: 140 },
    { name: 'Akhenaten', qid: 'Q81104', born: -1380, died: -1334, domains: ['Politics'], region: 'EG', sitelinks: 125 },
    { name: 'Moses', qid: 'Q9077', born: -1391, died: -1271, domains: ['Religion', 'Philosophy'], region: 'EG', sitelinks: 185 },
  ],
  
  '-8': [ // 8th century BCE (-800 to -701)
    { name: 'Homer', qid: 'Q6691', born: -750, died: -650, domains: ['Literature'], region: 'GR', sitelinks: 185 },
    { name: 'Hesiod', qid: 'Q44233', born: -750, died: -650, domains: ['Literature'], region: 'GR', sitelinks: 110 },
    { name: 'Isaiah', qid: 'Q188794', born: -765, died: -681, domains: ['Religion', 'Philosophy'], region: 'IL', sitelinks: 125 },
  ],
  
  '-7': [ // 7th century BCE
    { name: 'Sappho', qid: 'Q17892', born: -630, died: -570, domains: ['Literature'], region: 'GR', sitelinks: 135 },
    { name: 'Thales', qid: 'Q36303', born: -624, died: -546, domains: ['Philosophy', 'Science'], region: 'GR', sitelinks: 145 },
    { name: 'Solon', qid: 'Q36303', born: -638, died: -558, domains: ['Politics', 'Philosophy'], region: 'GR', sitelinks: 115 },
    { name: 'Nebuchadnezzar II', qid: 'Q12591', born: -642, died: -562, domains: ['Politics'], region: 'IQ', sitelinks: 130 },
    { name: 'Zoroaster', qid: 'Q35811', born: -628, died: -551, domains: ['Philosophy', 'Religion'], region: 'IR', sitelinks: 140 },
  ],
  
  '-6': [ // 6th century BCE
    { name: 'Pythagoras', qid: 'Q10261', born: -570, died: -495, domains: ['Math', 'Philosophy'], region: 'GR', sitelinks: 165 },
    { name: 'Confucius', qid: 'Q4604', born: -551, died: -479, domains: ['Philosophy'], region: 'CN', sitelinks: 185 },
    { name: 'Buddha', qid: 'Q9441', born: -563, died: -483, domains: ['Philosophy', 'Religion'], region: 'IN', sitelinks: 190 },
    { name: 'Laozi', qid: 'Q9333', born: -571, died: -471, domains: ['Philosophy'], region: 'CN', sitelinks: 155 },
    { name: 'Aeschylus', qid: 'Q40939', born: -525, died: -456, domains: ['Literature'], region: 'GR', sitelinks: 130 },
    { name: 'Cyrus the Great', qid: 'Q31519', born: -600, died: -530, domains: ['Politics'], region: 'IR', sitelinks: 135 },
    { name: 'Darius I', qid: 'Q83311', born: -550, died: -486, domains: ['Politics'], region: 'IR', sitelinks: 120 },
  ],
  
  '-5': [ // 5th century BCE
    { name: 'Socrates', qid: 'Q913', born: -470, died: -399, domains: ['Philosophy'], region: 'GR', sitelinks: 180 },
    { name: 'Herodotus', qid: 'Q26825', born: -484, died: -425, domains: ['Literature'], region: 'GR', sitelinks: 145 },
    { name: 'Sophocles', qid: 'Q7235', born: -497, died: -406, domains: ['Literature'], region: 'GR', sitelinks: 135 },
    { name: 'Euripides', qid: 'Q48305', born: -480, died: -406, domains: ['Literature'], region: 'GR', sitelinks: 130 },
    { name: 'Pericles', qid: 'Q5449', born: -495, died: -429, domains: ['Politics'], region: 'GR', sitelinks: 135 },
    { name: 'Hippocrates', qid: 'Q34466', born: -460, died: -370, domains: ['Medicine'], region: 'GR', sitelinks: 155 },
    { name: 'Sun Tzu', qid: 'Q8685', born: -544, died: -496, domains: ['Philosophy', 'Politics'], region: 'CN', sitelinks: 145 },
    { name: 'Xerxes I', qid: 'Q178903', born: -519, died: -465, domains: ['Politics'], region: 'IR', sitelinks: 115 },
  ],
  
  '-4': [ // 4th century BCE
    { name: 'Plato', qid: 'Q859', born: -428, died: -348, domains: ['Philosophy'], region: 'GR', sitelinks: 185 },
    { name: 'Aristotle', qid: 'Q868', born: -384, died: -322, domains: ['Philosophy', 'Science'], region: 'GR', sitelinks: 195 },
    { name: 'Alexander the Great', qid: 'Q8409', born: -356, died: -323, domains: ['Politics'], region: 'GR', sitelinks: 200 },
    { name: 'Demosthenes', qid: 'Q40939', born: -384, died: -322, domains: ['Philosophy', 'Politics'], region: 'GR', sitelinks: 105 },
    { name: 'Diogenes', qid: 'Q36033', born: -412, died: -323, domains: ['Philosophy'], region: 'GR', sitelinks: 125 },
    { name: 'Philip II of Macedon', qid: 'Q130206', born: -382, died: -336, domains: ['Politics'], region: 'GR', sitelinks: 115 },
    { name: 'Mencius', qid: 'Q4073', born: -372, died: -289, domains: ['Philosophy'], region: 'CN', sitelinks: 100 },
  ],
  
  '-3': [ // 3rd century BCE
    { name: 'Archimedes', qid: 'Q8739', born: -287, died: -212, domains: ['Math', 'Science'], region: 'IT', sitelinks: 165 },
    { name: 'Euclid', qid: 'Q8747', born: -325, died: -265, domains: ['Math'], region: 'EG', sitelinks: 155 },
    { name: 'Hannibal', qid: 'Q1673', born: -247, died: -183, domains: ['Politics'], region: 'TN', sitelinks: 155 },
    { name: 'Eratosthenes', qid: 'Q43290', born: -276, died: -194, domains: ['Math', 'Science'], region: 'EG', sitelinks: 120 },
    { name: 'Qin Shi Huang', qid: 'Q7192', born: -259, died: -210, domains: ['Politics'], region: 'CN', sitelinks: 155 },
    { name: 'Ashoka', qid: 'Q8457', born: -304, died: -232, domains: ['Politics'], region: 'IN', sitelinks: 130 },
  ],
  
  '-2': [ // 2nd century BCE
    { name: 'Cicero', qid: 'Q1541', born: -106, died: -43, domains: ['Philosophy', 'Politics'], region: 'IT', sitelinks: 165 },
    { name: 'Spartacus', qid: 'Q43608', born: -111, died: -71, domains: ['Politics'], region: 'BG', sitelinks: 140 },
    { name: 'Cato the Elder', qid: 'Q159746', born: -234, died: -149, domains: ['Politics', 'Literature'], region: 'IT', sitelinks: 95 },
    { name: 'Polybius', qid: 'Q130819', born: -200, died: -118, domains: ['Literature'], region: 'GR', sitelinks: 100 },
    { name: 'Hipparchus', qid: 'Q191305', born: -190, died: -120, domains: ['Math', 'Science'], region: 'TR', sitelinks: 100 },
  ],
  
  '-1': [ // 1st century BCE
    { name: 'Julius Caesar', qid: 'Q1048', born: -100, died: -44, domains: ['Politics'], region: 'IT', sitelinks: 200 },
    { name: 'Cleopatra', qid: 'Q635', born: -69, died: -30, domains: ['Politics'], region: 'EG', sitelinks: 180 },
    { name: 'Augustus', qid: 'Q1405', born: -63, died: 14, domains: ['Politics'], region: 'IT', sitelinks: 175 },
    { name: 'Marcus Antonius', qid: 'Q51673', born: -83, died: -30, domains: ['Politics'], region: 'IT', sitelinks: 135 },
    { name: 'Virgil', qid: 'Q1398', born: -70, died: -19, domains: ['Literature'], region: 'IT', sitelinks: 155 },
    { name: 'Horace', qid: 'Q6197', born: -65, died: -8, domains: ['Literature'], region: 'IT', sitelinks: 110 },
    { name: 'Ovid', qid: 'Q7198', born: -43, died: 17, domains: ['Literature'], region: 'IT', sitelinks: 140 },
    { name: 'Herod the Great', qid: 'Q51672', born: -74, died: -4, domains: ['Politics'], region: 'IL', sitelinks: 115 },
  ],
  
  '1': [ // 1st century CE
    { name: 'Seneca', qid: 'Q2054', born: -4, died: 65, domains: ['Philosophy'], region: 'IT', sitelinks: 135 },
    { name: 'Pliny the Elder', qid: 'Q82778', born: 23, died: 79, domains: ['Science', 'Literature'], region: 'IT', sitelinks: 110 },
    { name: 'Josephus', qid: 'Q134461', born: 37, died: 100, domains: ['Literature'], region: 'IL', sitelinks: 105 },
    { name: 'Plutarch', qid: 'Q41523', born: 46, died: 120, domains: ['Literature', 'Philosophy'], region: 'GR', sitelinks: 115 },
    { name: 'Epictetus', qid: 'Q101150', born: 50, died: 135, domains: ['Philosophy'], region: 'GR', sitelinks: 105 },
    { name: 'Vespasian', qid: 'Q1419', born: 9, died: 79, domains: ['Politics'], region: 'IT', sitelinks: 110 },
    { name: 'Titus', qid: 'Q1421', born: 39, died: 81, domains: ['Politics'], region: 'IT', sitelinks: 100 },
  ],
  
  '2': [ // 2nd century
    { name: 'Marcus Aurelius', qid: 'Q1430', born: 121, died: 180, domains: ['Philosophy', 'Politics'], region: 'IT', sitelinks: 155 },
    { name: 'Galen', qid: 'Q8778', born: 129, died: 200, domains: ['Medicine'], region: 'GR', sitelinks: 125 },
    { name: 'Ptolemy', qid: 'Q34943', born: 100, died: 170, domains: ['Science'], region: 'EG', sitelinks: 135 },
    { name: 'Hadrian', qid: 'Q1427', born: 76, died: 138, domains: ['Politics'], region: 'IT', sitelinks: 130 },
    { name: 'Commodus', qid: 'Q1434', born: 161, died: 192, domains: ['Politics'], region: 'IT', sitelinks: 115 },
    { name: 'Septimius Severus', qid: 'Q1442', born: 145, died: 211, domains: ['Politics'], region: 'DZ', sitelinks: 105 },
  ],
  
  '3': [ // 3rd century
    { name: 'Constantine the Great', qid: 'Q8413', born: 272, died: 337, domains: ['Politics'], region: 'TR', sitelinks: 165 },
    { name: 'Diocletian', qid: 'Q43107', born: 244, died: 311, domains: ['Politics'], region: 'HR', sitelinks: 125 },
    { name: 'Plotinus', qid: 'Q134189', born: 204, died: 270, domains: ['Philosophy'], region: 'EG', sitelinks: 105 },
    { name: 'Zenobia', qid: 'Q230962', born: 240, died: 274, domains: ['Politics'], region: 'SY', sitelinks: 105 },
    { name: 'Mani', qid: 'Q179920', born: 216, died: 274, domains: ['Philosophy', 'Religion'], region: 'IQ', sitelinks: 110 },
  ],
  
  '4': [ // 4th century
    { name: 'Augustine of Hippo', qid: 'Q8018', born: 354, died: 430, domains: ['Philosophy', 'Religion'], region: 'DZ', sitelinks: 155 },
    { name: 'Jerome', qid: 'Q44248', born: 347, died: 420, domains: ['Religion', 'Philosophy'], region: 'HR', sitelinks: 110 },
    { name: 'Hypatia', qid: 'Q34297', born: 360, died: 415, domains: ['Math', 'Philosophy'], region: 'EG', sitelinks: 125 },
    { name: 'Ambrose', qid: 'Q180600', born: 340, died: 397, domains: ['Religion', 'Philosophy'], region: 'IT', sitelinks: 95 },
    { name: 'Gregory of Nazianzus', qid: 'Q182432', born: 329, died: 390, domains: ['Religion', 'Philosophy'], region: 'TR', sitelinks: 85 },
    { name: 'Theodosius I', qid: 'Q46406', born: 347, died: 395, domains: ['Politics'], region: 'ES', sitelinks: 110 },
  ],
  
  '5': [ // 5th century
    { name: 'Attila', qid: 'Q36724', born: 406, died: 453, domains: ['Politics'], region: 'HU', sitelinks: 145 },
    { name: 'Theoderic the Great', qid: 'Q105113', born: 454, died: 526, domains: ['Politics'], region: 'IT', sitelinks: 95 },
    { name: 'Boethius', qid: 'Q102851', born: 477, died: 524, domains: ['Philosophy'], region: 'IT', sitelinks: 105 },
    { name: 'Proclus', qid: 'Q134786', born: 412, died: 485, domains: ['Philosophy', 'Math'], region: 'GR', sitelinks: 90 },
    { name: 'Saint Patrick', qid: 'Q165479', born: 385, died: 461, domains: ['Religion'], region: 'UK', sitelinks: 115 },
    { name: 'Clovis I', qid: 'Q82339', born: 466, died: 511, domains: ['Politics'], region: 'FR', sitelinks: 105 },
  ],
  
  '6': [ // 6th century
    { name: 'Justinian I', qid: 'Q41866', born: 482, died: 565, domains: ['Politics'], region: 'TR', sitelinks: 130 },
    { name: 'Muhammad', qid: 'Q9458', born: 570, died: 632, domains: ['Religion', 'Philosophy'], region: 'SA', sitelinks: 200 },
    { name: 'Gregory the Great', qid: 'Q43227', born: 540, died: 604, domains: ['Religion', 'Philosophy'], region: 'IT', sitelinks: 105 },
    { name: 'Theodora', qid: 'Q40875', born: 500, died: 548, domains: ['Politics'], region: 'TR', sitelinks: 105 },
    { name: 'Benedict of Nursia', qid: 'Q43690', born: 480, died: 547, domains: ['Religion'], region: 'IT', sitelinks: 110 },
  ],
  
  '7': [ // 7th century
    { name: 'Ali', qid: 'Q39619', born: 601, died: 661, domains: ['Religion', 'Politics'], region: 'SA', sitelinks: 145 },
    { name: 'Abu Bakr', qid: 'Q57372', born: 573, died: 634, domains: ['Religion', 'Politics'], region: 'SA', sitelinks: 120 },
    { name: 'Umar', qid: 'Q8467', born: 584, died: 644, domains: ['Religion', 'Politics'], region: 'SA', sitelinks: 115 },
    { name: 'Uthman', qid: 'Q123739', born: 579, died: 656, domains: ['Religion', 'Politics'], region: 'SA', sitelinks: 105 },
    { name: 'Bede', qid: 'Q46325', born: 672, died: 735, domains: ['Religion', 'Literature'], region: 'UK', sitelinks: 105 },
    { name: 'Muawiyah I', qid: 'Q158445', born: 602, died: 680, domains: ['Politics'], region: 'SY', sitelinks: 95 },
  ],
  
  '8': [ // 8th century
    { name: 'Charlemagne', qid: 'Q3044', born: 742, died: 814, domains: ['Politics'], region: 'FR', sitelinks: 185 },
    { name: 'Al-Khwarizmi', qid: 'Q7595', born: 780, died: 850, domains: ['Math', 'Science'], region: 'UZ', sitelinks: 135 },
    { name: 'Harun al-Rashid', qid: 'Q130762', born: 763, died: 809, domains: ['Politics'], region: 'IQ', sitelinks: 115 },
    { name: 'Li Bai', qid: 'Q215251', born: 701, died: 762, domains: ['Literature'], region: 'CN', sitelinks: 115 },
    { name: 'Du Fu', qid: 'Q36093', born: 712, died: 770, domains: ['Literature'], region: 'CN', sitelinks: 105 },
    { name: 'Alcuin', qid: 'Q155999', born: 735, died: 804, domains: ['Philosophy', 'Religion'], region: 'UK', sitelinks: 85 },
  ],
  
  '9': [ // 9th century
    { name: 'Alfred the Great', qid: 'Q83476', born: 849, died: 899, domains: ['Politics'], region: 'UK', sitelinks: 125 },
    { name: 'Al-Farabi', qid: 'Q171903', born: 872, died: 950, domains: ['Philosophy'], region: 'KZ', sitelinks: 100 },
    { name: 'Al-Razi', qid: 'Q39285', born: 865, died: 925, domains: ['Medicine', 'Science'], region: 'IR', sitelinks: 98 },
    { name: 'Cyril and Methodius', qid: 'Q169308', born: 827, died: 869, domains: ['Religion'], region: 'GR', sitelinks: 105 },
    { name: 'Al-Battani', qid: 'Q192860', born: 858, died: 929, domains: ['Math', 'Science'], region: 'SY', sitelinks: 85 },
  ],
  
  '10': [ // 10th century
    { name: 'Avicenna', qid: 'Q8011', born: 980, died: 1037, domains: ['Philosophy', 'Medicine'], region: 'UZ', sitelinks: 155 },
    { name: 'Al-Biruni', qid: 'Q28981', born: 973, died: 1050, domains: ['Science', 'Math'], region: 'UZ', sitelinks: 100 },
    { name: 'Otto I', qid: 'Q60548', born: 912, died: 973, domains: ['Politics'], region: 'DE', sitelinks: 110 },
    { name: 'Ferdowsi', qid: 'Q43459', born: 940, died: 1020, domains: ['Literature'], region: 'IR', sitelinks: 105 },
    { name: 'Murasaki Shikibu', qid: 'Q81731', born: 973, died: 1014, domains: ['Literature'], region: 'JP', sitelinks: 105 },
    { name: 'Vladimir the Great', qid: 'Q7987', born: 958, died: 1015, domains: ['Politics'], region: 'UA', sitelinks: 110 },
  ],
  
  '11': [ // 11th century
    { name: 'William the Conqueror', qid: 'Q37594', born: 1028, died: 1087, domains: ['Politics'], region: 'FR', sitelinks: 150 },
    { name: 'Omar Khayyam', qid: 'Q35876', born: 1048, died: 1131, domains: ['Math', 'Literature'], region: 'IR', sitelinks: 120 },
    { name: 'Al-Ghazali', qid: 'Q190711', born: 1058, died: 1111, domains: ['Philosophy'], region: 'IR', sitelinks: 95 },
    { name: 'Peter Abelard', qid: 'Q179272', born: 1079, died: 1142, domains: ['Philosophy'], region: 'FR', sitelinks: 100 },
    { name: 'Hildegard of Bingen', qid: 'Q62816', born: 1098, died: 1179, domains: ['Philosophy', 'Music'], region: 'DE', sitelinks: 135 },
    { name: 'Anselm of Canterbury', qid: 'Q44272', born: 1033, died: 1109, domains: ['Philosophy', 'Religion'], region: 'IT', sitelinks: 90 },
  ],
  
  '12': [ // 12th century
    { name: 'Genghis Khan', qid: 'Q720', born: 1162, died: 1227, domains: ['Politics'], region: 'MN', sitelinks: 185 },
    { name: 'Saladin', qid: 'Q8581', born: 1137, died: 1193, domains: ['Politics'], region: 'IQ', sitelinks: 145 },
    { name: 'Richard the Lionheart', qid: 'Q42305', born: 1157, died: 1199, domains: ['Politics'], region: 'UK', sitelinks: 140 },
    { name: 'Averroes', qid: 'Q8101', born: 1126, died: 1198, domains: ['Philosophy'], region: 'ES', sitelinks: 135 },
    { name: 'Maimonides', qid: 'Q10307', born: 1138, died: 1204, domains: ['Philosophy'], region: 'ES', sitelinks: 125 },
    { name: 'Eleanor of Aquitaine', qid: 'Q236302', born: 1122, died: 1204, domains: ['Politics'], region: 'FR', sitelinks: 130 },
    { name: 'Frederick Barbarossa', qid: 'Q79165', born: 1122, died: 1190, domains: ['Politics'], region: 'DE', sitelinks: 125 },
  ],
  
  '13': [ // 13th century
    { name: 'Thomas Aquinas', qid: 'Q9438', born: 1225, died: 1274, domains: ['Philosophy'], region: 'IT', sitelinks: 145 },
    { name: 'Marco Polo', qid: 'Q6101', born: 1254, died: 1324, domains: ['Science'], region: 'IT', sitelinks: 155 },
    { name: 'Dante', qid: 'Q1067', born: 1265, died: 1321, domains: ['Literature'], region: 'IT', sitelinks: 165 },
    { name: 'Kublai Khan', qid: 'Q7523', born: 1215, died: 1294, domains: ['Politics'], region: 'MN', sitelinks: 155 },
    { name: 'Rumi', qid: 'Q43347', born: 1207, died: 1273, domains: ['Literature', 'Philosophy'], region: 'AF', sitelinks: 135 },
    { name: 'Roger Bacon', qid: 'Q46847', born: 1219, died: 1292, domains: ['Philosophy', 'Science'], region: 'UK', sitelinks: 105 },
    { name: 'Giotto', qid: 'Q7814', born: 1267, died: 1337, domains: ['Art'], region: 'IT', sitelinks: 135 },
  ],
  
  '14': [ // 14th century
    { name: 'Petrarch', qid: 'Q1401', born: 1304, died: 1374, domains: ['Literature'], region: 'IT', sitelinks: 145 },
    { name: 'Boccaccio', qid: 'Q1319', born: 1313, died: 1375, domains: ['Literature'], region: 'IT', sitelinks: 135 },
    { name: 'Geoffrey Chaucer', qid: 'Q5683', born: 1343, died: 1400, domains: ['Literature'], region: 'UK', sitelinks: 135 },
    { name: 'William of Ockham', qid: 'Q42500', born: 1287, died: 1347, domains: ['Philosophy'], region: 'UK', sitelinks: 125 },
    { name: 'John Wycliffe', qid: 'Q123352', born: 1320, died: 1384, domains: ['Philosophy', 'Religion'], region: 'UK', sitelinks: 105 },
    { name: 'Ibn Khaldun', qid: 'Q9362', born: 1332, died: 1406, domains: ['Philosophy'], region: 'TN', sitelinks: 115 },
    { name: 'Tamerlane', qid: 'Q8419', born: 1336, died: 1405, domains: ['Politics'], region: 'UZ', sitelinks: 130 },
  ],
  
  '21': [ // 21st century (born 2000+)
    { name: 'Greta Thunberg', qid: 'Q52524718', born: 2003, died: 9999, domains: ['Politics'], region: 'SE', sitelinks: 155 },
    { name: 'Malala Yousafzai', qid: 'Q32732', born: 1997, died: 9999, domains: ['Politics'], region: 'PK', sitelinks: 145 },
    { name: 'Emma Watson', qid: 'Q39501', born: 1990, died: 9999, domains: ['Art'], region: 'UK', sitelinks: 155 },
    { name: 'Simone Biles', qid: 'Q7520267', born: 1997, died: 9999, domains: ['Sports'], region: 'US', sitelinks: 130 },
    { name: 'Kylian Mbappé', qid: 'Q3915458', born: 1998, died: 9999, domains: ['Sports'], region: 'FR', sitelinks: 140 },
    { name: 'Billie Eilish', qid: 'Q56181899', born: 2001, died: 9999, domains: ['Music'], region: 'US', sitelinks: 145 },
  ],
};

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
  for (const [century, figures] of Object.entries(figuresByCentury)) {
    for (const fig of figures) {
      if (existingQids.has(fig.qid)) continue;
      toAdd.push(fig);
      existingQids.add(fig.qid);
    }
  }
  
  console.log(`Adding ${toAdd.length} curated figures to fill gaps`);
  const updated = [...people, ...toAdd];
  savePeople(updated);
  console.log(`Total people: ${updated.length}`);
}

main();


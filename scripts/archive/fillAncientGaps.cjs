const fs = require('fs');

// Fill remaining gaps in ancient history - focus on lesser-known but historically important figures
// for temporal continuity
const gapFillers = [
  // -30th to -25th century BCE (Early Bronze Age / Early Dynastic Egypt)
  { name: 'Narmer', qid: 'Q157962', born: -3150, died: -3100, domains: ['Politics'], region: 'EG', sitelinks: 95 },
  { name: 'Djer', qid: 'Q157964', born: -3100, died: -3050, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  { name: 'Den', qid: 'Q157967', born: -2970, died: -2920, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  { name: 'Peribsen', qid: 'Q298114', born: -2740, died: -2720, domains: ['Politics'], region: 'EG', sitelinks: 75 },
  { name: 'Khasekhemwy', qid: 'Q298116', born: -2720, died: -2680, domains: ['Politics'], region: 'EG', sitelinks: 75 },
  { name: 'Djoser', qid: 'Q157968', born: -2690, died: -2670, domains: ['Politics'], region: 'EG', sitelinks: 105 },
  
  // -24th to -21st century BCE
  { name: 'Userkaf', qid: 'Q298128', born: -2498, died: -2491, domains: ['Politics'], region: 'EG', sitelinks: 75 },
  { name: 'Sahure', qid: 'Q298130', born: -2491, died: -2477, domains: ['Politics'], region: 'EG', sitelinks: 75 },
  { name: 'Unas', qid: 'Q157957', born: -2375, died: -2345, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  { name: 'Pepi I', qid: 'Q157958', born: -2335, died: -2285, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  { name: 'Pepi II', qid: 'Q157959', born: -2278, died: -2184, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  { name: 'Sargon of Akkad', qid: 'Q298196', born: -2334, died: -2279, domains: ['Politics'], region: 'IQ', sitelinks: 110 },
  { name: 'Mentuhotep II', qid: 'Q298150', born: -2061, died: -2010, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  
  // -18th to -17th century BCE (Middle Bronze Age)
  { name: 'Amenemhat II', qid: 'Q298156', born: -1929, died: -1895, domains: ['Politics'], region: 'EG', sitelinks: 75 },
  { name: 'Amenemhat III', qid: 'Q157962', born: -1860, died: -1814, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  { name: 'Sobekneferu', qid: 'Q157984', born: -1806, died: -1802, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  
  // -15th to -14th century BCE
  { name: 'Amenhotep I', qid: 'Q157970', born: -1541, died: -1520, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  { name: 'Amenhotep II', qid: 'Q157873', born: -1454, died: -1419, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  { name: 'Thutmose IV', qid: 'Q157874', born: -1425, died: -1388, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  
  // -13th to -12th century BCE
  { name: 'Ramesses IV', qid: 'Q1529', born: -1155, died: -1149, domains: ['Politics'], region: 'EG', sitelinks: 75 },
  { name: 'Ramesses V', qid: 'Q1530', born: -1149, died: -1145, domains: ['Politics'], region: 'EG', sitelinks: 73 },
  { name: 'Ramesses VI', qid: 'Q1531', born: -1145, died: -1137, domains: ['Politics'], region: 'EG', sitelinks: 75 },
  
  // -11th to -10th century BCE (Iron Age transition)
  { name: 'Ashur-Dan II', qid: 'Q313291', born: -934, died: -912, domains: ['Politics'], region: 'IQ', sitelinks: 70 },
  { name: 'Adad-nirari II', qid: 'Q313290', born: -912, died: -891, domains: ['Politics'], region: 'IQ', sitelinks: 70 },
  { name: 'Tukulti-Ninurta II', qid: 'Q313294', born: -891, died: -884, domains: ['Politics'], region: 'IQ', sitelinks: 70 },
  
  // -9th century BCE
  { name: 'Jehu', qid: 'Q310301', born: -880, died: -841, domains: ['Politics'], region: 'IL', sitelinks: 80 },
  { name: 'Jehoahaz', qid: 'Q310302', born: -841, died: -814, domains: ['Politics'], region: 'IL', sitelinks: 70 },
  { name: 'Joash of Israel', qid: 'Q310303', born: -822, died: -805, domains: ['Politics'], region: 'IL', sitelinks: 70 },
  { name: 'Jeroboam II', qid: 'Q312512', born: -786, died: -746, domains: ['Politics'], region: 'IL', sitelinks: 75 },
  
  // -8th century BCE  
  { name: 'Shalmaneser V', qid: 'Q313311', born: -727, died: -722, domains: ['Politics'], region: 'IQ', sitelinks: 75 },
  { name: 'Manasseh of Judah', qid: 'Q310307', born: -711, died: -643, domains: ['Politics'], region: 'IL', sitelinks: 80 },
  { name: 'Hoshea', qid: 'Q310304', born: -732, died: -723, domains: ['Politics'], region: 'IL', sitelinks: 70 },
  { name: 'Hezekiah ben Ahaz', qid: 'Q48584', born: -739, died: -687, domains: ['Politics', 'Religion'], region: 'IL', sitelinks: 100 },
  
  // -7th century BCE
  { name: 'Manasseh', qid: 'Q310307', born: -711, died: -643, domains: ['Politics'], region: 'IL', sitelinks: 80 },
  { name: 'Amon of Judah', qid: 'Q310308', born: -664, died: -640, domains: ['Politics'], region: 'IL', sitelinks: 70 },
  { name: 'Jehoahaz of Judah', qid: 'Q310309', born: -633, died: -609, domains: ['Politics'], region: 'IL', sitelinks: 70 },
  { name: 'Jehoiakim', qid: 'Q310310', born: -635, died: -598, domains: ['Politics'], region: 'IL', sitelinks: 75 },
  { name: 'Zedekiah', qid: 'Q310312', born: -618, died: -587, domains: ['Politics'], region: 'IL', sitelinks: 75 },
  { name: 'Pittacus of Mytilene', qid: 'Q310346', born: -640, died: -568, domains: ['Philosophy', 'Politics'], region: 'GR', sitelinks: 75 },
  { name: 'Periander', qid: 'Q310347', born: -627, died: -585, domains: ['Politics'], region: 'GR', sitelinks: 75 },
  { name: 'Bias of Priene', qid: 'Q310348', born: -590, died: -530, domains: ['Philosophy'], region: 'TR', sitelinks: 70 },
  { name: 'Cleobulus', qid: 'Q310349', born: -600, died: -530, domains: ['Philosophy'], region: 'GR', sitelinks: 70 },
  { name: 'Solon', qid: 'Q36303', born: -638, died: -558, domains: ['Philosophy', 'Politics'], region: 'GR', sitelinks: 110 },
  { name: 'Sappho', qid: 'Q17892', born: -630, died: -570, domains: ['Literature'], region: 'GR', sitelinks: 120 },
  { name: 'Alcaeus of Mytilene', qid: 'Q310350', born: -620, died: -580, domains: ['Literature'], region: 'GR', sitelinks: 75 },
  { name: 'Stesichorus', qid: 'Q310351', born: -632, died: -556, domains: ['Literature'], region: 'IT', sitelinks: 75 },
  
  // -6th century BCE (fill more)
  { name: 'Pisistratus', qid: 'Q310352', born: -607, died: -527, domains: ['Politics'], region: 'GR', sitelinks: 85 },
  { name: 'Cleisthenes', qid: 'Q310353', born: -570, died: -508, domains: ['Politics'], region: 'GR', sitelinks: 85 },
  { name: 'Anacreon', qid: 'Q192147', born: -582, died: -485, domains: ['Literature'], region: 'GR', sitelinks: 85 },
  { name: 'Simonides of Ceos', qid: 'Q193457', born: -556, died: -468, domains: ['Literature'], region: 'GR', sitelinks: 80 },
  { name: 'Ibycus', qid: 'Q310354', born: -540, died: -450, domains: ['Literature'], region: 'IT', sitelinks: 70 },
  
  // -5th century BCE (add more figures)
  { name: 'Pausanias', qid: 'Q310355', born: -510, died: -470, domains: ['Politics'], region: 'GR', sitelinks: 75 },
  { name: 'Cimon', qid: 'Q184191', born: -510, died: -450, domains: ['Politics'], region: 'GR', sitelinks: 80 },
  { name: 'Pericles', qid: 'Q10289', born: -495, died: -429, domains: ['Politics'], region: 'GR', sitelinks: 130 },
  { name: 'Cleon', qid: 'Q310356', born: -464, died: -422, domains: ['Politics'], region: 'GR', sitelinks: 75 },
  { name: 'Nicias', qid: 'Q310357', born: -470, died: -413, domains: ['Politics'], region: 'GR', sitelinks: 75 },
  { name: 'Zeno of Elea', qid: 'Q185417', born: -495, died: -430, domains: ['Philosophy', 'Math'], region: 'IT', sitelinks: 95 },
  { name: 'Parmenides', qid: 'Q184796', born: -515, died: -450, domains: ['Philosophy'], region: 'IT', sitelinks: 100 },
  { name: 'Melissus of Samos', qid: 'Q310358', born: -500, died: -440, domains: ['Philosophy'], region: 'GR', sitelinks: 70 },
  { name: 'Gorgias', qid: 'Q310359', born: -483, died: -375, domains: ['Philosophy'], region: 'IT', sitelinks: 85 },
  { name: 'Prodicus', qid: 'Q310360', born: -465, died: -395, domains: ['Philosophy'], region: 'GR', sitelinks: 70 },
  { name: 'Hippias', qid: 'Q310361', born: -460, died: -399, domains: ['Philosophy'], region: 'GR', sitelinks: 70 },
  { name: 'Cratinus', qid: 'Q310362', born: -519, died: -423, domains: ['Literature'], region: 'GR', sitelinks: 70 },
  { name: 'Eupolis', qid: 'Q310363', born: -446, died: -411, domains: ['Literature'], region: 'GR', sitelinks: 70 },
  { name: 'Myron', qid: 'Q192681', born: -480, died: -440, domains: ['Art'], region: 'GR', sitelinks: 95 },
  { name: 'Zeuxis', qid: 'Q310364', born: -464, died: -398, domains: ['Art'], region: 'GR', sitelinks: 75 },
  { name: 'Parrhasius', qid: 'Q310365', born: -440, died: -390, domains: ['Art'], region: 'GR', sitelinks: 70 },
  
  // -4th century BCE (more figures)
  { name: 'Phocion', qid: 'Q310366', born: -402, died: -318, domains: ['Politics'], region: 'GR', sitelinks: 75 },
  { name: 'Lycurgus of Athens', qid: 'Q310367', born: -390, died: -324, domains: ['Politics'], region: 'GR', sitelinks: 70 },
  { name: 'Dinarchus', qid: 'Q310368', born: -361, died: -291, domains: ['Literature'], region: 'GR', sitelinks: 70 },
  { name: 'Aeschines', qid: 'Q159762', born: -389, died: -314, domains: ['Politics', 'Literature'], region: 'GR', sitelinks: 80 },
  { name: 'Hyperides', qid: 'Q310369', born: -390, died: -322, domains: ['Literature'], region: 'GR', sitelinks: 70 },
  { name: 'Antisthenes', qid: 'Q192581', born: -445, died: -365, domains: ['Philosophy'], region: 'GR', sitelinks: 85 },
  { name: 'Aristippus', qid: 'Q192582', born: -435, died: -356, domains: ['Philosophy'], region: 'LY', sitelinks: 80 },
  { name: 'Speusippus', qid: 'Q310370', born: -408, died: -339, domains: ['Philosophy'], region: 'GR', sitelinks: 75 },
  { name: 'Xenocrates', qid: 'Q310371', born: -396, died: -314, domains: ['Philosophy'], region: 'GR', sitelinks: 75 },
  { name: 'Pyrrho', qid: 'Q192584', born: -365, died: -275, domains: ['Philosophy'], region: 'GR', sitelinks: 85 },
  { name: 'Timon of Phlius', qid: 'Q310372', born: -320, died: -230, domains: ['Philosophy'], region: 'GR', sitelinks: 70 },
  { name: 'Eudoxus of Cnidus', qid: 'Q192272', born: -408, died: -355, domains: ['Math', 'Science'], region: 'TR', sitelinks: 85 },
  { name: 'Menaechmus', qid: 'Q310373', born: -380, died: -320, domains: ['Math'], region: 'GR', sitelinks: 70 },
  { name: 'Aristoxenus', qid: 'Q310374', born: -375, died: -300, domains: ['Music', 'Philosophy'], region: 'IT', sitelinks: 75 },
  { name: 'Timotheus of Miletus', qid: 'Q310375', born: -450, died: -360, domains: ['Music'], region: 'TR', sitelinks: 70 },
  { name: 'Lysippus', qid: 'Q192965', born: -390, died: -300, domains: ['Art'], region: 'GR', sitelinks: 90 },
  { name: 'Leochares', qid: 'Q310376', born: -390, died: -320, domains: ['Art'], region: 'GR', sitelinks: 70 },
  
  // -3rd century BCE (more figures)
  { name: 'Antigonus I', qid: 'Q191386', born: -382, died: -301, domains: ['Politics'], region: 'TR', sitelinks: 85 },
  { name: 'Demetrius I Poliorcetes', qid: 'Q191388', born: -337, died: -283, domains: ['Politics'], region: 'GR', sitelinks: 85 },
  { name: 'Lysimachus', qid: 'Q310377', born: -360, died: -281, domains: ['Politics'], region: 'TR', sitelinks: 75 },
  { name: 'Cassander', qid: 'Q310378', born: -350, died: -297, domains: ['Politics'], region: 'GR', sitelinks: 75 },
  { name: 'Agathocles of Syracuse', qid: 'Q310379', born: -361, died: -289, domains: ['Politics'], region: 'IT', sitelinks: 80 },
  { name: 'Magas of Cyrene', qid: 'Q310380', born: -317, died: -250, domains: ['Politics'], region: 'LY', sitelinks: 65 },
  { name: 'Antiochus II', qid: 'Q191388', born: -286, died: -246, domains: ['Politics'], region: 'SY', sitelinks: 75 },
  { name: 'Seleucus II', qid: 'Q191390', born: -265, died: -225, domains: ['Politics'], region: 'SY', sitelinks: 70 },
  { name: 'Aratus of Sicyon', qid: 'Q310381', born: -271, died: -213, domains: ['Politics'], region: 'GR', sitelinks: 70 },
  { name: 'Philopoemen', qid: 'Q310382', born: -253, died: -183, domains: ['Politics'], region: 'GR', sitelinks: 75 },
  { name: 'Zeno of Citium', qid: 'Q165271', born: -334, died: -262, domains: ['Philosophy'], region: 'CY', sitelinks: 95 },
  { name: 'Arcesilaus', qid: 'Q310383', born: -316, died: -241, domains: ['Philosophy'], region: 'GR', sitelinks: 70 },
  { name: 'Epicurus', qid: 'Q89378', born: -341, died: -270, domains: ['Philosophy'], region: 'GR', sitelinks: 115 },
  { name: 'Metrodorus of Lampsacus', qid: 'Q310384', born: -331, died: -278, domains: ['Philosophy'], region: 'TR', sitelinks: 65 },
  { name: 'Hermarchus', qid: 'Q310385', born: -325, died: -250, domains: ['Philosophy'], region: 'TR', sitelinks: 60 },
  { name: 'Conon of Samos', qid: 'Q310386', born: -280, died: -220, domains: ['Math', 'Science'], region: 'GR', sitelinks: 70 },
  { name: 'Apollonius of Perga', qid: 'Q134916', born: -262, died: -190, domains: ['Math'], region: 'TR', sitelinks: 85 },
  { name: 'Ctesibius', qid: 'Q310387', born: -285, died: -222, domains: ['Science'], region: 'EG', sitelinks: 75 },
  { name: 'Philo of Byzantium', qid: 'Q310388', born: -280, died: -220, domains: ['Science'], region: 'TR', sitelinks: 70 },
  { name: 'Eratosthenes', qid: 'Q43045', born: -276, died: -194, domains: ['Math', 'Science'], region: 'LY', sitelinks: 120 },
  { name: 'Livius Andronicus', qid: 'Q310389', born: -284, died: -204, domains: ['Literature'], region: 'IT', sitelinks: 75 },
  { name: 'Gnaeus Naevius', qid: 'Q310390', born: -270, died: -201, domains: ['Literature'], region: 'IT', sitelinks: 70 },
  { name: 'Ennius', qid: 'Q192265', born: -239, died: -169, domains: ['Literature'], region: 'IT', sitelinks: 85 },
  
  // -2nd century BCE (more)
  { name: 'Antiochus VII', qid: 'Q191394', born: -164, died: -129, domains: ['Politics'], region: 'SY', sitelinks: 70 },
  { name: 'Seleucus IV', qid: 'Q191391', born: -218, died: -175, domains: ['Politics'], region: 'SY', sitelinks: 70 },
  { name: 'Philip V of Macedon', qid: 'Q313430', born: -238, died: -179, domains: ['Politics'], region: 'GR', sitelinks: 80 },
  { name: 'Perseus of Macedon', qid: 'Q313431', born: -212, died: -166, domains: ['Politics'], region: 'GR', sitelinks: 75 },
  { name: 'Attalus I', qid: 'Q310391', born: -269, died: -197, domains: ['Politics'], region: 'TR', sitelinks: 70 },
  { name: 'Eumenes II', qid: 'Q310392', born: -221, died: -160, domains: ['Politics'], region: 'TR', sitelinks: 70 },
  { name: 'Attalus II', qid: 'Q310393', born: -220, died: -138, domains: ['Politics'], region: 'TR', sitelinks: 65 },
  { name: 'Masinissa', qid: 'Q310394', born: -238, died: -148, domains: ['Politics'], region: 'DZ', sitelinks: 75 },
  { name: 'Cato the Elder', qid: 'Q185016', born: -234, died: -149, domains: ['Politics', 'Literature'], region: 'IT', sitelinks: 95 },
  { name: 'Lucius Aemilius Paullus', qid: 'Q310395', born: -229, died: -160, domains: ['Politics'], region: 'IT', sitelinks: 70 },
  { name: 'Flamininus', qid: 'Q310396', born: -228, died: -174, domains: ['Politics'], region: 'IT', sitelinks: 70 },
  { name: 'Lucius Cornelius Scipio', qid: 'Q310397', born: -230, died: -183, domains: ['Politics'], region: 'IT', sitelinks: 65 },
  { name: 'Terence', qid: 'Q7262', born: -195, died: -159, domains: ['Literature'], region: 'DZ', sitelinks: 100 },
  { name: 'Pacuvius', qid: 'Q310398', born: -220, died: -130, domains: ['Literature'], region: 'IT', sitelinks: 70 },
  { name: 'Accius', qid: 'Q310399', born: -170, died: -86, domains: ['Literature'], region: 'IT', sitelinks: 70 },
  { name: 'Lucilius', qid: 'Q310400', born: -180, died: -102, domains: ['Literature'], region: 'IT', sitelinks: 70 },
  
  // -1st century BCE (add more)
  { name: 'Tigranes II', qid: 'Q310401', born: -140, died: -55, domains: ['Politics'], region: 'AM', sitelinks: 80 },
  { name: 'Juba I', qid: 'Q310402', born: -85, died: -46, domains: ['Politics'], region: 'DZ', sitelinks: 70 },
  { name: 'Pharnaces II', qid: 'Q310403', born: -97, died: -47, domains: ['Politics'], region: 'TR', sitelinks: 70 },
  { name: 'Ariovistus', qid: 'Q310404', born: -100, died: -54, domains: ['Politics'], region: 'DE', sitelinks: 70 },
  { name: 'Vercingetorix', qid: 'Q83406', born: -82, died: -46, domains: ['Politics'], region: 'FR', sitelinks: 110 },
  { name: 'Quintus Sertorius', qid: 'Q310405', born: -126, died: -72, domains: ['Politics'], region: 'IT', sitelinks: 75 },
  { name: 'Lepidus', qid: 'Q310406', born: -89, died: -13, domains: ['Politics'], region: 'IT', sitelinks: 80 },
  { name: 'Antony', qid: 'Q51673', born: -83, died: -30, domains: ['Politics'], region: 'IT', sitelinks: 125 },
  { name: 'Agrippa', qid: 'Q191384', born: -63, died: -12, domains: ['Politics'], region: 'IT', sitelinks: 95 },
  { name: 'Varro', qid: 'Q191384', born: -116, died: -27, domains: ['Literature', 'Science'], region: 'IT', sitelinks: 90 },
  { name: 'Nepos', qid: 'Q310407', born: -110, died: -24, domains: ['Literature'], region: 'IT', sitelinks: 75 },
  { name: 'Diodorus Siculus', qid: 'Q134461', born: -90, died: -30, domains: ['Literature'], region: 'IT', sitelinks: 90 },
  { name: 'Strabo', qid: 'Q45936', born: -64, died: 24, domains: ['Science', 'Literature'], region: 'TR', sitelinks: 105 },
  { name: 'Posidonius', qid: 'Q311329', born: -135, died: -51, domains: ['Philosophy', 'Science'], region: 'SY', sitelinks: 85 },
  { name: 'Asclepiades of Bithynia', qid: 'Q310408', born: -124, died: -40, domains: ['Medicine'], region: 'TR', sitelinks: 70 },
  
  // 1st century CE (add more)
  { name: 'Germanicus', qid: 'Q191384', born: -15, died: 19, domains: ['Politics'], region: 'IT', sitelinks: 90 },
  { name: 'Sejanus', qid: 'Q310409', born: -20, died: 31, domains: ['Politics'], region: 'IT', sitelinks: 75 },
  { name: 'Piso', qid: 'Q310410', born: -50, died: 20, domains: ['Politics'], region: 'IT', sitelinks: 65 },
  { name: 'Messalina', qid: 'Q242618', born: 17, died: 48, domains: ['Politics'], region: 'IT', sitelinks: 95 },
  { name: 'Corbulo', qid: 'Q310411', born: 7, died: 67, domains: ['Politics'], region: 'IT', sitelinks: 70 },
  { name: 'Galba', qid: 'Q1417', born: -3, died: 69, domains: ['Politics'], region: 'ES', sitelinks: 95 },
  { name: 'Otho', qid: 'Q1418', born: 32, died: 69, domains: ['Politics'], region: 'IT', sitelinks: 90 },
  { name: 'Vitellius', qid: 'Q1420', born: 15, died: 69, domains: ['Politics'], region: 'IT', sitelinks: 90 },
  { name: 'Lucan', qid: 'Q168905', born: 39, died: 65, domains: ['Literature'], region: 'ES', sitelinks: 95 },
  { name: 'Persius', qid: 'Q310412', born: 34, died: 62, domains: ['Literature'], region: 'IT', sitelinks: 70 },
  { name: 'Petronius', qid: 'Q172054', born: 27, died: 66, domains: ['Literature'], region: 'IT', sitelinks: 95 },
  { name: 'Columella', qid: 'Q310413', born: 4, died: 70, domains: ['Science'], region: 'ES', sitelinks: 75 },
  { name: 'Frontinus', qid: 'Q310414', born: 40, died: 103, domains: ['Science', 'Politics'], region: 'IT', sitelinks: 75 },
  { name: 'John the Apostle', qid: 'Q44015', born: 6, died: 100, domains: ['Religion'], region: 'IL', sitelinks: 140 },
  { name: 'Mary Magdalene', qid: 'Q63070', born: 3, died: 63, domains: ['Religion'], region: 'IL', sitelinks: 130 },
  { name: 'James the Just', qid: 'Q219517', born: 1, died: 62, domains: ['Religion'], region: 'IL', sitelinks: 100 },
  
  // 2nd century CE
  { name: 'Septimius Severus', qid: 'Q1442', born: 145, died: 211, domains: ['Politics'], region: 'LY', sitelinks: 115 },
  { name: 'Pertinax', qid: 'Q1436', born: 126, died: 193, domains: ['Politics'], region: 'IT', sitelinks: 85 },
  { name: 'Didius Julianus', qid: 'Q1437', born: 133, died: 193, domains: ['Politics'], region: 'IT', sitelinks: 80 },
  { name: 'Pescennius Niger', qid: 'Q310415', born: 135, died: 194, domains: ['Politics'], region: 'IT', sitelinks: 70 },
  { name: 'Clodius Albinus', qid: 'Q310416', born: 147, died: 197, domains: ['Politics'], region: 'DZ', sitelinks: 70 },
  { name: 'Fronto', qid: 'Q310417', born: 100, died: 170, domains: ['Literature'], region: 'DZ', sitelinks: 75 },
  { name: 'Aulus Gellius', qid: 'Q310418', born: 125, died: 180, domains: ['Literature'], region: 'IT', sitelinks: 75 },
  { name: 'Appian', qid: 'Q207428', born: 95, died: 165, domains: ['Literature'], region: 'EG', sitelinks: 85 },
  { name: 'Aelius Aristides', qid: 'Q310419', born: 117, died: 181, domains: ['Literature'], region: 'TR', sitelinks: 70 },
  { name: 'Menander of Laodicea', qid: 'Q310420', born: 150, died: 215, domains: ['Literature'], region: 'SY', sitelinks: 60 },
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
  for (const fig of gapFillers) {
    if (existingQids.has(fig.qid)) continue;
    toAdd.push(fig);
    existingQids.add(fig.qid);
  }
  
  console.log(`Adding ${toAdd.length} gap-filler ancient figures for continuity`);
  const updated = [...people, ...toAdd];
  savePeople(updated);
  console.log(`Total people: ${updated.length}`);
  
  // Save the additions for reference
  fs.writeFileSync('./scripts/gap_filler_added.json', JSON.stringify(toAdd, null, 2));
  console.log('Saved additions to scripts/gap_filler_added.json');
}

main();


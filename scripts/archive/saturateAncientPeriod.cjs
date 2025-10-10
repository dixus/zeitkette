const fs = require('fs');

// Massive ancient saturation: Focus on temporal continuity
// Goal: Multiple people per domain per century for chain building
const ancientSaturation = [
  // -23rd to -20th century BCE (Early Bronze Age)
  { name: 'Gilgamesh', qid: 'Q182966', born: -2700, died: -2600, domains: ['Politics', 'Literature'], region: 'IQ', sitelinks: 140 },
  { name: 'Khufu', qid: 'Q157899', born: -2589, died: -2566, domains: ['Politics'], region: 'EG', sitelinks: 125 },
  { name: 'Sneferu', qid: 'Q157953', born: -2613, died: -2589, domains: ['Politics'], region: 'EG', sitelinks: 95 },
  { name: 'Khafre', qid: 'Q157954', born: -2558, died: -2532, domains: ['Politics'], region: 'EG', sitelinks: 110 },
  { name: 'Menkaure', qid: 'Q157956', born: -2532, died: -2503, domains: ['Politics'], region: 'EG', sitelinks: 100 },
  { name: 'Imhotep', qid: 'Q188617', born: -2650, died: -2600, domains: ['Science', 'Medicine'], region: 'EG', sitelinks: 115 },
  
  // -19th to -17th century BCE
  { name: 'Amenemhat I', qid: 'Q157960', born: -1991, died: -1962, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  { name: 'Senusret I', qid: 'Q157961', born: -1971, died: -1926, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  { name: 'Senusret III', qid: 'Q157963', born: -1878, died: -1839, domains: ['Politics'], region: 'EG', sitelinks: 90 },
  { name: 'Abraham', qid: 'Q9181', born: -2000, died: -1825, domains: ['Religion', 'Philosophy'], region: 'IQ', sitelinks: 155 },
  { name: 'Naram-Sin of Akkad', qid: 'Q313211', born: -2254, died: -2218, domains: ['Politics'], region: 'IQ', sitelinks: 90 },
  
  // -16th to -13th century BCE (Late Bronze Age)
  { name: 'Ahmose I', qid: 'Q157969', born: -1550, died: -1525, domains: ['Politics'], region: 'EG', sitelinks: 95 },
  { name: 'Amenhotep III', qid: 'Q157872', born: -1401, died: -1353, domains: ['Politics'], region: 'EG', sitelinks: 105 },
  { name: 'Seti I', qid: 'Q1377', born: -1323, died: -1279, domains: ['Politics'], region: 'EG', sitelinks: 100 },
  { name: 'Merneptah', qid: 'Q1526', born: -1273, died: -1203, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  { name: 'Suppiluliuma I', qid: 'Q312598', born: -1380, died: -1322, domains: ['Politics'], region: 'TR', sitelinks: 85 },
  
  // -12th to -11th century BCE (Iron Age transition)
  { name: 'Tiglath-Pileser I', qid: 'Q313307', born: -1115, died: -1076, domains: ['Politics'], region: 'IQ', sitelinks: 85 },
  { name: 'Ramesses III', qid: 'Q1528', born: -1217, died: -1155, domains: ['Politics'], region: 'EG', sitelinks: 110 },
  { name: 'Ramesses XI', qid: 'Q1533', born: -1140, died: -1077, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  { name: 'Saul', qid: 'Q28730', born: -1079, died: -1007, domains: ['Politics', 'Religion'], region: 'IL', sitelinks: 125 },
  
  // -10th century BCE
  { name: 'Rehoboam', qid: 'Q209450', born: -972, died: -913, domains: ['Politics'], region: 'IL', sitelinks: 85 },
  { name: 'Jeroboam I', qid: 'Q312511', born: -975, died: -907, domains: ['Politics'], region: 'IL', sitelinks: 80 },
  { name: 'Shoshenq I', qid: 'Q1537', born: -974, died: -924, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  
  // -9th century BCE
  { name: 'Ashurnasirpal II', qid: 'Q313295', born: -883, died: -859, domains: ['Politics'], region: 'IQ', sitelinks: 85 },
  { name: 'Shalmaneser III', qid: 'Q313299', born: -859, died: -824, domains: ['Politics'], region: 'IQ', sitelinks: 85 },
  { name: 'Elijah', qid: 'Q133507', born: -900, died: -849, domains: ['Religion', 'Philosophy'], region: 'IL', sitelinks: 125 },
  { name: 'Ahab', qid: 'Q310298', born: -874, died: -853, domains: ['Politics'], region: 'IL', sitelinks: 95 },
  { name: 'Jezebel', qid: 'Q242252', born: -875, died: -852, domains: ['Politics'], region: 'IL', sitelinks: 105 },
  
  // -8th century BCE
  { name: 'Tiglath-Pileser III', qid: 'Q313308', born: -745, died: -727, domains: ['Politics'], region: 'IQ', sitelinks: 90 },
  { name: 'Sargon II', qid: 'Q313314', born: -722, died: -705, domains: ['Politics'], region: 'IQ', sitelinks: 95 },
  { name: 'Sennacherib', qid: 'Q313315', born: -705, died: -681, domains: ['Politics'], region: 'IQ', sitelinks: 100 },
  { name: 'Hezekiah', qid: 'Q48584', born: -739, died: -687, domains: ['Politics', 'Religion'], region: 'IL', sitelinks: 100 },
  { name: 'Hosea', qid: 'Q215668', born: -750, died: -690, domains: ['Religion', 'Philosophy'], region: 'IL', sitelinks: 90 },
  { name: 'Amos', qid: 'Q188794', born: -760, died: -710, domains: ['Religion'], region: 'IL', sitelinks: 90 },
  { name: 'Lycurgus of Sparta', qid: 'Q192276', born: -820, died: -730, domains: ['Politics', 'Philosophy'], region: 'GR', sitelinks: 100 },
  
  // -7th century BCE
  { name: 'Esarhaddon', qid: 'Q313316', born: -681, died: -669, domains: ['Politics'], region: 'IQ', sitelinks: 90 },
  { name: 'Ashurbanipal', qid: 'Q36566', born: -685, died: -631, domains: ['Politics'], region: 'IQ', sitelinks: 110 },
  { name: 'Josiah', qid: 'Q208147', born: -649, died: -609, domains: ['Politics', 'Religion'], region: 'IL', sitelinks: 100 },
  { name: 'Psamtik I', qid: 'Q1543', born: -664, died: -610, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  { name: 'Draco', qid: 'Q182454', born: -650, died: -600, domains: ['Politics'], region: 'GR', sitelinks: 95 },
  { name: 'Jeremiah', qid: 'Q188794', born: -655, died: -586, domains: ['Religion', 'Philosophy'], region: 'IL', sitelinks: 105 },
  { name: 'Ezekiel', qid: 'Q188794', born: -622, died: -570, domains: ['Religion', 'Philosophy'], region: 'IL', sitelinks: 100 },
  { name: 'Archilochus', qid: 'Q192146', born: -680, died: -645, domains: ['Literature'], region: 'GR', sitelinks: 85 },
  
  // -6th century BCE (rich period already, add continuity)
  { name: 'Nabopolassar', qid: 'Q310662', born: -658, died: -605, domains: ['Politics'], region: 'IQ', sitelinks: 85 },
  { name: 'Necho II', qid: 'Q1544', born: -610, died: -595, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  { name: 'Apries', qid: 'Q310651', born: -589, died: -567, domains: ['Politics'], region: 'EG', sitelinks: 80 },
  { name: 'Amasis II', qid: 'Q310652', born: -570, died: -526, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  { name: 'Cambyses II', qid: 'Q243107', born: -558, died: -522, domains: ['Politics'], region: 'IR', sitelinks: 100 },
  { name: 'Anaximenes', qid: 'Q182046', born: -585, died: -528, domains: ['Philosophy'], region: 'GR', sitelinks: 95 },
  { name: 'Xenophanes', qid: 'Q134179', born: -570, died: -475, domains: ['Philosophy'], region: 'GR', sitelinks: 95 },
  { name: 'Hecataeus of Miletus', qid: 'Q313304', born: -550, died: -476, domains: ['Literature', 'Science'], region: 'GR', sitelinks: 80 },
  { name: 'Croesus', qid: 'Q83891', born: -595, died: -547, domains: ['Politics'], region: 'TR', sitelinks: 105 },
  { name: 'Ezra', qid: 'Q162262', born: -480, died: -440, domains: ['Religion', 'Literature'], region: 'IL', sitelinks: 100 },
  
  // -5th century BCE (add more continuity)
  { name: 'Xerxes I', qid: 'Q178903', born: -519, died: -465, domains: ['Politics'], region: 'IR', sitelinks: 115 },
  { name: 'Artaxerxes I', qid: 'Q243869', born: -465, died: -424, domains: ['Politics'], region: 'IR', sitelinks: 90 },
  { name: 'Darius II', qid: 'Q243870', born: -454, died: -404, domains: ['Politics'], region: 'IR', sitelinks: 85 },
  { name: 'Leonidas I', qid: 'Q184211', born: -540, died: -480, domains: ['Politics'], region: 'GR', sitelinks: 130 },
  { name: 'Themistocles', qid: 'Q192056', born: -524, died: -459, domains: ['Politics'], region: 'GR', sitelinks: 105 },
  { name: 'Alcibiades', qid: 'Q160464', born: -450, died: -404, domains: ['Politics'], region: 'GR', sitelinks: 105 },
  { name: 'Pindar', qid: 'Q134929', born: -518, died: -438, domains: ['Literature'], region: 'GR', sitelinks: 105 },
  { name: 'Phidias', qid: 'Q177302', born: -480, died: -430, domains: ['Art'], region: 'GR', sitelinks: 110 },
  { name: 'Polykleitos', qid: 'Q192110', born: -480, died: -420, domains: ['Art'], region: 'GR', sitelinks: 85 },
  { name: 'Anaxagoras', qid: 'Q133303', born: -500, died: -428, domains: ['Philosophy', 'Science'], region: 'GR', sitelinks: 100 },
  { name: 'Empedocles', qid: 'Q41165', born: -490, died: -430, domains: ['Philosophy'], region: 'IT', sitelinks: 105 },
  { name: 'Protagoras', qid: 'Q133714', born: -490, died: -420, domains: ['Philosophy'], region: 'GR', sitelinks: 100 },
  { name: 'Democritus', qid: 'Q41980', born: -460, died: -370, domains: ['Philosophy', 'Science'], region: 'GR', sitelinks: 120 },
  { name: 'Leucippus', qid: 'Q192269', born: -480, died: -420, domains: ['Philosophy'], region: 'GR', sitelinks: 85 },
  
  // -4th century BCE (add more)
  { name: 'Artaxerxes II', qid: 'Q243871', born: -436, died: -358, domains: ['Politics'], region: 'IR', sitelinks: 85 },
  { name: 'Artaxerxes III', qid: 'Q243872', born: -425, died: -338, domains: ['Politics'], region: 'IR', sitelinks: 80 },
  { name: 'Philip II of Macedon', qid: 'Q130206', born: -382, died: -336, domains: ['Politics'], region: 'GR', sitelinks: 115 },
  { name: 'Demosthenes', qid: 'Q40939', born: -384, died: -322, domains: ['Philosophy', 'Politics'], region: 'GR', sitelinks: 105 },
  { name: 'Isocrates', qid: 'Q192243', born: -436, died: -338, domains: ['Literature', 'Philosophy'], region: 'GR', sitelinks: 90 },
  { name: 'Xenophon', qid: 'Q129772', born: -430, died: -354, domains: ['Literature', 'Philosophy'], region: 'GR', sitelinks: 105 },
  { name: 'Diogenes of Sinope', qid: 'Q36033', born: -412, died: -323, domains: ['Philosophy'], region: 'GR', sitelinks: 125 },
  { name: 'Theophrastus', qid: 'Q159604', born: -371, died: -287, domains: ['Philosophy', 'Science'], region: 'GR', sitelinks: 95 },
  { name: 'Praxiteles', qid: 'Q193272', born: -395, died: -330, domains: ['Art'], region: 'GR', sitelinks: 100 },
  { name: 'Scopas', qid: 'Q346671', born: -420, died: -330, domains: ['Art'], region: 'GR', sitelinks: 80 },
  { name: 'Apelles', qid: 'Q181753', born: -370, died: -306, domains: ['Art'], region: 'GR', sitelinks: 95 },
  { name: 'Chanakya', qid: 'Q192599', born: -375, died: -283, domains: ['Philosophy', 'Politics'], region: 'IN', sitelinks: 110 },
  { name: 'Panini', qid: 'Q188969', born: -520, died: -460, domains: ['Philosophy', 'Literature'], region: 'IN', sitelinks: 90 },
  
  // -3rd century BCE
  { name: 'Ptolemy I Soter', qid: 'Q168261', born: -367, died: -283, domains: ['Politics'], region: 'EG', sitelinks: 105 },
  { name: 'Ptolemy II', qid: 'Q39576', born: -308, died: -246, domains: ['Politics'], region: 'EG', sitelinks: 90 },
  { name: 'Ptolemy III', qid: 'Q39577', born: -284, died: -222, domains: ['Politics'], region: 'EG', sitelinks: 85 },
  { name: 'Seleucus I Nicator', qid: 'Q315052', born: -358, died: -281, domains: ['Politics'], region: 'SY', sitelinks: 95 },
  { name: 'Antiochus I', qid: 'Q191387', born: -324, died: -261, domains: ['Politics'], region: 'SY', sitelinks: 80 },
  { name: 'Antiochus III', qid: 'Q191389', born: -241, died: -187, domains: ['Politics'], region: 'SY', sitelinks: 90 },
  { name: 'Pyrrhus of Epirus', qid: 'Q83891', born: -319, died: -272, domains: ['Politics'], region: 'GR', sitelinks: 110 },
  { name: 'Apollonius of Rhodes', qid: 'Q207943', born: -295, died: -215, domains: ['Literature'], region: 'EG', sitelinks: 90 },
  { name: 'Callimachus', qid: 'Q189811', born: -310, died: -240, domains: ['Literature'], region: 'EG', sitelinks: 85 },
  { name: 'Theocritus', qid: 'Q193430', born: -300, died: -260, domains: ['Literature'], region: 'IT', sitelinks: 85 },
  { name: 'Aristarchus of Samos', qid: 'Q134795', born: -310, died: -230, domains: ['Science', 'Math'], region: 'GR', sitelinks: 100 },
  { name: 'Chrysippus', qid: 'Q187333', born: -279, died: -206, domains: ['Philosophy'], region: 'GR', sitelinks: 85 },
  { name: 'Cleanthes', qid: 'Q193452', born: -330, died: -230, domains: ['Philosophy'], region: 'GR', sitelinks: 80 },
  { name: 'Ashoka', qid: 'Q8457', born: -304, died: -232, domains: ['Politics'], region: 'IN', sitelinks: 130 },
  { name: 'Qin Shi Huang', qid: 'Q7192', born: -259, died: -210, domains: ['Politics'], region: 'CN', sitelinks: 155 },
  
  // -2nd century BCE
  { name: 'Antiochus IV Epiphanes', qid: 'Q191392', born: -215, died: -164, domains: ['Politics'], region: 'SY', sitelinks: 95 },
  { name: 'Mithridates VI', qid: 'Q83891', born: -135, died: -63, domains: ['Politics'], region: 'TR', sitelinks: 105 },
  { name: 'Judas Maccabeus', qid: 'Q312246', born: -190, died: -160, domains: ['Politics', 'Religion'], region: 'IL', sitelinks: 95 },
  { name: 'Scipio Aemilianus', qid: 'Q298162', born: -185, died: -129, domains: ['Politics'], region: 'IT', sitelinks: 90 },
  { name: 'Tiberius Gracchus', qid: 'Q202003', born: -163, died: -133, domains: ['Politics'], region: 'IT', sitelinks: 95 },
  { name: 'Gaius Gracchus', qid: 'Q191384', born: -154, died: -121, domains: ['Politics'], region: 'IT', sitelinks: 90 },
  { name: 'Marius', qid: 'Q183', born: -157, died: -86, domains: ['Politics'], region: 'IT', sitelinks: 105 },
  { name: 'Sulla', qid: 'Q203714', born: -138, died: -78, domains: ['Politics'], region: 'IT', sitelinks: 110 },
  { name: 'Polybius', qid: 'Q130819', born: -200, died: -118, domains: ['Literature'], region: 'GR', sitelinks: 100 },
  { name: 'Hipparchus', qid: 'Q191305', born: -190, died: -120, domains: ['Math', 'Science'], region: 'TR', sitelinks: 100 },
  { name: 'Panaetius', qid: 'Q311324', born: -185, died: -110, domains: ['Philosophy'], region: 'GR', sitelinks: 80 },
  { name: 'Carneades', qid: 'Q311322', born: -214, died: -129, domains: ['Philosophy'], region: 'GR', sitelinks: 80 },
  { name: 'Poseidonius', qid: 'Q311329', born: -135, died: -51, domains: ['Philosophy'], region: 'SY', sitelinks: 85 },
  { name: 'Emperor Wu of Han', qid: 'Q7185', born: -156, died: -87, domains: ['Politics'], region: 'CN', sitelinks: 100 },
  
  // -1st century BCE (add more continuity)
  { name: 'Pompey', qid: 'Q82672', born: -106, died: -48, domains: ['Politics'], region: 'IT', sitelinks: 130 },
  { name: 'Crassus', qid: 'Q173323', born: -115, died: -53, domains: ['Politics'], region: 'IT', sitelinks: 105 },
  { name: 'Cato the Younger', qid: 'Q185744', born: -95, died: -46, domains: ['Politics', 'Philosophy'], region: 'IT', sitelinks: 100 },
  { name: 'Brutus', qid: 'Q191831', born: -85, died: -42, domains: ['Politics'], region: 'IT', sitelinks: 115 },
  { name: 'Cassius', qid: 'Q295546', born: -85, died: -42, domains: ['Politics'], region: 'IT', sitelinks: 90 },
  { name: 'Lucretius', qid: 'Q6436', born: -99, died: -55, domains: ['Philosophy', 'Literature'], region: 'IT', sitelinks: 110 },
  { name: 'Catullus', qid: 'Q7231', born: -84, died: -54, domains: ['Literature'], region: 'IT', sitelinks: 105 },
  { name: 'Sallust', qid: 'Q192166', born: -86, died: -35, domains: ['Literature'], region: 'IT', sitelinks: 90 },
  { name: 'Vitruvius', qid: 'Q47163', born: -80, died: -15, domains: ['Science', 'Art'], region: 'IT', sitelinks: 105 },
  { name: 'Herod Antipas', qid: 'Q159916', born: -20, died: 39, domains: ['Politics'], region: 'IL', sitelinks: 90 },
  { name: 'Hillel the Elder', qid: 'Q311323', born: -110, died: 10, domains: ['Religion', 'Philosophy'], region: 'IL', sitelinks: 95 },
  { name: 'Philo of Alexandria', qid: 'Q134461', born: -25, died: 50, domains: ['Philosophy'], region: 'EG', sitelinks: 100 },
  
  // 1st century CE (add more)
  { name: 'Pontius Pilate', qid: 'Q17102', born: -10, died: 37, domains: ['Politics'], region: 'IT', sitelinks: 135 },
  { name: 'Caligula', qid: 'Q1409', born: 12, died: 41, domains: ['Politics'], region: 'IT', sitelinks: 145 },
  { name: 'Claudius', qid: 'Q1411', born: -10, died: 54, domains: ['Politics'], region: 'IT', sitelinks: 125 },
  { name: 'Agrippina the Younger', qid: 'Q229959', born: 15, died: 59, domains: ['Politics'], region: 'IT', sitelinks: 100 },
  { name: 'Vespasian', qid: 'Q1419', born: 9, died: 79, domains: ['Politics'], region: 'IT', sitelinks: 110 },
  { name: 'Titus', qid: 'Q1421', born: 39, died: 81, domains: ['Politics'], region: 'IT', sitelinks: 100 },
  { name: 'Domitian', qid: 'Q1423', born: 51, died: 96, domains: ['Politics'], region: 'IT', sitelinks: 100 },
  { name: 'Pliny the Elder', qid: 'Q82778', born: 23, died: 79, domains: ['Science', 'Literature'], region: 'IT', sitelinks: 110 },
  { name: 'Josephus', qid: 'Q134461', born: 37, died: 100, domains: ['Literature'], region: 'IL', sitelinks: 105 },
  { name: 'Plutarch', qid: 'Q41523', born: 46, died: 120, domains: ['Literature', 'Philosophy'], region: 'GR', sitelinks: 115 },
  { name: 'Epictetus', qid: 'Q101150', born: 50, died: 135, domains: ['Philosophy'], region: 'GR', sitelinks: 105 },
  { name: 'Martial', qid: 'Q1368', born: 40, died: 104, domains: ['Literature'], region: 'ES', sitelinks: 95 },
  { name: 'Statius', qid: 'Q193050', born: 45, died: 96, domains: ['Literature'], region: 'IT', sitelinks: 80 },
  { name: 'Quintilian', qid: 'Q183249', born: 35, died: 100, domains: ['Philosophy', 'Literature'], region: 'ES', sitelinks: 90 },
  { name: 'Pliny the Younger', qid: 'Q168707', born: 61, died: 113, domains: ['Literature', 'Politics'], region: 'IT', sitelinks: 95 },
  { name: 'Apollonius of Tyana', qid: 'Q191649', born: 15, died: 100, domains: ['Philosophy', 'Religion'], region: 'TR', sitelinks: 90 },
  { name: 'Hero of Alexandria', qid: 'Q130955', born: 10, died: 70, domains: ['Science', 'Math'], region: 'EG', sitelinks: 95 },
  { name: 'Paul the Apostle', qid: 'Q9200', born: 5, died: 67, domains: ['Religion', 'Philosophy'], region: 'TR', sitelinks: 165 },
  { name: 'Peter the Apostle', qid: 'Q5769', born: 1, died: 67, domains: ['Religion'], region: 'IL', sitelinks: 155 },
  
  // 2nd century CE (add more)
  { name: 'Nerva', qid: 'Q1425', born: 30, died: 98, domains: ['Politics'], region: 'IT', sitelinks: 95 },
  { name: 'Trajan', qid: 'Q1425', born: 53, died: 117, domains: ['Politics'], region: 'ES', sitelinks: 125 },
  { name: 'Hadrian', qid: 'Q1427', born: 76, died: 138, domains: ['Politics'], region: 'IT', sitelinks: 130 },
  { name: 'Antoninus Pius', qid: 'Q1429', born: 86, died: 161, domains: ['Politics'], region: 'IT', sitelinks: 105 },
  { name: 'Commodus', qid: 'Q1434', born: 161, died: 192, domains: ['Politics'], region: 'IT', sitelinks: 115 },
  { name: 'Lucian of Samosata', qid: 'Q192223', born: 125, died: 180, domains: ['Literature'], region: 'SY', sitelinks: 95 },
  { name: 'Apuleius', qid: 'Q170800', born: 124, died: 170, domains: ['Literature', 'Philosophy'], region: 'DZ', sitelinks: 95 },
  { name: 'Pausanias', qid: 'Q184614', born: 110, died: 180, domains: ['Literature'], region: 'GR', sitelinks: 90 },
  { name: 'Juvenal', qid: 'Q7232', born: 55, died: 127, domains: ['Literature'], region: 'IT', sitelinks: 100 },
  { name: 'Tacitus', qid: 'Q2161', born: 56, died: 120, domains: ['Literature'], region: 'IT', sitelinks: 120 },
  { name: 'Suetonius', qid: 'Q49250', born: 69, died: 122, domains: ['Literature'], region: 'IT', sitelinks: 105 },
  { name: 'Arrian', qid: 'Q184068', born: 86, died: 146, domains: ['Literature'], region: 'TR', sitelinks: 90 },
  { name: 'Claudius Ptolemy', qid: 'Q34943', born: 100, died: 170, domains: ['Science'], region: 'EG', sitelinks: 135 },
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
  for (const fig of ancientSaturation) {
    if (existingQids.has(fig.qid)) continue;
    toAdd.push(fig);
    existingQids.add(fig.qid);
  }
  
  console.log(`Adding ${toAdd.length} ancient figures for temporal continuity`);
  const updated = [...people, ...toAdd];
  savePeople(updated);
  console.log(`Total people: ${updated.length}`);
  
  // Save the additions for reference
  fs.writeFileSync('./scripts/ancient_saturation_added.json', JSON.stringify(toAdd, null, 2));
  console.log('Saved additions to scripts/ancient_saturation_added.json');
}

main();


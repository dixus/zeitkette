const fs = require('fs');

function load(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Ancient and medieval relations based on historical connections
const newRelations = {
  // Ancient Greek philosophers - master/student chains
  'Q913': { // Socrates
    knew: [
      { name: 'Plato', type: 'Schüler', confidence: 1 },
      { name: 'Xenophon', type: 'Schüler', confidence: 1 },
      { name: 'Alcibiades', type: 'Schüler', confidence: 0.9 }
    ]
  },
  'Q859': { // Plato
    knew: [
      { name: 'Socrates', type: 'Lehrer', confidence: 1 },
      { name: 'Aristotle', type: 'Schüler', confidence: 1 },
      { name: 'Dionysius I', type: 'Zeitgenosse', confidence: 0.8 }
    ]
  },
  'Q868': { // Aristotle
    knew: [
      { name: 'Plato', type: 'Lehrer', confidence: 1 },
      { name: 'Alexander the Great', type: 'Schüler/Tutor für', confidence: 1 },
      { name: 'Theophrastus', type: 'Schüler', confidence: 1 }
    ]
  },
  'Q8409': { // Alexander the Great
    knew: [
      { name: 'Aristotle', type: 'Lehrer', confidence: 1 },
      { name: 'Philip II of Macedon', type: 'Vater', confidence: 1 },
      { name: 'Ptolemy I', type: 'General/Nachfolger', confidence: 1 }
    ]
  },
  
  // Roman leaders and successors
  'Q1048': { // Julius Caesar
    knew: [
      { name: 'Cleopatra', type: 'Verbündete/Geliebte', confidence: 1 },
      { name: 'Marcus Antonius', type: 'Verbündeter', confidence: 1 },
      { name: 'Augustus', type: 'Adoptivsohn/Nachfolger', confidence: 1 },
      { name: 'Pompey', type: 'Rivale', confidence: 1 },
      { name: 'Cicero', type: 'Zeitgenosse/Kritiker', confidence: 1 }
    ]
  },
  'Q635': { // Cleopatra
    knew: [
      { name: 'Julius Caesar', type: 'Verbündeter/Geliebter', confidence: 1 },
      { name: 'Marcus Antonius', type: 'Verbündeter/Geliebter', confidence: 1 },
      { name: 'Augustus', type: 'Gegner', confidence: 1 }
    ]
  },
  'Q1405': { // Augustus
    knew: [
      { name: 'Julius Caesar', type: 'Adoptivvater/Vorgänger', confidence: 1 },
      { name: 'Marcus Antonius', type: 'Rivale', confidence: 1 },
      { name: 'Cleopatra', type: 'Gegnerin', confidence: 1 },
      { name: 'Tiberius', type: 'Adoptivsohn/Nachfolger', confidence: 1 }
    ]
  },
  'Q1407': { // Tiberius
    knew: [
      { name: 'Augustus', type: 'Adoptivvater/Vorgänger', confidence: 1 },
      { name: 'Caligula', type: 'Nachfolger', confidence: 1 }
    ]
  },
  'Q1409': { // Caligula
    knew: [
      { name: 'Tiberius', type: 'Vorgänger', confidence: 1 },
      { name: 'Claudius', type: 'Nachfolger', confidence: 1 }
    ]
  },
  'Q1411': { // Claudius
    knew: [
      { name: 'Caligula', type: 'Vorgänger', confidence: 1 },
      { name: 'Nero', type: 'Stiefsohn/Nachfolger', confidence: 1 },
      { name: 'Seneca', type: 'Berater', confidence: 0.9 }
    ]
  },
  'Q1413': { // Nero
    knew: [
      { name: 'Claudius', type: 'Stiefvater/Vorgänger', confidence: 1 },
      { name: 'Seneca', type: 'Lehrer/Berater', confidence: 1 },
      { name: 'Vespasian', type: 'Nachfolger (indirekt)', confidence: 0.7 }
    ]
  },
  'Q2054': { // Seneca
    knew: [
      { name: 'Nero', type: 'Schüler/Kaiser', confidence: 1 },
      { name: 'Claudius', type: 'Kaiser (diente unter)', confidence: 0.9 }
    ]
  },
  'Q1419': { // Vespasian
    knew: [
      { name: 'Titus', type: 'Sohn/Nachfolger', confidence: 1 }
    ]
  },
  'Q1421': { // Titus
    knew: [
      { name: 'Vespasian', type: 'Vater/Vorgänger', confidence: 1 },
      { name: 'Domitian', type: 'Bruder/Nachfolger', confidence: 1 }
    ]
  },
  'Q1423': { // Domitian
    knew: [
      { name: 'Titus', type: 'Bruder/Vorgänger', confidence: 1 },
      { name: 'Trajan', type: 'Nachfolger (indirekt)', confidence: 0.6 }
    ]
  },
  'Q1425': { // Trajan
    knew: [
      { name: 'Hadrian', type: 'Adoptivsohn/Nachfolger', confidence: 1 }
    ]
  },
  'Q1427': { // Hadrian
    knew: [
      { name: 'Trajan', type: 'Adoptivvater/Vorgänger', confidence: 1 },
      { name: 'Antoninus Pius', type: 'Adoptivsohn/Nachfolger', confidence: 1 }
    ]
  },
  'Q1429': { // Antoninus Pius
    knew: [
      { name: 'Hadrian', type: 'Adoptivvater/Vorgänger', confidence: 1 },
      { name: 'Marcus Aurelius', type: 'Adoptivsohn/Nachfolger', confidence: 1 }
    ]
  },
  'Q1430': { // Marcus Aurelius
    knew: [
      { name: 'Antoninus Pius', type: 'Adoptivvater/Vorgänger', confidence: 1 },
      { name: 'Commodus', type: 'Sohn/Nachfolger', confidence: 1 },
      { name: 'Galen', type: 'Leibarzt', confidence: 0.9 }
    ]
  },
  'Q1434': { // Commodus
    knew: [
      { name: 'Marcus Aurelius', type: 'Vater/Vorgänger', confidence: 1 }
    ]
  },
  'Q8778': { // Galen
    knew: [
      { name: 'Marcus Aurelius', type: 'Kaiser/Patient', confidence: 0.9 }
    ]
  },
  
  // Late Roman / Early Christian
  'Q8413': { // Constantine
    knew: [
      { name: 'Diocletian', type: 'Vorgänger (indirekt)', confidence: 0.7 },
      { name: 'Eusebius', type: 'Berater/Historiker', confidence: 0.9 },
      { name: 'Theodosius I', type: 'Nachfolger (später)', confidence: 0.5 }
    ]
  },
  'Q8018': { // Augustine of Hippo
    knew: [
      { name: 'Ambrose', type: 'Mentor/Taufte ihn', confidence: 1 },
      { name: 'Jerome', type: 'Zeitgenosse/Korrespondent', confidence: 0.9 }
    ]
  },
  'Q180600': { // Ambrose
    knew: [
      { name: 'Augustine of Hippo', type: 'Schüler/Taufte', confidence: 1 },
      { name: 'Theodosius I', type: 'Kaiser (beriet)', confidence: 1 }
    ]
  },
  'Q44248': { // Jerome
    knew: [
      { name: 'Augustine of Hippo', type: 'Zeitgenosse/Korrespondent', confidence: 0.9 }
    ]
  },
  
  // Medieval - Carolingian
  'Q3044': { // Charlemagne
    knew: [
      { name: 'Pepin the Short', type: 'Vater', confidence: 1 },
      { name: 'Louis the Pious', type: 'Sohn/Nachfolger', confidence: 1 },
      { name: 'Alcuin', type: 'Berater/Gelehrter', confidence: 1 },
      { name: 'Harun al-Rashid', type: 'Diplomatischer Kontakt', confidence: 0.8 }
    ]
  },
  'Q130762': { // Harun al-Rashid
    knew: [
      { name: 'Charlemagne', type: 'Diplomatischer Kontakt', confidence: 0.8 }
    ]
  },
  'Q155999': { // Alcuin
    knew: [
      { name: 'Charlemagne', type: 'Kaiser/Schüler', confidence: 1 }
    ]
  },
  
  // Medieval - Crusades era
  'Q37594': { // William the Conqueror
    knew: [
      { name: 'Harold Godwinson', type: 'Rivale/Besiegte', confidence: 1 }
    ]
  },
  'Q79165': { // Frederick Barbarossa
    knew: [
      { name: 'Saladin', type: 'Gegner im Kreuzzug', confidence: 0.9 },
      { name: 'Henry II of England', type: 'Zeitgenosse', confidence: 0.8 }
    ]
  },
  'Q8581': { // Saladin
    knew: [
      { name: 'Richard the Lionheart', type: 'Gegner im Kreuzzug', confidence: 1 },
      { name: 'Frederick Barbarossa', type: 'Gegner im Kreuzzug', confidence: 0.9 }
    ]
  },
  'Q42305': { // Richard the Lionheart
    knew: [
      { name: 'Saladin', type: 'Gegner im Kreuzzug', confidence: 1 },
      { name: 'Philip II of France', type: 'Verbündeter/später Rivale', confidence: 1 }
    ]
  },
  
  // Scholastic philosophers
  'Q9438': { // Thomas Aquinas
    knew: [
      { name: 'Albertus Magnus', type: 'Lehrer', confidence: 1 },
      { name: 'Bonaventure', type: 'Zeitgenosse', confidence: 0.8 }
    ]
  },
  'Q60059': { // Albertus Magnus
    knew: [
      { name: 'Thomas Aquinas', type: 'Schüler', confidence: 1 }
    ]
  },
  'Q45281': { // Bonaventure
    knew: [
      { name: 'Thomas Aquinas', type: 'Zeitgenosse', confidence: 0.8 }
    ]
  },
  'Q152030': { // Duns Scotus
    knew: [
      { name: 'Thomas Aquinas', type: 'Beeinflusst von', confidence: 0.8 },
      { name: 'William of Ockham', type: 'Beeinflusste', confidence: 0.7 }
    ]
  },
  'Q42500': { // William of Ockham
    knew: [
      { name: 'Duns Scotus', type: 'Beeinflusst von', confidence: 0.7 }
    ]
  },
  
  // Italian Renaissance precursors
  'Q1067': { // Dante
    knew: [
      { name: 'Giotto', type: 'Zeitgenosse', confidence: 0.8 },
      { name: 'Petrarch', type: 'Beeinflusste', confidence: 0.9 }
    ]
  },
  'Q7814': { // Giotto
    knew: [
      { name: 'Dante', type: 'Zeitgenosse', confidence: 0.8 }
    ]
  },
  'Q1401': { // Petrarch
    knew: [
      { name: 'Dante', type: 'Beeinflusst von', confidence: 0.9 },
      { name: 'Boccaccio', type: 'Freund', confidence: 1 }
    ]
  },
  'Q1319': { // Boccaccio
    knew: [
      { name: 'Petrarch', type: 'Freund', confidence: 1 },
      { name: 'Dante', type: 'Bewunderte', confidence: 0.9 }
    ]
  },
  
  // Mongol Empire
  'Q720': { // Genghis Khan
    knew: [
      { name: 'Kublai Khan', type: 'Enkel', confidence: 1 }
    ]
  },
  'Q7523': { // Kublai Khan
    knew: [
      { name: 'Genghis Khan', type: 'Großvater', confidence: 1 },
      { name: 'Marco Polo', type: 'Gastgeber für', confidence: 0.9 }
    ]
  },
  'Q6101': { // Marco Polo
    knew: [
      { name: 'Kublai Khan', type: 'Diente am Hof', confidence: 0.9 }
    ]
  },
  
  // Pre-Socratic philosophers
  'Q36303': { // Thales
    knew: [
      { name: 'Anaximander', type: 'Schüler', confidence: 0.9 }
    ]
  },
  'Q43730': { // Anaximander
    knew: [
      { name: 'Thales', type: 'Lehrer', confidence: 0.9 },
      { name: 'Anaximenes', type: 'Schüler', confidence: 0.9 }
    ]
  },
  'Q182046': { // Anaximenes
    knew: [
      { name: 'Anaximander', type: 'Lehrer', confidence: 0.9 }
    ]
  },
  'Q10261': { // Pythagoras
    knew: [
      { name: 'Thales', type: 'Möglicherweise beeinflusst von', confidence: 0.6 }
    ]
  },
  'Q41155': { // Parmenides
    knew: [
      { name: 'Zeno of Elea', type: 'Schüler', confidence: 1 }
    ]
  },
  'Q41165': { // Empedocles
    knew: [
      { name: 'Parmenides', type: 'Beeinflusst von', confidence: 0.8 }
    ]
  },
  'Q41980': { // Democritus
    knew: [
      { name: 'Leucippus', type: 'Lehrer', confidence: 0.9 }
    ]
  },
  
  // Islamic Golden Age
  'Q188553': { // Al-Kindi
    knew: [
      { name: 'Al-Khwarizmi', type: 'Zeitgenosse', confidence: 0.8 }
    ]
  },
  'Q7595': { // Al-Khwarizmi
    knew: [
      { name: 'Al-Kindi', type: 'Zeitgenosse', confidence: 0.8 }
    ]
  },
  'Q171903': { // Al-Farabi
    knew: [
      { name: 'Avicenna', type: 'Beeinflusste', confidence: 0.8 }
    ]
  },
  'Q8011': { // Avicenna
    knew: [
      { name: 'Al-Farabi', type: 'Beeinflusst von', confidence: 0.8 },
      { name: 'Al-Biruni', type: 'Zeitgenosse/Korrespondent', confidence: 0.9 }
    ]
  },
  'Q28981': { // Al-Biruni
    knew: [
      { name: 'Avicenna', type: 'Zeitgenosse/Korrespondent', confidence: 0.9 }
    ]
  },
  'Q8101': { // Averroes
    knew: [
      { name: 'Maimonides', type: 'Zeitgenosse', confidence: 0.8 },
      { name: 'Avicenna', type: 'Beeinflusst von', confidence: 0.8 }
    ]
  },
  'Q10307': { // Maimonides
    knew: [
      { name: 'Averroes', type: 'Zeitgenosse', confidence: 0.8 }
    ]
  },
  
  // Chinese philosophers
  'Q4604': { // Confucius
    knew: [
      { name: 'Laozi', type: 'Möglicherweise getroffen', confidence: 0.5 },
      { name: 'Mencius', type: 'Beeinflusste (später)', confidence: 0.9 }
    ]
  },
  'Q9333': { // Laozi
    knew: [
      { name: 'Confucius', type: 'Möglicherweise getroffen', confidence: 0.5 }
    ]
  },
  'Q4073': { // Mencius
    knew: [
      { name: 'Confucius', type: 'Beeinflusst von', confidence: 0.9 }
    ]
  },
  
  // Hellenistic period
  'Q8739': { // Archimedes
    knew: [
      { name: 'Eratosthenes', type: 'Korrespondent', confidence: 0.8 }
    ]
  },
  'Q43290': { // Eratosthenes
    knew: [
      { name: 'Archimedes', type: 'Korrespondent', confidence: 0.8 }
    ]
  },
  'Q59102': { // Epicurus
    knew: [
      { name: 'Zeno of Citium', type: 'Zeitgenosse/Rivale', confidence: 0.8 }
    ]
  },
  'Q103368': { // Zeno of Citium
    knew: [
      { name: 'Epicurus', type: 'Zeitgenosse/Rivale', confidence: 0.8 }
    ]
  },
  
  // Roman poets
  'Q1398': { // Virgil
    knew: [
      { name: 'Augustus', type: 'Patron', confidence: 1 },
      { name: 'Horace', type: 'Freund', confidence: 0.9 }
    ]
  },
  'Q6197': { // Horace
    knew: [
      { name: 'Virgil', type: 'Freund', confidence: 0.9 },
      { name: 'Augustus', type: 'Patron', confidence: 0.9 }
    ]
  },
  'Q7198': { // Ovid
    knew: [
      { name: 'Augustus', type: 'Verbannte ihn', confidence: 1 }
    ]
  },
  
  // Ancient historians
  'Q26825': { // Herodotus
    knew: [
      { name: 'Thucydides', type: 'Nachfolger/Beeinflusste', confidence: 0.7 }
    ]
  },
  'Q41683': { // Thucydides
    knew: [
      { name: 'Herodotus', type: 'Vorgänger/Beeinflusst von', confidence: 0.7 },
      { name: 'Pericles', type: 'Zeitgenosse', confidence: 0.9 }
    ]
  },
  'Q5449': { // Pericles
    knew: [
      { name: 'Socrates', type: 'Zeitgenosse', confidence: 0.8 },
      { name: 'Thucydides', type: 'Zeitgenosse', confidence: 0.9 }
    ]
  },
  
  // Religious figures
  'Q9458': { // Muhammad
    knew: [
      { name: 'Abu Bakr', type: 'Schwiegervater/Nachfolger', confidence: 1 },
      { name: 'Umar', type: 'Gefährte/Nachfolger', confidence: 1 },
      { name: 'Ali', type: 'Cousin/Schwiegersohn', confidence: 1 }
    ]
  },
  'Q57372': { // Abu Bakr
    knew: [
      { name: 'Muhammad', type: 'Schwiegersohn/Vorgänger', confidence: 1 },
      { name: 'Umar', type: 'Nachfolger', confidence: 1 }
    ]
  },
  'Q8467': { // Umar
    knew: [
      { name: 'Abu Bakr', type: 'Vorgänger', confidence: 1 },
      { name: 'Uthman', type: 'Nachfolger', confidence: 1 },
      { name: 'Muhammad', type: 'Prophet/Gefährte', confidence: 1 }
    ]
  },
  'Q123739': { // Uthman
    knew: [
      { name: 'Umar', type: 'Vorgänger', confidence: 1 },
      { name: 'Ali', type: 'Nachfolger', confidence: 1 }
    ]
  },
  'Q39619': { // Ali
    knew: [
      { name: 'Muhammad', type: 'Cousin/Prophet', confidence: 1 },
      { name: 'Uthman', type: 'Vorgänger', confidence: 1 }
    ]
  }
};

function main() {
  const relations = load('./data/relations.json');
  let added = 0;
  
  for (const [qid, newRel] of Object.entries(newRelations)) {
    if (!relations[qid]) {
      relations[qid] = newRel;
      added += newRel.knew.length;
    } else {
      // Merge, avoiding duplicates
      const existing = relations[qid].knew || [];
      const existingKeys = new Set(existing.map(k => `${k.name}|${k.type}`));
      for (const conn of newRel.knew) {
        const key = `${conn.name}|${conn.type}`;
        if (!existingKeys.has(key)) {
          existing.push(conn);
          added++;
        }
      }
      relations[qid].knew = existing;
    }
  }
  
  save('./data/relations.json', relations);
  save('./public/relations.json', relations);
  
  console.log(`Added ${added} new relation connections`);
  console.log(`Total relation entries: ${Object.keys(relations).length}`);
}

main();


const fs = require('fs');
const relations = require('./data/relations.json');

const newRelations = {
  // Quantum mechanics pioneers
  "Q57116": { // Max Born
    "knew": [
      { "name": "Werner Heisenberg", "type": "Doktorvater/Mentor", "confidence": 1 },
      { "name": "Wolfgang Pauli", "type": "Kollege", "confidence": 0.9 },
      { "name": "Niels Bohr", "type": "Kollege", "confidence": 0.9 }
    ]
  },
  "Q38096": { // Werner Heisenberg
    "knew": [
      { "name": "Max Born", "type": "Doktorvater", "confidence": 1 },
      { "name": "Niels Bohr", "type": "Mentor/Kollege", "confidence": 1 },
      { "name": "Wolfgang Pauli", "type": "Kollege/Freund", "confidence": 0.9 }
    ]
  },
  "Q84296": { // Wolfgang Pauli
    "knew": [
      { "name": "Niels Bohr", "type": "Kollege", "confidence": 0.9 },
      { "name": "Werner Heisenberg", "type": "Kollege/Freund", "confidence": 0.9 }
    ]
  },
  "Q9021": { // Max Planck
    "knew": [
      { "name": "Albert Einstein", "type": "Kollege/Förderer", "confidence": 1 },
      { "name": "Niels Bohr", "type": "Kollege", "confidence": 0.8 }
    ]
  },
  "Q9035": { // Erwin Schrödinger
    "knew": [
      { "name": "Albert Einstein", "type": "Kollege/Korrespondent", "confidence": 0.9 },
      { "name": "Max Born", "type": "Kollege", "confidence": 0.9 },
      { "name": "Werner Heisenberg", "type": "Wissenschaftlicher Rivale", "confidence": 0.9 }
    ]
  },
  "Q8753": { // Enrico Fermi
    "knew": [
      { "name": "Robert Oppenheimer", "type": "Kollege Manhattan Project", "confidence": 1 },
      { "name": "Niels Bohr", "type": "Kollege", "confidence": 0.8 }
    ]
  },
  "Q131219": { // Robert Oppenheimer
    "knew": [
      { "name": "Enrico Fermi", "type": "Kollege Manhattan Project", "confidence": 1 },
      { "name": "Albert Einstein", "type": "Kollege", "confidence": 0.9 },
      { "name": "Niels Bohr", "type": "Kollege", "confidence": 0.9 }
    ]
  },
  "Q7186": { // Marie Curie
    "knew": [
      { "name": "Pierre Curie", "type": "Ehemann/Forschungspartner", "confidence": 1 },
      { "name": "Henri Becquerel", "type": "Kollege", "confidence": 1 },
      { "name": "Albert Einstein", "type": "Freund", "confidence": 0.9 }
    ]
  },
  "Q37463": { // Pierre Curie
    "knew": [
      { "name": "Marie Curie", "type": "Ehefrau/Forschungspartnerin", "confidence": 1 },
      { "name": "Henri Becquerel", "type": "Kollege", "confidence": 1 }
    ]
  },
  "Q38513": { // Henri Becquerel
    "knew": [
      { "name": "Marie Curie", "type": "Kollegin", "confidence": 1 },
      { "name": "Pierre Curie", "type": "Kollege", "confidence": 1 }
    ]
  },
  
  // Mathematicians
  "Q43270": { // Kurt Gödel
    "knew": [
      { "name": "Albert Einstein", "type": "Enger Freund", "confidence": 1 },
      { "name": "John von Neumann", "type": "Kollege", "confidence": 0.9 }
    ]
  },
  "Q17492": { // John von Neumann
    "knew": [
      { "name": "Albert Einstein", "type": "Kollege", "confidence": 0.9 },
      { "name": "Kurt Gödel", "type": "Kollege", "confidence": 0.9 },
      { "name": "Robert Oppenheimer", "type": "Kollege", "confidence": 0.9 }
    ]
  },
  "Q7251": { // Alan Turing
    "knew": [
      { "name": "John von Neumann", "type": "Kollege", "confidence": 0.8 }
    ]
  },
  
  // Philosophers  
  "Q44272": { // Michel Foucault
    "knew": [
      { "name": "Jean-Paul Sartre", "type": "Intellektueller Rivale", "confidence": 0.8 },
      { "name": "Jacques Derrida", "type": "Zeitgenosse", "confidence": 0.7 }
    ]
  },
  "Q60025": { // Hannah Arendt
    "knew": [
      { "name": "Martin Heidegger", "type": "Lehrer/Liebhaber", "confidence": 1 },
      { "name": "Karl Jaspers", "type": "Doktorvater", "confidence": 1 }
    ]
  },
  
  // Classical composers relationships
  "Q7304": { // Gustav Mahler
    "knew": [
      { "name": "Richard Strauss", "type": "Zeitgenosse/Rivale", "confidence": 0.9 },
      { "name": "Arnold Schoenberg", "type": "Förderer", "confidence": 0.9 }
    ]
  },
  "Q154770": { // Arnold Schoenberg
    "knew": [
      { "name": "Gustav Mahler", "type": "Mentor", "confidence": 0.9 },
      { "name": "Igor Stravinsky", "type": "Zeitgenosse/Rivale", "confidence": 0.8 }
    ]
  },
  
  // Jazz legends
  "Q1779": { // Louis Armstrong
    "knew": [
      { "name": "Duke Ellington", "type": "Zeitgenosse/Kollege", "confidence": 0.9 },
      { "name": "Ella Fitzgerald", "type": "Kollaborateur", "confidence": 0.9 }
    ]
  },
  "Q4030": { // Duke Ellington
    "knew": [
      { "name": "Louis Armstrong", "type": "Zeitgenosse/Kollege", "confidence": 0.9 },
      { "name": "Billie Holiday", "type": "Zeitgenosse", "confidence": 0.8 }
    ]
  },
  "Q1768": { // Ella Fitzgerald
    "knew": [
      { "name": "Louis Armstrong", "type": "Kollaborateur", "confidence": 0.9 },
      { "name": "Frank Sinatra", "type": "Zeitgenosse", "confidence": 0.8 }
    ]
  },
  "Q104358": { // Billie Holiday
    "knew": [
      { "name": "Louis Armstrong", "type": "Zeitgenosse", "confidence": 0.8 },
      { "name": "Duke Ellington", "type": "Zeitgenosse", "confidence": 0.8 }
    ]
  },
  
  // Hollywood Golden Age
  "Q16390": { // Charlie Chaplin
    "knew": [
      { "name": "Buster Keaton", "type": "Zeitgenosse/Rivale", "confidence": 0.9 },
      { "name": "Orson Welles", "type": "Bewunderer von", "confidence": 0.7 }
    ]
  },
  "Q24829": { // Orson Welles
    "knew": [
      { "name": "Charlie Chaplin", "type": "Bewunderte", "confidence": 0.7 },
      { "name": "John Ford", "type": "Zeitgenosse", "confidence": 0.7 }
    ]
  },
  "Q56016": { // Katharine Hepburn
    "knew": [
      { "name": "Cary Grant", "type": "Filmpartner", "confidence": 1 },
      { "name": "John Wayne", "type": "Zeitgenosse", "confidence": 0.7 }
    ]
  },
  
  // Film directors
  "Q7371": { // Federico Fellini
    "knew": [
      { "name": "Ingmar Bergman", "type": "Zeitgenosse/Bewunderer", "confidence": 0.8 },
      { "name": "Akira Kurosawa", "type": "Zeitgenosse", "confidence": 0.7 }
    ]
  },
  "Q7499": { // Ingmar Bergman
    "knew": [
      { "name": "Federico Fellini", "type": "Zeitgenosse/Bewunderer", "confidence": 0.8 },
      { "name": "Andrei Tarkovsky", "type": "Bewunderer", "confidence": 0.7 }
    ]
  },
  "Q55194": { // Andrei Tarkovsky
    "knew": [
      { "name": "Ingmar Bergman", "type": "Zeitgenosse", "confidence": 0.7 }
    ]
  },
  "Q53004": { // Jean-Luc Godard
    "knew": [
      { "name": "François Truffaut", "type": "Freund/später Rivale", "confidence": 0.9 }
    ]
  },
  "Q53003": { // François Truffaut
    "knew": [
      { "name": "Jean-Luc Godard", "type": "Freund/später Rivale", "confidence": 0.9 }
    ]
  },
  "Q41148": { // Martin Scorsese
    "knew": [
      { "name": "Francis Ford Coppola", "type": "Zeitgenosse/Freund", "confidence": 0.9 },
      { "name": "Robert De Niro", "type": "Langjähriger Kollaborateur", "confidence": 1 }
    ]
  },
  "Q56094": { // Francis Ford Coppola
    "knew": [
      { "name": "Martin Scorsese", "type": "Zeitgenosse/Freund", "confidence": 0.9 },
      { "name": "George Lucas", "type": "Freund", "confidence": 1 }
    ]
  },
  "Q38222": { // George Lucas
    "knew": [
      { "name": "Francis Ford Coppola", "type": "Freund/Mentor", "confidence": 1 },
      { "name": "Steven Spielberg", "type": "Enger Freund/Kollaborateur", "confidence": 1 }
    ]
  },
  
  // Modern actors
  "Q20178": { // Robert De Niro
    "knew": [
      { "name": "Martin Scorsese", "type": "Langjähriger Regisseur", "confidence": 1 },
      { "name": "Al Pacino", "type": "Zeitgenosse/Freund", "confidence": 0.9 }
    ]
  },
  "Q36949": { // Al Pacino
    "knew": [
      { "name": "Robert De Niro", "type": "Zeitgenosse/Freund", "confidence": 0.9 },
      { "name": "Francis Ford Coppola", "type": "Regisseur", "confidence": 1 }
    ]
  },
  
  // African leaders
  "Q8023": { // Nelson Mandela
    "knew": [
      { "name": "Desmond Tutu", "type": "Enger Freund/Mitstreiter", "confidence": 1 },
      { "name": "Oliver Tambo", "type": "Enger Freund", "confidence": 1 }
    ]
  },
  "Q39574": { // Desmond Tutu
    "knew": [
      { "name": "Nelson Mandela", "type": "Enger Freund/Mitstreiter", "confidence": 1 }
    ]
  },
  
  // Middle Eastern leaders
  "Q39671": { // Anwar Sadat
    "knew": [
      { "name": "Gamal Abdel Nasser", "type": "Vorgänger/Mentor", "confidence": 1 },
      { "name": "Menachem Begin", "type": "Friedenspartner", "confidence": 1 }
    ]
  },
  "Q39524": { // Gamal Abdel Nasser
    "knew": [
      { "name": "Anwar Sadat", "type": "Nachfolger", "confidence": 1 }
    ]
  },
  "Q128902": { // Menachem Begin
    "knew": [
      { "name": "Anwar Sadat", "type": "Friedenspartner", "confidence": 1 },
      { "name": "Yitzhak Rabin", "type": "Politischer Rivale", "confidence": 0.9 }
    ]
  },
  "Q34060": { // Yitzhak Rabin
    "knew": [
      { "name": "Shimon Peres", "type": "Langj. Kollege/Rivale", "confidence": 1 }
    ]
  },
  "Q57410": { // Shimon Peres
    "knew": [
      { "name": "Yitzhak Rabin", "type": "Langj. Kollege/Rivale", "confidence": 1 }
    ]
  },
  
  // Asian leaders
  "Q1047": { // Jawaharlal Nehru
    "knew": [
      { "name": "Mahatma Gandhi", "type": "Mentor/Politischer Führer", "confidence": 1 },
      { "name": "Rabindranath Tagore", "type": "Freund", "confidence": 0.9 }
    ]
  },
  "Q153907": { // Lee Kuan Yew
    "knew": [
      { "name": "Deng Xiaoping", "type": "Zeitgenosse", "confidence": 0.8 }
    ]
  },
  
  // Rock/Pop music
  "Q5928": { // Jimi Hendrix
    "knew": [
      { "name": "Eric Clapton", "type": "Freund/Musikkollege", "confidence": 0.9 },
      { "name": "Mick Jagger", "type": "Zeitgenosse", "confidence": 0.7 }
    ]
  },
  "Q48337": { // Eric Clapton
    "knew": [
      { "name": "Jimi Hendrix", "type": "Freund/Bewunderte", "confidence": 0.9 },
      { "name": "George Harrison", "type": "Enger Freund", "confidence": 1 }
    ]
  },
  
  // Writers - Existentialists
  "Q37327": { // Samuel Beckett
    "knew": [
      { "name": "James Joyce", "type": "Mentor/Sekretär von", "confidence": 1 },
      { "name": "Jean-Paul Sartre", "type": "Zeitgenosse", "confidence": 0.7 }
    ]
  },
  
  // Latin American writers
  "Q5878": { // Gabriel García Márquez
    "knew": [
      { "name": "Mario Vargas Llosa", "type": "Freund/später Feind", "confidence": 0.9 },
      { "name": "Pablo Neruda", "type": "Mentor", "confidence": 0.8 }
    ]
  },
  "Q39803": { // Mario Vargas Llosa
    "knew": [
      { "name": "Gabriel García Márquez", "type": "Freund/später Feind", "confidence": 0.9 },
      { "name": "Jorge Luis Borges", "type": "Beeinflusst von", "confidence": 0.8 }
    ]
  },
  "Q909": { // Jorge Luis Borges
    "knew": [
      { "name": "Adolfo Bioy Casares", "type": "Enger Freund/Kollaborateur", "confidence": 1 }
    ]
  },
  
  // British writers
  "Q892": { // J.R.R. Tolkien
    "knew": [
      { "name": "C.S. Lewis", "type": "Enger Freund", "confidence": 1 }
    ]
  },
  "Q9204": { // C.S. Lewis
    "knew": [
      { "name": "J.R.R. Tolkien", "type": "Enger Freund", "confidence": 1 }
    ]
  },
  "Q36322": { // Jane Austen
    "knew": [
      { "name": "Walter Scott", "type": "Zeitgenosse/Bewunderte", "confidence": 0.7 }
    ]
  },
  "Q127817": { // Charlotte Brontë
    "knew": [
      { "name": "Emily Brontë", "type": "Schwester", "confidence": 1 }
    ]
  },
  "Q132524": { // Emily Brontë
    "knew": [
      { "name": "Charlotte Brontë", "type": "Schwester", "confidence": 1 }
    ]
  },
  
  // American writers
  "Q16867": { // Edgar Allan Poe
    "knew": [
      { "name": "Ralph Waldo Emerson", "type": "Zeitgenosse", "confidence": 0.6 }
    ]
  },
  "Q48226": { // Ralph Waldo Emerson
    "knew": [
      { "name": "Henry David Thoreau", "type": "Freund/Mentor", "confidence": 1 },
      { "name": "Walt Whitman", "type": "Bewunderer von", "confidence": 0.7 }
    ]
  },
  "Q131149": { // Henry David Thoreau
    "knew": [
      { "name": "Ralph Waldo Emerson", "type": "Mentor/Freund", "confidence": 1 }
    ]
  },
  "Q7245": { // Mark Twain
    "knew": [
      { "name": "Nikola Tesla", "type": "Freund", "confidence": 0.9 }
    ]
  },
  "Q23434": { // Ernest Hemingway
    "knew": [
      { "name": "F. Scott Fitzgerald", "type": "Freund/Rivale", "confidence": 0.9 },
      { "name": "James Joyce", "type": "Bekannter", "confidence": 0.8 },
      { "name": "Pablo Picasso", "type": "Freund", "confidence": 0.9 }
    ]
  },
  "Q93354": { // F. Scott Fitzgerald
    "knew": [
      { "name": "Ernest Hemingway", "type": "Freund/Rivale", "confidence": 0.9 }
    ]
  },
  
  // Architects
  "Q4724": { // Le Corbusier
    "knew": [
      { "name": "Walter Gropius", "type": "Zeitgenosse", "confidence": 0.8 },
      { "name": "Ludwig Mies van der Rohe", "type": "Zeitgenosse", "confidence": 0.8 }
    ]
  },
  "Q5604": { // Frank Lloyd Wright
    "knew": [
      { "name": "Le Corbusier", "type": "Zeitgenosse/Rivale", "confidence": 0.7 }
    ]
  },
  "Q61285": { // Walter Gropius
    "knew": [
      { "name": "Ludwig Mies van der Rohe", "type": "Bauhaus-Kollege", "confidence": 0.9 },
      { "name": "Le Corbusier", "type": "Zeitgenosse", "confidence": 0.8 }
    ]
  },
  "Q41508": { // Ludwig Mies van der Rohe
    "knew": [
      { "name": "Walter Gropius", "type": "Bauhaus-Kollege", "confidence": 0.9 }
    ]
  },
  
  // Fashion designers
  "Q47133": { // Christian Dior
    "knew": [
      { "name": "Yves Saint Laurent", "type": "Mentor/Nachfolger", "confidence": 1 }
    ]
  },
  "Q172152": { // Yves Saint Laurent
    "knew": [
      { "name": "Christian Dior", "type": "Mentor", "confidence": 1 },
      { "name": "Karl Lagerfeld", "type": "Zeitgenosse/Rivale", "confidence": 0.9 }
    ]
  },
  "Q76567": { // Karl Lagerfeld
    "knew": [
      { "name": "Yves Saint Laurent", "type": "Zeitgenosse/Rivale", "confidence": 0.9 }
    ]
  },
  
  // Tech entrepreneurs
  "Q80": { // Tim Berners-Lee
    "knew": [
      { "name": "Steve Jobs", "type": "Zeitgenosse", "confidence": 0.6 }
    ]
  },
  "Q92754": { // Larry Ellison
    "knew": [
      { "name": "Steve Jobs", "type": "Enger Freund", "confidence": 1 },
      { "name": "Bill Gates", "type": "Rivale", "confidence": 0.9 }
    ]
  },
  
  // Sports legends
  "Q36107": { // Muhammad Ali (boxing)
    "knew": [
      { "name": "Malcolm X", "type": "Freund/Mentor", "confidence": 0.9 },
      { "name": "Martin Luther King Jr.", "type": "Zeitgenosse", "confidence": 0.8 }
    ]
  },
  "Q43927": { // Zinedine Zidane
    "knew": [
      { "name": "Ronaldo", "type": "Mannschaftskamerad", "confidence": 1 }
    ]
  },
  
  // Classical painters
  "Q5598": { // Rembrandt
    "knew": [
      { "name": "Johannes Vermeer", "type": "Zeitgenosse", "confidence": 0.7 }
    ]
  },
  "Q5599": { // Peter Paul Rubens
    "knew": [
      { "name": "Rembrandt", "type": "Zeitgenosse", "confidence": 0.6 }
    ]
  },
  
  // Impressionists
  "Q296": { // Claude Monet (already exists, just expand)
    "knew": [
      { "name": "Pierre-Auguste Renoir", "type": "Enger Freund", "confidence": 1 },
      { "name": "Camille Pissarro", "type": "Kollege", "confidence": 0.9 }
    ]
  },
  "Q39931": { // Pierre-Auguste Renoir
    "knew": [
      { "name": "Claude Monet", "type": "Enger Freund", "confidence": 1 },
      { "name": "Paul Cézanne", "type": "Freund", "confidence": 0.9 }
    ]
  },
  "Q134741": { // Camille Pissarro
    "knew": [
      { "name": "Paul Cézanne", "type": "Mentor/Freund", "confidence": 0.9 },
      { "name": "Claude Monet", "type": "Kollege", "confidence": 0.9 }
    ]
  },
  "Q35548": { // Paul Cézanne
    "knew": [
      { "name": "Camille Pissarro", "type": "Freund/Mentor", "confidence": 0.9 },
      { "name": "Pierre-Auguste Renoir", "type": "Freund", "confidence": 0.9 }
    ]
  },
  
  // Modern artists
  "Q5593": { // Pablo Picasso (already exists, just expand)
    "knew": [
      { "name": "Georges Braque", "type": "Kubismus-Partner", "confidence": 1 },
      { "name": "Henri Matisse", "type": "Freund/Rivale", "confidence": 0.9 },
      { "name": "Ernest Hemingway", "type": "Freund", "confidence": 0.9 }
    ]
  },
  "Q153920": { // Georges Braque
    "knew": [
      { "name": "Pablo Picasso", "type": "Kubismus-Partner", "confidence": 1 }
    ]
  },
  "Q5589": { // Henri Matisse
    "knew": [
      { "name": "Pablo Picasso", "type": "Freund/Rivale", "confidence": 0.9 }
    ]
  },
  
  // Ballet dancers
  "Q193263": { // Rudolf Nureyev
    "knew": [
      { "name": "Mikhail Baryshnikov", "type": "Zeitgenosse", "confidence": 0.8 }
    ]
  },
  "Q185815": { // Mikhail Baryshnikov
    "knew": [
      { "name": "Rudolf Nureyev", "type": "Zeitgenosse", "confidence": 0.8 }
    ]
  },
  
  // Ancient figures
  "Q12154": { // Tutankhamun
    "knew": [
      { "name": "Nefertiti", "type": "Mögliche Stiefmutter", "confidence": 0.7 },
      { "name": "Akhenaten", "type": "Vater", "confidence": 0.9 }
    ]
  },
  "Q81104": { // Akhenaten
    "knew": [
      { "name": "Nefertiti", "type": "Ehefrau", "confidence": 1 },
      { "name": "Tutankhamun", "type": "Sohn", "confidence": 0.9 }
    ]
  },
  "Q40930": { // Nefertiti
    "knew": [
      { "name": "Akhenaten", "type": "Ehemann", "confidence": 1 }
    ]
  }
};

// Merge with existing relations
const updated = { ...relations, ...newRelations };

fs.writeFileSync('./data/relations.json', JSON.stringify(updated, null, 2));
fs.writeFileSync('./public/relations.json', JSON.stringify(updated, null, 2));

console.log('✅ Added', Object.keys(newRelations).length, 'new relation entries');
console.log('✅ Total relations now:', Object.keys(updated).length, 'people with connections');
console.log('✅ Copied to both data/ and public/');


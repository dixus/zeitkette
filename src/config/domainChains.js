/**
 * Domain Chain Configuration
 * Maps data domains to interactive dependency chains
 */

export const DOMAIN_CHAINS = {
  'quantum-mechanics': {
    id: 'quantum-mechanics',
    name: {
      en: 'Quantum Mechanics',
      de: 'Quantenmechanik'
    },
    icon: '🔬',
    color: '#8B5CF6', // Purple
    domains: ['Science'], // Which data domains map to this chain
    keywords: ['quantum', 'physics', 'particle', 'atom', 'wave', 'heisenberg', 'schrödinger', 'bohr', 'planck', 'pauli', 'dirac', 'feynman'],
    qids: [
      'Q9021', // Max Planck
      'Q937', // Einstein
      'Q9007', // Niels Bohr
      'Q103293', // Werner Heisenberg
      'Q84296', // Erwin Schrödinger
      'Q47480', // Paul Dirac
      'Q39246', // Richard Feynman
      'Q65989', // Wolfgang Pauli
      'Q37939', // Max Born
      'Q78613', // Arnold Sommerfeld
      'Q83331', // Louis de Broglie
      'Q132537', // J. Robert Oppenheimer
      'Q17247', // John von Neumann
      'Q77078', // Max von Laue
      'Q105478', // Peter Debye
      'Q125245', // Murray Gell-Mann
      'Q179282', // Steven Weinberg
      'Q213926', // John Archibald Wheeler
      'Q57260', // Carl Friedrich von Weizsäcker
      'Q57242', // Pascual Jordan
      'Q39739', // Hendrik Lorentz
      'Q185743', // Chen Ning Yang
      'Q185721', // Tsung-Dao Lee
      'Q309430', // John Stewart Bell
      'Q448174', // Alain Aspect
    ],
    period: '1900–2025',
    description: {
      en: 'Trace the development of quantum mechanics from Planck\'s quantum hypothesis to modern quantum computing.',
      de: 'Verfolgen Sie die Entwicklung der Quantenmechanik von Plancks Quantenhypothese bis zum modernen Quantencomputing.'
    }
  },
  
  'computer-science': {
    id: 'computer-science',
    name: {
      en: 'Computer Science',
      de: 'Informatik'
    },
    icon: '💻',
    color: '#10B981', // Green
    domains: ['Science', 'Math'],
    keywords: ['computer', 'algorithm', 'programming', 'software', 'turing', 'babbage', 'ada', 'von neumann', 'shannon'],
    qids: [
      'Q19828', // Charles Babbage
      'Q7259', // Ada Lovelace
      'Q131309', // George Boole
      'Q7251', // Alan Turing
      'Q179049', // Alonzo Church
      'Q43270', // Kurt Gödel
      'Q145794', // Claude Shannon
      'Q190132', // Norbert Wiener
      'Q11428', // Grace Hopper
      'Q92614', // John McCarthy
      'Q204815', // Marvin Minsky
      'Q17457', // Donald Knuth
      'Q92604', // Edsger W. Dijkstra
      'Q92621', // Dennis Ritchie
      'Q92624', // Ken Thompson
      'Q92616', // Bjarne Stroustrup
      'Q80', // Tim Berners-Lee
      'Q34253', // Linus Torvalds
      'Q17247', // John von Neumann (also in QM!)
    ],
    period: '1830s–1990s',
    description: {
      en: 'Follow the evolution of computing from Babbage\'s Analytical Engine to modern operating systems.',
      de: 'Folgen Sie der Evolution des Computings von Babbages Analytischer Maschine zu modernen Betriebssystemen.'
    }
  },
  
  'evolution-biology': {
    id: 'evolution-biology',
    name: {
      en: 'Evolutionary Biology',
      de: 'Evolutionsbiologie'
    },
    icon: '🧬',
    color: '#EF4444', // Red
    domains: ['Science', 'Medicine'],
    keywords: ['evolution', 'darwin', 'biology', 'genetics', 'dna', 'species', 'natural selection', 'mendel'],
    qids: [
      'Q82122', // Jean-Baptiste Lamarck
      'Q171969', // Georges Cuvier
      'Q1035', // Charles Darwin
      'Q160627', // Alfred Russel Wallace
      'Q185062', // Thomas Henry Huxley
      'Q48246', // Ernst Haeckel
      'Q37970', // Gregor Mendel
      'Q60015', // August Weismann
      'Q156349', // Hugo de Vries
      'Q216710', // Thomas Hunt Morgan
      'Q216723', // Ronald Fisher
      'Q208375', // J.B.S. Haldane
      'Q380045', // Sewall Wright
      'Q316331', // Theodosius Dobzhansky
      'Q75613', // Ernst Mayr
      'Q194166', // Stephen Jay Gould
      'Q160026', // Richard Dawkins
      'Q82171', // E. O. Wilson
    ],
    period: '1800–present',
    description: {
      en: 'Explore the chain of evolutionary thought from Lamarck to modern molecular biology.',
      de: 'Erkunden Sie die Kette des evolutionären Denkens von Lamarck zur modernen Molekularbiologie.'
    }
  },
  
  'classical-music': {
    id: 'classical-music',
    name: {
      en: 'Classical Music',
      de: 'Klassische Musik'
    },
    icon: '🎵',
    color: '#F59E0B', // Amber/Gold
    domains: ['Music'],
    keywords: ['music', 'composer', 'symphony', 'opera', 'baroque', 'classical', 'romantic', 'bach', 'mozart', 'beethoven'],
    qids: [
      'Q53068', // Claudio Monteverdi
      'Q1340', // Antonio Vivaldi
      'Q1339', // Johann Sebastian Bach
      'Q7302', // George Frideric Handel
      'Q7349', // Joseph Haydn
      'Q255', // Wolfgang Amadeus Mozart
      'Q254', // Ludwig van Beethoven
      'Q7312', // Franz Schubert
      'Q7294', // Johannes Brahms
      'Q1511', // Richard Wagner
      'Q7304', // Gustav Mahler
      'Q7315', // Richard Strauss
      'Q1268', // Frédéric Chopin
      'Q46096', // Felix Mendelssohn
      'Q7351', // Robert Schumann
      'Q41309', // Franz Liszt
      'Q4700', // Claude Debussy
      'Q1178', // Maurice Ravel
      'Q132682', // Modest Mussorgsky
      'Q93188', // Nikolai Rimsky-Korsakov
      'Q131180', // Sergei Prokofiev
      'Q76364', // Dmitri Shostakovich
      'Q83326', // Béla Bartók
      'Q152158', // Pierre Boulez
      'Q154556', // Karlheinz Stockhausen
      'Q193234', // Philip Glass
      // ... add more from our list
    ],
    period: '1567–present',
    description: {
      en: 'Journey through 450 years of classical music from Monteverdi to minimalism.',
      de: 'Reisen Sie durch 450 Jahre klassische Musik von Monteverdi zum Minimalismus.'
    }
  },
  
  'art-movements': {
    id: 'art-movements',
    name: {
      en: 'Art History',
      de: 'Kunstgeschichte'
    },
    icon: '🎨',
    color: '#EC4899', // Pink
    domains: ['Art'],
    keywords: ['art', 'painting', 'artist', 'renaissance', 'impressionism', 'cubism', 'picasso', 'van gogh', 'monet'],
    qids: [
      'Q7814', // Giotto di Bondone
      'Q5811', // Masaccio
      'Q762', // Leonardo da Vinci
      'Q5597', // Raphael
      'Q5592', // Michelangelo
      'Q42207', // Caravaggio
      'Q5599', // Peter Paul Rubens
      'Q297', // Diego Velázquez
      'Q41264', // Johannes Vermeer
      'Q83155', // Jacques-Louis David
      'Q34618', // Gustave Courbet
      'Q40599', // Édouard Manet
      'Q296', // Claude Monet
      'Q5593', // Pierre-Auguste Renoir
      'Q46373', // Edgar Degas
      'Q35548', // Paul Cézanne
      'Q5580', // Vincent van Gogh
      'Q37693', // Paul Gauguin
      'Q5582', // Pablo Picasso
      'Q5592', // Henri Matisse
      'Q34853', // Georges Braque
      'Q5589', // Salvador Dalí
      'Q7836', // René Magritte
      'Q37571', // Jackson Pollock
      'Q5603', // Andy Warhol
      // ... add more from our list
    ],
    period: '1267–present',
    description: {
      en: 'Follow the evolution of Western art from the Renaissance to Pop Art.',
      de: 'Folgen Sie der Evolution der westlichen Kunst von der Renaissance zur Pop Art.'
    }
  }
};

/**
 * Get all chains a person belongs to based on their QID
 */
export function getChainsForPerson(qid) {
  const chains = [];
  
  for (const [chainId, chain] of Object.entries(DOMAIN_CHAINS)) {
    if (chain.qids.includes(qid)) {
      chains.push({
        id: chainId,
        ...chain
      });
    }
  }
  
  return chains;
}

/**
 * Get all chains for a domain
 */
export function getChainsForDomain(domain) {
  const chains = [];
  
  for (const [chainId, chain] of Object.entries(DOMAIN_CHAINS)) {
    if (chain.domains.includes(domain)) {
      chains.push({
        id: chainId,
        ...chain
      });
    }
  }
  
  return chains;
}

/**
 * Check if a person belongs to any chain based on QID and keywords
 */
export function suggestChainForPerson(qid, name, domains) {
  // First check explicit QID membership
  const directChains = getChainsForPerson(qid);
  if (directChains.length > 0) {
    return directChains;
  }
  
  // Then check by keywords in name
  const suggestedChains = [];
  const nameLower = name.toLowerCase();
  
  for (const [chainId, chain] of Object.entries(DOMAIN_CHAINS)) {
    // Check if person's domain matches chain domains
    const domainMatch = domains.some(d => chain.domains.includes(d));
    
    // Check if person's name contains chain keywords
    const keywordMatch = chain.keywords.some(keyword => 
      nameLower.includes(keyword.toLowerCase())
    );
    
    if (domainMatch || keywordMatch) {
      suggestedChains.push({
        id: chainId,
        ...chain,
        confidence: domainMatch && keywordMatch ? 'high' : 'medium'
      });
    }
  }
  
  return suggestedChains;
}

/**
 * Get chain metadata by ID
 */
export function getChainById(chainId) {
  return DOMAIN_CHAINS[chainId] || null;
}

/**
 * Get all available chains
 */
export function getAllChains() {
  return Object.keys(DOMAIN_CHAINS).map(id => ({
    id,
    ...DOMAIN_CHAINS[id]
  }));
}


/**
 * Daten-Loader für Zeitkette
 * Lädt Wikidata-Daten oder verwendet Fallback
 */

// Fallback Seed Data (falls Wikidata-Daten nicht verfügbar)
const FALLBACK_PEOPLE = [
  { name: "Isaac Newton", born: 1642, died: 1727, domains: ["Science"], region: "UK", qid: "Q935" },
  { name: "Johann Wolfgang von Goethe", born: 1749, died: 1832, domains: ["Literature"], region: "DE", qid: "Q5879" },
  { name: "Albert Einstein", born: 1879, died: 1955, domains: ["Science"], region: "DE/US", qid: "Q937" },
  { name: "Marie Curie", born: 1867, died: 1934, domains: ["Science"], region: "PL/FR", qid: "Q7186" },
  { name: "Ada Lovelace", born: 1815, died: 1852, domains: ["Math","Computing"], region: "UK", qid: "Q7259" },
  { name: "Ludwig van Beethoven", born: 1770, died: 1827, domains: ["Music"], region: "DE", qid: "Q255" },
  { name: "Frida Kahlo", born: 1907, died: 1954, domains: ["Art"], region: "MX", qid: "Q5588" },
  { name: "Alan Turing", born: 1912, died: 1954, domains: ["Computing","Math"], region: "UK", qid: "Q7251" },
  { name: "Tim Berners-Lee", born: 1955, died: 9999, domains: ["Computing"], region: "UK", qid: "Q80" },
  { name: "Elon Musk", born: 1971, died: 9999, domains: ["Business","Engineering"], region: "US", qid: "Q317521" },
];

const FALLBACK_RELATIONS = {};

/**
 * Lädt Personen-Daten
 */
export async function loadPeople() {
  try {
    // Versuche Wikidata-Daten zu laden (aus public/)
    const response = await fetch('/people.json');
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        console.log(`📊 Loaded ${data.length} people from data`);
        return data;
      }
    }
  } catch (error) {
    console.warn('Daten nicht verfügbar, verwende Fallback:', error.message);
  }
  
  console.log(`📊 Using fallback data: ${FALLBACK_PEOPLE.length} people`);
  return FALLBACK_PEOPLE;
}

/**
 * Lädt Beziehungs-Daten
 */
export async function loadRelations() {
  try {
    const response = await fetch('/relations.json');
    if (response.ok) {
      const data = await response.json();
      if (data && Object.keys(data).length > 0) {
        const totalRelations = Object.values(data).reduce((sum, person) => sum + (person.knew?.length || 0), 0);
        console.log(`🔗 Loaded ${Object.keys(data).length} people with ${totalRelations} relations`);
        return data;
      }
    }
  } catch (error) {
    console.warn('Relations-Daten nicht verfügbar, verwende Fallback:', error.message);
  }
  
  console.log('🔗 Using empty relations fallback');
  return FALLBACK_RELATIONS;
}

/**
 * Kombiniert Personen und Beziehungen
 */
export async function loadAllData() {
  const [people, relations] = await Promise.all([
    loadPeople(),
    loadRelations()
  ]);
  
  return { people, relations };
}

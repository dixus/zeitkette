// Domain to occupation mapping
const DOMAIN_TO_OCCUPATION = {
  'Art': 'Künstler',
  'Science': 'Wissenschaftler',
  'Literature': 'Schriftsteller',
  'Philosophy': 'Philosoph',
  'Politics': 'Politiker',
  'Music': 'Musiker',
  'Math': 'Mathematiker',
  'Medicine': 'Mediziner',
  'Business': 'Unternehmer',
  'Military': 'Militär',
  'Religion': 'Theologe',
  'Sports': 'Sportler',
  'Other': 'Historische Persönlichkeit'
};

/**
 * Get a person's occupation based on their domains
 * @param {Object} person - Person object with domains array
 * @returns {string} - Occupation string
 */
export function getOccupation(person) {
  if (!person.domains || person.domains.length === 0) {
    return 'Historische Persönlichkeit';
  }
  
  // Return the first domain's occupation, or combine if multiple
  if (person.domains.length === 1) {
    return DOMAIN_TO_OCCUPATION[person.domains[0]] || person.domains[0];
  }
  
  // For multiple domains, create a combined label
  const occupations = person.domains
    .slice(0, 2)
    .map(d => DOMAIN_TO_OCCUPATION[d] || d);
  return occupations.join(' & ');
}


# Wikidata SPARQL Query Beispiele

## Basis-Query: Top 100 historische Personen

```sparql
SELECT ?person ?personLabel ?born ?died ?occupationLabel ?countryLabel
WHERE {
  ?person wdt:P31 wd:Q5;           # ist ein Mensch
          wdt:P569 ?born;          # hat Geburtsdatum
          wdt:P570 ?died;          # hat Sterbedatum
          wdt:P106 ?occupation;    # hat Beruf
          wdt:P27 ?country.        # hat Staatsangehörigkeit
  
  FILTER(YEAR(?born) >= 1500 && YEAR(?born) <= 2000)
  FILTER(YEAR(?died) >= 1600 && YEAR(?died) <= 2024)
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
}
LIMIT 100
```

**Testen:** https://query.wikidata.org/

---

## Query 2: Personen mit Beziehungen

```sparql
SELECT ?person ?personLabel ?born ?died ?influencedByLabel
WHERE {
  ?person wdt:P31 wd:Q5;
          wdt:P569 ?born;
          wdt:P570 ?died;
          wdt:P737 ?influencedBy.    # beeinflusst durch
  
  FILTER(YEAR(?born) >= 1600 && YEAR(?born) <= 1900)
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
}
LIMIT 200
```

---

## Query 3: Goethe's Beziehungen

```sparql
SELECT ?relation ?relationLabel ?type
WHERE {
  wd:Q5879 ?prop ?relation.         # Q5879 = Goethe
  ?relation wdt:P31 wd:Q5.          # relation ist auch ein Mensch
  
  ?property wikibase:directClaim ?prop.
  ?property rdfs:label ?type.
  FILTER(LANG(?type) = "en")
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
}
```

---

## Query 4: Wissenschaftler mit Bildern

```sparql
SELECT ?person ?personLabel ?born ?died ?image
WHERE {
  ?person wdt:P31 wd:Q5;
          wdt:P569 ?born;
          wdt:P570 ?died;
          wdt:P106 wd:Q901;         # Beruf: Wissenschaftler
          wdt:P18 ?image.           # hat Bild
  
  FILTER(YEAR(?born) >= 1600 && YEAR(?born) <= 1950)
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
}
LIMIT 100
```

---

## Wichtige Wikidata Q-IDs (Berufe)

- Q901 - Wissenschaftler
- Q36180 - Schriftsteller
- Q639669 - Musiker
- Q1028181 - Maler
- Q4964182 - Philosoph
- Q82955 - Politiker
- Q170790 - Mathematiker
- Q5482740 - Erfinder

---

## JavaScript Fetch Beispiel

```javascript
async function fetchFromWikidata(query) {
  const endpoint = 'https://query.wikidata.org/sparql';
  const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/sparql-results+json',
      'User-Agent': 'Zeitkette/1.0 (https://zeitkette.app)'
    }
  });
  
  return response.json();
}

// Beispiel:
const query = `
  SELECT ?person ?personLabel ?born ?died
  WHERE {
    ?person wdt:P31 wd:Q5;
            wdt:P569 ?born;
            wdt:P570 ?died.
    FILTER(YEAR(?born) = 1749)  # Goethe's Geburtsjahr
    SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
  }
`;

const data = await fetchFromWikidata(query);
console.log(data.results.bindings);
```

---

## Rate Limits

- **Wikidata SPARQL:** ~60 requests/minute (fair use)
- **Empfehlung:** 1 Request / 2 Sekunden
- **Bulk-Download:** Besser über Dumps: https://dumps.wikimedia.org/wikidatawiki/

---

## Nächste Schritte

1. Queries oben in SPARQL Editor testen
2. Script schreiben: `fetchFromWikidata.js`
3. Daten in `people.json` transformieren
4. Beziehungen separat laden → `relations.json`


# Skalierungs-Strategie für Zeitkette

## 📊 Realistische Zahlen auf Wikidata

### Verfügbare Personen nach Relevanz:

| Kategorie | Anzahl | Kriterium | Beispiele |
|-----------|--------|-----------|-----------|
| **Sehr bekannt** | ~5.000 | 50+ Wikipedia-Artikel | Einstein, Goethe, Napoleon |
| **Bekannt** | ~20.000 | 20+ Wikipedia-Artikel | Wissenschaftler, Künstler |
| **Relevant** | ~100.000 | 10+ Wikipedia-Artikel | Regionale Größen |
| **Dokumentiert** | ~500.000 | 3+ Wikipedia-Artikel | Alle mit Biografie |
| **Alle** | ~10 Mio. | Geburt + Tod bekannt | Inkl. lokale Personen |

## 🎯 Empfohlene Strategie

### Phase 1: Quick Start (2.000 Personen)
```javascript
// In fetchFromWikidata.js:
FILTER(?sitelinks >= 20)  // Nur sehr bekannte
LIMIT 2000
```
**Zeit:** ~30 Sekunden  
**Datei:** ~500 KB  
**Abdeckung:** Alle "großen Namen" der Geschichte

### Phase 2: Umfassend (10.000 Personen)
```javascript
FILTER(?sitelinks >= 10)  // Bekannte Personen
LIMIT 10000
```
**Zeit:** ~2-3 Minuten (Rate-Limited)  
**Datei:** ~2 MB  
**Abdeckung:** Sehr gute globale Abdeckung

### Phase 3: Vollständig (50.000 Personen)
```javascript
FILTER(?sitelinks >= 5)   // Relevante Personen
LIMIT 50000
```
**Zeit:** ~10-15 Minuten  
**Datei:** ~10 MB  
**Abdeckung:** Fast vollständig

### Phase 4: Maximum (100k+ Personen)
```javascript
FILTER(?sitelinks >= 3)   // Alle dokumentierten
# LIMIT aufheben, Batch-Processing
```
**Zeit:** Mehrere Stunden (Batches)  
**Datei:** 50+ MB → Backend + DB nötig!  
**Abdeckung:** Komplett

## 🔢 Query-Anpassungen für mehr Personen

### 1. Sitelinks anpassen (Relevanz-Filter)

```sparql
# Sehr selektiv (Top 5k)
FILTER(?sitelinks >= 50)

# Selektiv (Top 20k)
FILTER(?sitelinks >= 20)

# Normal (Top 50k)
FILTER(?sitelinks >= 10)

# Umfassend (100k+)
FILTER(?sitelinks >= 5)

# Alles (500k+)
FILTER(?sitelinks >= 1)
```

### 2. Zeitraum erweitern

```sparql
# Neuzeit (1400-heute) → ~50k Personen
FILTER(?born >= 1400 && ?born <= 2020)

# Mittelalter+ (500-heute) → ~80k Personen
FILTER(?born >= 500 && ?born <= 2020)

# Antike+ (-500-heute) → ~100k Personen
FILTER(?born >= -500 && ?born <= 2020)

# Alle Epochen → ~500k Personen
# Kein FILTER auf born
```

### 3. Berufe erweitern

```sparql
# Aktuell: 10-12 Berufe (Science, Literature, etc.)
# Erweiterbar auf 50+ Berufe:

VALUES ?occupation {
  # Wissenschaft
  wd:Q901 wd:Q11063 wd:Q170790 wd:Q205375 wd:Q593644
  
  # Kunst & Kultur
  wd:Q36180 wd:Q639669 wd:Q1028181 wd:Q33999
  
  # Politik & Militär
  wd:Q82955 wd:Q212238 wd:Q116
  
  # Religion & Philosophie
  wd:Q4964182 wd:Q733830 wd:Q191808
  
  # Wirtschaft & Business
  wd:Q83307 wd:Q43845
  
  # Sport & Entertainment
  wd:Q2066131 wd:Q33999
}
```

### 4. Oder: KEINE Berufs-Filterung!

```sparql
# Einfach weglassen für ALLE Berufe:
# VALUES ?occupation { ... }  ← LÖSCHEN

# Dann mit sitelinks filtern:
FILTER(?sitelinks >= 10)  # Nur relevante
```

## 💾 Datenbank-Optionen nach Größe

### < 5.000 Personen
- ✅ **JSON Datei** (`people.json`)
- Frontend lädt beim Start
- Kein Backend nötig
- Funktioniert super

### 5.000 - 20.000 Personen
- ✅ **JSON Datei** (gzipped)
- Oder: **IndexedDB** im Browser
- Optional: Lazy Loading
- Immer noch kein Backend nötig

### 20.000 - 100.000 Personen
- ⚠️ **SQLite** (Backend)
- Next.js API Routes
- Oder: Supabase (PostgreSQL)
- Pagination im Frontend

### 100.000+ Personen
- 🔥 **PostgreSQL/Supabase**
- Full-Text Search
- API mit Caching
- Virtualisierung im Frontend

## 📝 Biografien & Details

### Was Wikidata bietet:

1. **`schema:description`** (1 Zeile)
   ```
   "deutscher Dichter, Dramatiker, Naturwissenschaftler"
   ```

2. **Wikipedia-Link** (komplette Bio)
   ```
   https://de.wikipedia.org/wiki/Johann_Wolfgang_von_Goethe
   ```

3. **Zusätzliche Properties** (optional):
   - `P19` - Geburtsort (mit Koordinaten!)
   - `P20` - Sterbeort
   - `P734` - Nachname
   - `P735` - Vorname
   - `P21` - Geschlecht
   - `P1477` - Geburtsname

### Biografie-Quellen Kombination:

```javascript
{
  "name": "Ada Lovelace",
  "description": "britische Mathematikerin", // Wikidata
  "wikipedia": "https://de.wikipedia.org/...", // Wikidata
  "summary": "...",  // Wikipedia API (1. Absatz)
  "llmSummary": "..." // GPT (falls Wikipedia zu lang)
}
```

## 🚀 Batch-Processing für große Mengen

```javascript
// fetchFromWikidata.js erweitert für Batches:

async function fetchInBatches(limit = 50000, batchSize = 5000) {
  const allPeople = [];
  
  for (let offset = 0; offset < limit; offset += batchSize) {
    console.log(`Batch ${offset}-${offset + batchSize}...`);
    
    const query = PEOPLE_QUERY
      .replace('LIMIT 2000', `LIMIT ${batchSize} OFFSET ${offset}`);
    
    const data = await queryWikidata(query);
    const batch = transformPeople(data.results);
    allPeople.push(...batch);
    
    await delay(3000); // Rate limiting: 3 Sekunden Pause
  }
  
  return allPeople;
}
```

## 📈 Performance-Tipps

### Frontend (JSON-basiert):
1. **Virtualisierung**: `react-window` für lange Listen
2. **Lazy Loading**: Nur sichtbare Jahre laden
3. **Web Worker**: Filterung in separatem Thread
4. **IndexedDB**: Cache im Browser

### Backend (DB-basiert):
1. **Indexes**: auf `born`, `died`, `sitelinks`
2. **Pagination**: Max 100 Personen pro Request
3. **Caching**: Redis für häufige Queries
4. **CDN**: Statische Daten via CDN

## 🎯 Empfehlung für Zeitkette

### MVP (Jetzt):
- **2.000 Personen** (sitelinks >= 20)
- JSON-Datei
- Alle bekannten Namen dabei

### Version 1.0 (in 1 Monat):
- **10.000 Personen** (sitelinks >= 10)
- Immer noch JSON
- Sehr umfassend

### Version 2.0 (in 3 Monaten):
- **50.000 Personen** (sitelinks >= 5)
- Supabase Backend
- Mit Volltextsuche

---

## 🔧 Quick-Change für mehr Personen

```javascript
// In fetchFromWikidata.js, Zeile ~115:

// Von:
LIMIT 2000

// Nach:
LIMIT 10000  // 10k Personen

// Und:
FILTER(?sitelinks >= 20)

// Nach:
FILTER(?sitelinks >= 10)  // Niedrigerer Relevanz-Filter
```

**Speichern, `npm run fetch-data`, fertig!** 🚀


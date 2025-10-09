# Zeitchain 🔗⏳

**Connect historical figures across time - discover how many lifetimes separate you from history's greatest minds.**

*Eine interaktive Zeitkette historischer Persönlichkeiten – visualisiert, wie wenige "Lebenszeiten" uns von historischen Größen trennen.*

**458 historical figures • 100+ Wikipedia articles minimum • 2654 years of history (630 BCE - today)**

🌐 **Available in English & German** (automatic browser detection)

## 🌟 Features

- ✅ **Three Visualization Modes**: List, Timeline, and Network views
- ✅ **Interactive Chain Building**: "To Today" or "Between Two People" modes
- ✅ **Smart Pathfinding**: BFS algorithm with overlap detection
- ✅ **Wikipedia Avatars**: Cached images from Wikidata
- ✅ **Fun Facts Generator**: Discover insights about your chain
- ✅ **Keyboard Shortcuts**: Fast navigation (L/T/N/R/ESC//)
- ✅ **Glassmorphism UI**: Modern design with smooth animations
- ✅ **Network Visualization**: D3.js force-directed graph with 30+ contemporaries
- ✅ **i18n Support**: English & German with browser detection

## 🚀 Quick Start

```bash
# Installation
npm install

# Development Server starten
npm run dev

# Build für Production
npm run build

# Daten-Management
npm run build-curated      # Generiere Dataset (427 Personen)
npm run analyze-coverage   # Prüfe zeitliche Abdeckung
npm run fetch-data         # (Optional) Wikidata Daten laden
```

## 📂 Project Structure

```
zeitchain/
├── src/
│   ├── App.jsx              # Haupt-Komponente mit Chain & Timeline
│   ├── dataLoader.js        # Daten-Loader
│   ├── index.css            # Tailwind + Custom Styles
│   └── main.jsx
├── scripts/
│   ├── curatedData.js       # 427 kuratierte Personen + Beziehungen
│   ├── buildCuratedDataset.js    # Generiert JSON aus curatedData
│   ├── analyzeTimeCoverage.js    # Zeitspannen-Analyse
│   └── fetchFromWikidata.js      # (Optional) Wikidata loader
├── public/                   # Statische Daten
│   ├── people.json          # 427 Personen
│   └── relations.json       # 56 Beziehungen
├── data/                     # Backup (gleicher Inhalt)
├── ROADMAP.md               # Entwicklungsplan
├── SCALING.md               # Skalierungs-Strategie
└── example_queries.md       # Wikidata SPARQL Beispiele
```

## 📊 Dataset Statistik

**427 Personen:**
- 📜 **113** Literatur (Goethe, Shakespeare, Dante...)
- 🧠 **90** Philosophie (Sokrates, Platon, Kant...)
- 🏛️ **75** Politik (Caesar, Napoleon, Lincoln...)
- 🎨 **72** Kunst (da Vinci, Picasso, van Gogh...)
- 🔬 **44** Wissenschaft (Einstein, Newton, Darwin...)
- 🎵 **31** Musik (Mozart, Beethoven, Bach...)
- ➕ **18** Mathematik (Pythagoras, Euklid, Gauß...)
- ⚕️ **11** Medizin (Hippokrates, Galen, Marie Curie...)
- 💼 **8** Business (Ford, Jobs, Musk...)

**Zeitabdeckung:**
- Von **630 v. Chr.** (Sappho) bis **2024** (heute)
- **98.1%** aller 50-Jahres-Perioden abgedeckt
- Nur 1 kleine Lücke (900-949 n.Chr.)

**Beziehungen:**
- 56 Personen mit dokumentierten Verbindungen
- Typen: Lehrer-Schüler, Freunde, Rivalen, Kollegen
- Beispiele: Sokrates → Platon → Aristoteles

## 🎯 Nächste Features

### Kurzfristig
- [ ] Interaktiver Beziehungsgraph (Force-Directed)
- [ ] Smooth Transitions & Micro-Animations
- [ ] Mobile-First Responsive Design
- [ ] Bilder/Avatare für Personen

### Mittelfristig
- [ ] "6 Degrees of Separation" Finder
- [ ] Export als PNG/PDF
- [ ] Permalinks für Ketten
- [ ] GPT-Integration für fehlende Beziehungen

Siehe [ROADMAP.md](./ROADMAP.md) für Details.

## 🌐 Wikidata Integration

### Warum Wikidata?
- ✅ Komplett kostenlos & öffentlich
- ✅ Strukturierte Daten (Geburt, Tod, Beruf, Beziehungen)
- ✅ 100+ Millionen Entitäten
- ✅ SPARQL API (keine Auth nötig)

### Wichtige Properties
- `P569` - Geburtsdatum
- `P570` - Sterbedatum
- `P106` - Beruf
- `P737` - beeinflusst durch (für Beziehungen!)
- `P18` - Bild (für Avatare)

### Daten laden

```bash
npm run fetch-data
```

Generiert:
- `data/people.json` (500 Personen)
- `data/relations.json` (Beziehungen)

## 🤝 "Wer kannte wen?" Feature

### Ansatz 1: Wikidata (bevorzugt)
Wikidata hat Properties für Beziehungen:
- `P737` - influenced by (z.B. Schiller → Goethe)
- `P802` - student
- `P1066` - student of
- `P108` - employer (gleiche Institution)

**Coverage**: ~30-50% der bekannten Beziehungen

### Ansatz 2: GPT-4o-mini (Fallback)
Für fehlende Beziehungen:

```javascript
const prompt = `
Did Johann Wolfgang von Goethe know Friedrich Schiller personally?
Answer: yes/no/unknown
Confidence: 0-100%
Context: 1-2 sentences
`;
```

**Kosten**: ~$0.0001 pro Anfrage (extrem günstig)  
**Caching**: Ergebnisse in `relations.json` speichern

## 📊 Datenbank-Strategie

### Phase 1: JSON (aktuell)
- 500-1000 Personen
- Ausreichend für MVP
- Schnell, keine DB nötig

### Phase 2: Erweitert (später)
- 3000-5000 Personen
- Immer noch JSON möglich
- Oder: SQLite für bessere Queries

### Phase 3: Groß (optional)
- 10k+ Personen
- PostgreSQL/Supabase
- API-Backend

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS v4
- Lucide Icons

**Daten:**
- Wikidata SPARQL API
- JSON files (statisch)
- Optional: GPT-4o-mini

**Geplant:**
- D3.js (Visualisierung)
- Zustand (State Management)

## 💡 Beispiel: Goethe → heute

```
1. Goethe (1749-1832)
2. Lewis Carroll (1832-1898) ← geboren als Goethe starb!
3. Bertrand Russell (1872-1970)
4. Stephen Hawking (1942-2018)
5. Tim Berners-Lee (1955-heute)

= Nur 4 Sprünge von Goethe bis heute!
```

## 📝 Lizenz

MIT (educational project)

## 🙋 Fragen?

Siehe [ROADMAP.md](./ROADMAP.md) für den vollständigen Plan.

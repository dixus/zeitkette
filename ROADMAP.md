# Zeitkette Roadmap

## Phase 1: Daten-Infrastruktur (1-2 Wochen)

### 1.1 Wikidata Integration
- [ ] Script: `scripts/fetchFromWikidata.js`
  - SPARQL Query für Top 500-1000 historische Personen
  - Filter: born < 2000, died bekannt, mindestens 1 domain
  - Output: `data/people.json`
  
- [ ] Properties abrufen:
  - P569 (birth), P570 (death)
  - P106 (occupation) → domains mapping
  - P27 (country) → region
  - P18 (image) für Avatare
  - P1559 (native name) für alternative Namen

### 1.2 Beziehungs-Graph aufbauen
- [ ] Script: `scripts/fetchRelations.js`
  - Wikidata Properties: P737, P802, P1066, P26, P108
  - Output: `data/relations.json`
  
Format:
```json
{
  "Q5879": {
    "name": "Johann Wolfgang von Goethe",
    "knew": [
      { "qid": "Q22670", "name": "Friedrich Schiller", "type": "friend", "source": "wikidata_P737" },
      { "qid": "Q76504", "name": "Alexander von Humboldt", "type": "acquaintance", "source": "wikidata_P108" }
    ]
  }
}
```

### 1.3 GPT-4o-mini Fallback
- [ ] `src/services/llmRelations.js`
  - Nur wenn Wikidata keine Daten liefert
  - Prompt: "Did {person A} know {person B}? Return: yes/no/unknown + confidence"
  - Cache in localStorage oder relations.json
  - Rate limiting: max 10 queries/minute

## Phase 2: UI Erweiterungen (1 Woche)

### 2.1 Timeline Enhancements
- [ ] Hover auf Person → zeigt "Bekannte" als Highlights
- [ ] Click auf Person → Sidebar mit Details + Beziehungs-Graph
- [ ] Bilder/Avatare aus Wikidata P18

### 2.2 Neue Ansicht: "Beziehungsnetzwerk"
- [ ] D3.js Force-Directed Graph
- [ ] Nodes = Personen, Edges = Beziehungen
- [ ] Filter nach Beziehungstyp (friend, teacher, colleague)

### 2.3 "Wer kannte wen?" Feature
- [ ] Suchfeld: 2 Personen auswählen
- [ ] Zeigt: "Kürzester Pfad" (6 Degrees of Separation)
- [ ] Beispiel: Newton → Leibniz → Euler → Goethe

## Phase 3: Datenbank-Größe (2 Wochen)

### 3.1 Erweiterte Datenbasis
- [ ] 3000-5000 Personen (alle Epochen, global)
- [ ] Kategorien erweitern:
  - Antike (Platon, Aristoteles, Caesar)
  - Mittelalter (Avicenna, Thomas von Aquin)
  - Asien (Konfuzius, Laozi, Akbar)
  - Afrika (Nefertiti, Mansa Musa)

### 3.2 Datenbankstruktur
Option A: Bleib bei JSON (< 10k Personen)
Option B: SQLite (> 10k Personen, bessere Queries)

```sql
CREATE TABLE people (
  qid TEXT PRIMARY KEY,
  name TEXT,
  born INTEGER,
  died INTEGER,
  domains TEXT, -- JSON array
  region TEXT,
  image_url TEXT
);

CREATE TABLE relations (
  from_qid TEXT,
  to_qid TEXT,
  type TEXT, -- 'knew', 'influenced', 'taught'
  source TEXT, -- 'wikidata', 'llm', 'manual'
  confidence REAL,
  PRIMARY KEY (from_qid, to_qid)
);
```

## Phase 4: Features & Polish (1-2 Wochen)

### 4.1 Interaktivität
- [ ] Permalinks (URL mit Query-Parametern)
- [ ] Export als PNG/SVG
- [ ] Teilen-Button (Twitter, etc.)
- [ ] Dark Mode

### 4.2 "Was passierte als..." Events
- [ ] Historische Events als Marker (Französische Revolution, etc.)
- [ ] Overlay auf Timeline
- [ ] Data: eigene `events.json` oder Wikidata

### 4.3 Mobile Optimierung
- [ ] Touch-Gesten für Zoom
- [ ] Swipe-Navigation
- [ ] Responsive Timeline

## Phase 5: Backend & Deployment (Optional)

### 5.1 Backend API (Optional, nur wenn nötig)
- [ ] Next.js API Routes oder Express
- [ ] Endpoints:
  - GET /api/people?filter=...
  - GET /api/relations/:qid
  - POST /api/llm/check-relation

### 5.2 Deployment
- [ ] Vercel / Netlify (Frontend)
- [ ] Supabase / PlanetScale (wenn DB nötig)
- [ ] CDN für people.json

---

## Tech Stack Empfehlung

**Aktuell:**
- React + Vite
- Tailwind CSS
- Lucide Icons

**Phase 2+:**
- D3.js für Netzwerk-Visualisierung
- Zustand oder Jotai (State Management)
- TanStack Query (Data Fetching)

**Daten:**
- Wikidata SPARQL API
- OpenAI GPT-4o-mini (Fallback)
- JSON Files (< 5000 Personen)

---

## Nächste Schritte (Sofort)

1. **Wikidata SPARQL Query testen** (siehe example_queries.md)
2. **Script schreiben**: `scripts/fetchFromWikidata.js`
3. **people.json generieren** mit 500 Personen
4. **relations.json erstellen** für bekannte Beziehungen (Goethe-Schiller etc.)
5. **UI erweitern**: "Bekannte" anzeigen

**Zeitaufwand Gesamt:** 6-10 Wochen für vollständige Implementierung
**MVP+:** 2 Wochen (Wikidata + Basis-Relationen)


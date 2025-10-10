# Zeitkette Scripts

This folder contains utility scripts for managing and enhancing the Zeitkette dataset.

All scripts now work directly with `public/people.json` and `public/relations.json` - no syncing needed! Just refresh your browser after running any script.

## 📂 Current Organization

### 🔧 Active Tools (Use These!)

**Data Quality & Analysis:**
- **`checkAllChains.cjs`** ⭐ NEW - Verifies all domain chains are fully connected
  ```bash
  node scripts/checkAllChains.cjs
  ```
  Shows connectivity status for all 5 domain chains (Quantum Mechanics, Computer Science, etc.)

- **`consistencyCheck.cjs`** - Validates data integrity
  ```bash
  node scripts/consistencyCheck.cjs
  ```
  Checks for: duplicate QIDs, broken relations, low sitelinks
  Output: `scripts/consistency_report.json`

- **`reportCenturyCoverage.cjs`** - Analyzes temporal coverage
  ```bash
  node scripts/reportCenturyCoverage.cjs
  ```
  Shows people per century, identifies gaps
  Output: `scripts/coverage_report.json`

- **`checkDuplicates.cjs`** - Finds duplicate entries
  ```bash
  node scripts/checkDuplicates.cjs
  ```
  Finds duplicates by QID and name
  Output: `scripts/duplicate_report.json`

- **`removeDuplicates.cjs`** - Removes duplicates (use carefully!)
  ```bash
  node scripts/removeDuplicates.cjs
  ```

**Core Data Processing:**
- **`processWikidataDump.js`** - Processes Wikidata JSON dumps
- **`fetchNobelLaureates.cjs`** - Fetches Nobel Prize winners from Wikidata

### 📦 Archived Scripts

**`archive/chain-builders/`** - Scripts that built the 5 domain chains (completed ✅)
- `addQuantumMechanicsChain.cjs` - Quantum Mechanics (25 people, 67 relations)
- `completeQuantumNetwork.cjs` - Enhanced quantum connections
- `addComputerScienceChain.cjs` - Computer Science (19 people, 34 relations)
- `addEvolutionBiologyChain.cjs` - Evolutionary Biology (18 people, 32 relations)
- `addClassicalMusicChain.cjs` - Classical Music (26 people, 51 relations)
- `addArtMovementChains.cjs` - Art Movements (24 people, 53 relations)
- Plus supporting scripts for each chain

**`archive/`** - Historical saturation scripts (ancient & medieval periods)
- `saturateAncientPeriod.cjs` - Added 101 ancient figures
- `fillAncientGaps.cjs` - Added 151 gap-filler figures
- `saturateMedieval.cjs` - Added 245 medieval figures
- Other temporal saturation scripts

## 📊 Current Dataset Status

- **People**: 2,327
- **Relations**: 1,500+
- **Domain Chains**: 5 (all 100% connected! ✅)
  - 🔬 Quantum Mechanics (25 people)
  - 💻 Computer Science (19 people)
  - 🧬 Evolutionary Biology (18 people)
  - 🎵 Classical Music (26 people)
  - 🎨 Art Movements (24 people)

## 🚀 Future Script Ideas

Want to add more chains? Here are good candidates:
- 🧠 Philosophy (Socrates → Plato → Aristotle → Kant → Nietzsche)
- 🔢 Mathematics (Euclid → Newton → Euler → Gauss → Gödel)
- 🏛️ Political Thought (Machiavelli → Locke → Rousseau → Marx)
- ⚛️ Chemistry (Lavoisier → Dalton → Mendeleev → Curie)
- 📚 Literature (Epic → Romantic → Modernist → Contemporary)

## 📝 Documentation

- **`DUMP_GUIDE.md`** - Instructions for processing Wikidata dumps
- **`README.md`** - This file

---

**Last Updated**: October 2024  
**Maintained by**: Zeitkette Development Team

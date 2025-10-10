# Zeitkette Enhancement Plan - Phase 2

## Immediate Actions (This Session)

### 1. ✅ Data Cleanup (CRITICAL)
- [x] **Check for duplicates** - Found 127 duplicates!
- [ ] **Remove duplicates systematically** - Keep entries with correct QIDs
- [ ] **Validate all QIDs** against common patterns
- [ ] **Clean up temp files and unused scripts**

### 2. Domain-Specific Dependency Graphs
Add rich relation networks for major scientific/intellectual domains:

#### Quantum Mechanics Chain
**Goal:** Complete teacher-student-collaborator network
- Max Planck (1858-1947) → Einstein (1879-1955)
- Niels Bohr (1885-1962) → Heisenberg (1901-1976)
- Arnold Sommerfeld (1868-1951) → Pauli, Heisenberg
- Louis de Broglie (1892-1987) → Schrödinger
- Paul Dirac (1902-1984) → Feynman
- **Target:** 30+ relations with types: teacher/student/collaborated/influenced

#### Theory of Relativity Chain
- Einstein → Minkowski → Hilbert → Eddington
- Lorentz → Einstein → Schwarzschild
- **Target:** 15+ relations

#### Evolutionary Biology Chain
- Darwin → Huxley → Wallace
- Mendel → Morgan → Watson & Crick
- **Target:** 20+ relations

#### Computer Science Chain
- Babbage → Turing → von Neumann → Knuth
- Church → Turing → McCarthy
- **Target:** 25+ relations

#### Impressionism/Modern Art Chain
- Manet → Monet → Renoir → Cézanne → Picasso
- Van Gogh → Gauguin influences
- **Target:** 20+ relations

#### Classical Music Chain
- Bach → Mozart → Beethoven → Brahms → Mahler
- Wagner → Strauss lineage
- **Target:** 30+ relations

### 3. Fill Remaining Gaps
Based on coverage report, add 10-15 figures per under-covered century:
- 2nd century CE (currently 20, target 30)
- 3rd century CE (currently 21, target 30)
- 6th century CE (currently 24, target 30)
- 10th century CE (currently 28, target 30)

### 4. Script Cleanup
**Delete unused/obsolete scripts:**
- `scripts/addPeople.js` (already deleted)
- `scripts/addMorePeople.cjs` (already deleted)
- `scripts/addFinalBatch.cjs` (already deleted)
- `scripts/addTo1000.cjs` (already deleted)
- `scripts/addFinal13.cjs` (already deleted)
- Keep: `checkDuplicates.cjs`, `reportCenturyCoverage.cjs`, `consistencyCheck.cjs`

**Rename for clarity:**
- `saturateAncientPeriod.cjs` → `archive/` (done, no longer needed)
- `fillAncientGaps.cjs` → `archive/` (done, no longer needed)
- `saturateMedieval.cjs` → `archive/` (done, no longer needed)

## Priority Tasks

### Phase 2A: Data Quality (Today)
1. **Remove all 127 duplicates** (30 min)
2. **Add quantum mechanics relations** (30 min)
3. **Add computer science relations** (20 min)
4. **Script cleanup** (15 min)

### Phase 2B: Relation Enrichment (Today/Tomorrow)
1. **Add evolutionary biology chain** (20 min)
2. **Add impressionism chain** (15 min)
3. **Add classical music chain** (20 min)
4. **Add philosophy chains** (Kant→Hegel→Marx, etc.) (30 min)

### Phase 2C: Gap Filling (Tomorrow)
1. **2nd-3rd century CE** (add 20 figures)
2. **6th century CE** (add 10 figures)
3. **10th century CE** (add 5 figures)

## Expected Outcomes

### After Phase 2A
- **People:** 2,223 (removed 127 duplicates)
- **Relations:** ~1,300 (added 60+ domain-specific)
- **Scripts:** Cleaned up, organized
- **Data Quality:** 100% duplicate-free

### After Phase 2B
- **Relations:** ~1,400 (added 100+ more)
- **Domain Networks:** 6 major networks with rich connections

### After Phase 2C
- **People:** ~2,260
- **Well-Saturated Centuries:** 24 (up from 21)
- **Under-covered Centuries:** <20 (down from 28)

## Long-Term Roadmap

### Phase 3: Advanced Features (Future)
1. **Bidirectional relations** - Store relations from both perspectives
2. **Relation type standardization** - Merge overlapping types
3. **Geographic diversity** - Add 50+ non-Western figures
4. **Gender balance** - Target 20% women representation
5. **Image URLs** - Add Wikimedia Commons images for top 500 figures

### Phase 4: Interactive Features (Future)
1. **Influence scores** - Calculate based on relation network
2. **Domain clustering** - ML-based similar figure suggestions
3. **Timeline events** - Major discoveries, publications, wars
4. **Collaboration networks** - Visualize who worked with whom

## Success Metrics

### Data Quality
- ✅ Zero duplicate QIDs
- ✅ Zero duplicate names
- ✅ All relations validated (both QIDs exist)
- ✅ All scripts documented and necessary

### Network Richness
- 🎯 Average 2.5+ relations per person (currently ~0.5)
- 🎯 At least 10 domain-specific networks with 15+ relations each
- 🎯 Longest chain: 50+ people (currently ~30)

### Coverage
- 🎯 25+ well-saturated centuries (30+ people each)
- 🎯 No century with <5 people (except very early periods)
- 🎯 At least 3 domains per well-saturated century

## Notes

- Focus on **quality over quantity** for relations
- Ensure **temporal feasibility** (no anachronisms)
- Prioritize **high-impact networks** (quantum physics, evolution, etc.)
- Keep scripts **modular and reusable**
- Document all major changes in `CHANGELOG.md`


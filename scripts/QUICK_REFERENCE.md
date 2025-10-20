# Wikidata Expansion - Quick Reference

## 🚀 Most Common Commands

### 1. Analyze What's Missing
```bash
node scripts/analyzeGaps.cjs
```
Shows centuries with low coverage and suggests fetch commands.

### 2. Expand Database (Recommended)
```bash
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60
```
Adds ~1,700 new people in 40 minutes. **Best starting point!**

### 3. Test First (Dry Run)
```bash
node scripts/fetchWikidataByDecade.cjs --start-year 1850 --end-year 1860 --min-sitelinks 100 --dry-run
```
See what would be fetched without saving.

### 4. Verify Results
```bash
node scripts/consistencyCheck.cjs
node scripts/checkDuplicates.cjs
```
Check data quality after expansion.

## 📊 Sitelink Threshold Guide

| Threshold | Total People | Quality | Use Case |
|-----------|--------------|---------|----------|
| 100 | ~2,800 | Excellent | Only very famous |
| 80 | ~3,000 | Very Good | High quality |
| **60** | **~4,000** | **Good** | **Recommended** |
| 50 | ~6,000 | Adequate | More coverage |
| 40 | ~10,000 | Fair | Maximum coverage |

## 🎯 Common Scenarios

### Scenario 1: "I want more people, fast!"
```bash
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60
```
**Result:** +1,700 people in 40 min

### Scenario 2: "I need very high quality only"
```bash
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 80
```
**Result:** +500 people in 20 min

### Scenario 3: "Fill ancient period gaps"
```bash
node scripts/fetchWikidataByDecade.cjs --start-year -600 --end-year 0 --min-sitelinks 40
```
**Result:** +200-300 ancient figures in 10 min

### Scenario 4: "I want EVERYTHING"
```bash
# First pass
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60

# Second pass (lower threshold)
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 50

# Third pass (even lower)
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 40
```
**Result:** ~10,000 people in 2-3 hours

## ⚙️ Options Quick Reference

```bash
--start-year YEAR       # Start year (e.g., 1800)
--end-year YEAR         # End year (e.g., 1900)
--century NUM           # Shorthand (e.g., 19 = 1801-1900)
--all                   # All years (-650 to 2024)
--min-sitelinks NUM     # Fame threshold (default: 60)
--decade-size NUM       # Years per query (default: 10)
--delay MS              # Delay between queries (default: 2000)
--max-results NUM       # Max per decade (default: 1000)
--dry-run               # Test without saving
--verbose               # Show details
```

## 🔧 Troubleshooting

### Problem: Still getting timeouts
```bash
# Reduce chunk size and increase delay
node scripts/fetchWikidataByDecade.cjs --all --decade-size 5 --delay 3000 --min-sitelinks 60
```

### Problem: Rate limited (429 errors)
```bash
# Increase delay significantly
node scripts/fetchWikidataByDecade.cjs --all --delay 5000 --min-sitelinks 60
```

### Problem: Too many results in one decade
```bash
# Increase sitelink threshold
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 80
```

### Problem: Script interrupted
```bash
# Just run it again - it skips existing people automatically!
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60
```

## 📈 Workflow

```
1. Analyze gaps
   ↓
2. Fetch data (dry run first)
   ↓
3. Fetch data (for real)
   ↓
4. Check for duplicates
   ↓
5. Remove duplicates if needed
   ↓
6. Verify data quality
   ↓
7. Check coverage
   ↓
8. Repeat with lower threshold if desired
```

## 💡 Pro Tips

1. **Always dry-run first** on a small range to test
2. **Start with threshold 60** - good balance
3. **Run overnight** if going for maximum coverage
4. **Check duplicates** after each major fetch
5. **Save progress files** - they're useful for debugging
6. **Lower threshold for ancient periods** (40-50 instead of 60)
7. **Higher threshold for modern periods** (70-80 for 20th century)

## 📁 Output Files

- `public/people.json` - Updated person database
- `scripts/fetch_progress.json` - Detailed progress log
- `scripts/gap_analysis.json` - Gap analysis report

## ⏱️ Time Estimates

| Range | Decades | Time (60 sitelinks) |
|-------|---------|---------------------|
| Single century | 10 | ~30 seconds |
| Ancient (-650 to 0) | 65 | ~3 minutes |
| Medieval (1-1500) | 150 | ~7 minutes |
| Modern (1500-2024) | 52 | ~2 minutes |
| **All (-650 to 2024)** | **267** | **~40 minutes** |

*Times include 2-second delay between queries*

## 🎓 Examples by Era

### Ancient Period
```bash
node scripts/fetchWikidataByDecade.cjs --start-year -600 --end-year 0 --min-sitelinks 40
```

### Medieval Period
```bash
node scripts/fetchWikidataByDecade.cjs --start-year 500 --end-year 1500 --min-sitelinks 50
```

### Renaissance
```bash
node scripts/fetchWikidataByDecade.cjs --start-year 1400 --end-year 1600 --min-sitelinks 55
```

### Enlightenment
```bash
node scripts/fetchWikidataByDecade.cjs --century 18 --min-sitelinks 60
```

### 19th Century
```bash
node scripts/fetchWikidataByDecade.cjs --century 19 --min-sitelinks 65
```

### 20th Century
```bash
node scripts/fetchWikidataByDecade.cjs --century 20 --min-sitelinks 70
```

---

**Need more help?** See `WIKIDATA_EXPANSION_GUIDE.md` for complete documentation.

**Ready to start?** Run: `node scripts/analyzeGaps.cjs`


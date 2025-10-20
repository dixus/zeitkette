# Wikidata Expansion Guide

## Overview

This guide explains how to massively expand the Zeitkette person database using Wikidata's SPARQL endpoint. We've solved the timeout issues by querying iteratively by decade instead of all at once.

## The Problem We Solved

**Previous approach (dump processing):**
- ❌ Requires downloading 130GB+ dump file
- ❌ Takes 2-8 hours to download
- ❌ Requires 30-60 minutes processing time
- ❌ Total: 3-9 hours

**Previous approach (direct SPARQL):**
- ❌ Timeouts on large queries
- ❌ Rate limiting issues
- ❌ Inconsistent results
- ❌ Hard to resume if interrupted

**New approach (decade-by-decade):**
- ✅ No large downloads needed
- ✅ Queries in small chunks (10 years at a time)
- ✅ Automatic retry on errors
- ✅ Progress saved continuously
- ✅ Can resume if interrupted
- ✅ Total time: 20-60 minutes depending on range

## Quick Start

### 1. Analyze Current Gaps

First, see what's missing in your database:

```bash
node scripts/analyzeGaps.cjs
```

This will show:
- Centuries with low coverage
- Domain distribution
- Geographic distribution
- Suggested fetch commands

### 2. Fetch Missing Data

Based on the gap analysis, run targeted queries:

```bash
# Fetch a specific century
node scripts/fetchWikidataByDecade.cjs --century 18 --min-sitelinks 60

# Fetch a specific range
node scripts/fetchWikidataByDecade.cjs --start-year 1500 --end-year 1600 --min-sitelinks 50

# Fetch everything (recommended!)
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60
```

### 3. Verify Results

Check the results:

```bash
node scripts/consistencyCheck.cjs
node scripts/reportCenturyCoverage.cjs
```

## Detailed Usage

### Command Line Options

```bash
node scripts/fetchWikidataByDecade.cjs [options]
```

**Time Range Options:**
- `--start-year YEAR` - Start year (e.g., 1800)
- `--end-year YEAR` - End year (e.g., 1900)
- `--century NUM` - Shorthand for a century (e.g., 19 = 1801-1900)
- `--all` - Process all years (-650 to 2024)

**Quality Options:**
- `--min-sitelinks NUM` - Minimum Wikipedia articles (default: 60)
  - Higher = more famous people, fewer results
  - Lower = more people, but less well-known
  - Recommended: 60 for modern, 40 for ancient

**Performance Options:**
- `--decade-size NUM` - Years per query (default: 10)
  - Smaller = more queries but less likely to timeout
  - Larger = fewer queries but might timeout
- `--delay MS` - Delay between queries in ms (default: 1000)
  - Increase if you get rate limited
  - Decrease to speed up (but be careful!)

**Safety Options:**
- `--dry-run` - Show what would be fetched without saving
- `--verbose` - Show detailed progress

### Examples

**Example 1: Test with a small range**
```bash
# Dry run to see what you'd get
node scripts/fetchWikidataByDecade.cjs --start-year 1900 --end-year 1910 --min-sitelinks 80 --dry-run
```

**Example 2: Fill ancient period gaps**
```bash
# Ancient period with lower threshold
node scripts/fetchWikidataByDecade.cjs --start-year -600 --end-year 0 --min-sitelinks 40
```

**Example 3: High-quality modern figures**
```bash
# 20th century, only very famous
node scripts/fetchWikidataByDecade.cjs --century 20 --min-sitelinks 100
```

**Example 4: Complete database expansion**
```bash
# Fetch everything with good quality threshold
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60
```

This will:
- Query Wikidata decade by decade from -650 to 2024
- Take about 30-60 minutes
- Add thousands of important historical figures
- Save progress every 10 decades

## Understanding the Results

### Progress Output

```
📅 1800 - 1809              ... ✨ 45 found, 12 new
📅 1810 - 1819              ...    38 found, 0 new
```

- **found** = Total people matching criteria in this decade
- **new** = People not already in database
- **✨** = New people were added

### Summary Statistics

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ New people found: 1,234
📦 Total fetched: 2,456
⏭️  Already in database: 1,222
❌ Errors: 0
```

### Progress Files

The script saves two files:

1. **`scripts/fetch_progress.json`** - Detailed progress log
   - All decades processed
   - Errors encountered
   - Timing information

2. **`scripts/gap_analysis.json`** - Gap analysis report
   - Century-by-century breakdown
   - Domain distribution
   - Geographic distribution

## Recommended Workflow

### Initial Expansion (Starting from ~2,350 people)

```bash
# 1. Analyze what's missing
node scripts/analyzeGaps.cjs

# 2. Fetch everything with moderate threshold
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60

# Expected result: ~3,000-4,000 people

# 3. Verify data quality
node scripts/consistencyCheck.cjs
node scripts/checkDuplicates.cjs

# 4. Remove any duplicates
node scripts/removeDuplicates.cjs

# 5. Check coverage
node scripts/reportCenturyCoverage.cjs
```

### Second Pass (Lowering Threshold)

```bash
# 6. Analyze gaps again
node scripts/analyzeGaps.cjs

# 7. Fill remaining gaps with lower threshold
node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 50

# Expected result: ~5,000-6,000 people

# 8. Verify again
node scripts/consistencyCheck.cjs
```

### Targeted Expansion (Specific Periods)

```bash
# Focus on specific weak areas identified by gap analysis

# Ancient period (lower threshold)
node scripts/fetchWikidataByDecade.cjs --start-year -600 --end-year 0 --min-sitelinks 40

# Medieval period
node scripts/fetchWikidataByDecade.cjs --start-year 500 --end-year 1500 --min-sitelinks 45

# Modern period (higher threshold)
node scripts/fetchWikidataByDecade.cjs --start-year 1800 --end-year 2000 --min-sitelinks 70
```

## Sitelink Threshold Guidelines

The `--min-sitelinks` parameter controls quality vs. quantity:

| Threshold | Description | Expected Results | Use Case |
|-----------|-------------|------------------|----------|
| **100+** | Globally famous | ~1,000 people | Core famous figures only |
| **80** | Very well-known | ~2,000 people | High quality dataset |
| **60** | Well-known | ~3,500 people | **Recommended default** |
| **50** | Notable | ~5,000 people | Good balance |
| **40** | Significant | ~8,000 people | Ancient periods, specialists |
| **30** | Important | ~15,000 people | Very comprehensive |
| **20** | Historical | ~30,000+ people | Too many for visualization |

**Recommendations by era:**
- Ancient (-650 to 0): 40-50 sitelinks
- Medieval (1-1500): 45-55 sitelinks
- Early Modern (1500-1800): 50-60 sitelinks
- Modern (1800-2000): 60-80 sitelinks
- Contemporary (2000+): 80-100 sitelinks

## Troubleshooting

### Problem: Timeouts

**Solution 1:** Reduce decade size
```bash
node scripts/fetchWikidataByDecade.cjs --all --decade-size 5 --min-sitelinks 60
```

**Solution 2:** Increase delay between queries
```bash
node scripts/fetchWikidataByDecade.cjs --all --delay 2000 --min-sitelinks 60
```

### Problem: Rate Limiting (429 errors)

**Solution:** Increase delay and reduce chunk size
```bash
node scripts/fetchWikidataByDecade.cjs --all --delay 3000 --decade-size 5 --min-sitelinks 60
```

### Problem: Too Many Results in One Decade

Some decades (especially 19th-20th century) have many notable people.

**Solution:** The script has a LIMIT of 1000 per decade. If you hit this:
1. Increase `--min-sitelinks` threshold
2. Or process that century separately with higher threshold
3. Or modify the LIMIT in the script

### Problem: Script Interrupted

**Solution:** Just run it again! The script:
- Checks existing database
- Skips people already present
- Continues from where it left off

### Problem: Duplicates After Multiple Runs

**Solution:** Run deduplication
```bash
node scripts/checkDuplicates.cjs
node scripts/removeDuplicates.cjs
```

## Performance Expectations

### Speed

- **Per decade:** ~1-3 seconds (including delay)
- **Per century:** ~10-30 seconds
- **Full range (-650 to 2024):** ~30-60 minutes
- **Ancient only (-650 to 0):** ~5-10 minutes
- **Modern only (1800-2024):** ~3-5 minutes

### Results

Starting from ~2,350 people:

| Threshold | Expected Total | Time | Quality |
|-----------|---------------|------|---------|
| 80 | ~2,800 | 20 min | Excellent |
| 60 | ~4,000 | 40 min | Very Good |
| 50 | ~6,000 | 60 min | Good |
| 40 | ~10,000 | 90 min | Adequate |

## Advanced Usage

### Custom Occupation Mapping

Edit `OCCUPATION_TO_DOMAIN` in `fetchWikidataByDecade.cjs` to add more occupations:

```javascript
const OCCUPATION_TO_DOMAIN = {
  'Q901': 'Science',           // scientist
  'Q36180': 'Literature',      // writer
  // Add your own:
  'Q1234567': 'YourDomain',    // your occupation
};
```

Find occupation QIDs at: https://www.wikidata.org/

### Custom Country Mapping

Edit `COUNTRY_TO_REGION` to add more countries or change region codes.

### Modify Query Logic

The SPARQL query in `fetchDecade()` can be customized:

```javascript
// Add more filters
FILTER(?sitelinks >= ${minSitelinks})
FILTER(YEAR(?death) - YEAR(?birth) >= 25)  # Minimum lifespan

// Add more fields
OPTIONAL { ?person wdt:P18 ?image. }  # Image
OPTIONAL { ?person wdt:P19 ?birthPlace. }  # Birth place
```

## Comparison with Other Methods

### Dump Processing vs. Decade Fetching

| Aspect | Dump Processing | Decade Fetching |
|--------|----------------|-----------------|
| **Download** | 130GB | None |
| **Setup Time** | 2-8 hours | 0 minutes |
| **Processing** | 30-60 min | 30-60 min |
| **Total Time** | 3-9 hours | 30-60 min |
| **Flexibility** | Low | High |
| **Resumable** | No | Yes |
| **Internet** | One-time | Continuous |
| **Disk Space** | 130GB+ | <1MB |

**Recommendation:** Use decade fetching unless you need to process offline or want the complete Wikidata dump for other purposes.

### Direct SPARQL vs. Decade Fetching

| Aspect | Direct SPARQL | Decade Fetching |
|--------|--------------|-----------------|
| **Timeouts** | Frequent | Rare |
| **Rate Limits** | Common | Manageable |
| **Progress** | Lost on error | Saved |
| **Resumable** | No | Yes |
| **Control** | Limited | High |

**Recommendation:** Always use decade fetching for large queries.

## Next Steps

After expanding your database:

1. **Build Relations** - Use existing relation-building scripts
2. **Add Domain Chains** - Create new domain chains for visualization
3. **Verify Quality** - Run consistency checks
4. **Update Statistics** - Regenerate DATA_STATISTICS.md

See `scripts/README.md` for more tools!

## Support

If you encounter issues:

1. Check `scripts/fetch_progress.json` for error details
2. Try with `--dry-run` first
3. Reduce `--decade-size` if timeouts occur
4. Increase `--delay` if rate limited
5. Check Wikidata status: https://www.wikidata.org/

---

**Last Updated:** October 2025  
**Maintained by:** Zeitkette Development Team


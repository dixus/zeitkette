# Wikidata Dump Processing Guide

## Why Use Dumps Instead of API?

✅ **Advantages:**
- **Much faster** - Process locally, no rate limits
- **More reliable** - No timeouts, 429 errors, or server issues
- **Complete control** - Extract exactly what you need
- **Better quality** - Can implement complex filters

❌ **API Problems:**
- Rate limited (1 request/second)
- Frequent timeouts
- Inconsistent results
- Would take ~40 hours for full fetch

## Download the Dump

**Source:** https://dumps.wikimedia.org/wikidatawiki/entities/

```bash
# Option 1: Direct download (slow but reliable)
wget https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2

# Option 2: Torrent (faster, recommended)
# Get latest torrent from: https://academictorrents.com/
# Search for "wikidata json"

# File size: ~130 GB compressed, ~1.3 TB uncompressed
```

## Process the Dump

```bash
# Process directly from .bz2 (recommended - saves disk space)
node scripts/processWikidataDump.js latest-all.json.bz2

# Or decompress first (if you have space)
bzip2 -dk latest-all.json.bz2
node scripts/processWikidataDump.js latest-all.json
```

## What Gets Extracted

**Filters:**
- ✅ Humans (Q5)
- ✅ With birth & death dates
- ✅ 80+ Wikipedia articles (sitelinks)
- ✅ Lived at least 25 years
- ✅ Born between -650 (ancient Greece) and 2024

**Data extracted:**
- Name (German/English label)
- Birth year
- Death year
- QID (Wikidata ID)
- Domains (Science, Art, Philosophy, etc.)
- Sitelinks count (fame metric)

**Expected result:** ~1500-2000 people

## Time Estimates

- **Download:** 2-8 hours (depends on connection)
- **Processing:** 30-60 minutes
- **Total:** ~3-9 hours (mostly download time)

## Merge with Manual Additions

After processing, merge with curated additions:

```bash
node scripts/mergePeople.js
```

This ensures critical people like Heisenberg are included even if they're in the 79-sitelink range.

## Alternative: Quick Start

If you want to start immediately without waiting for the dump:

```bash
# Use the manual critical additions
node scripts/addCriticalPeople.js
```

This adds 100+ critical people to your existing database right now!


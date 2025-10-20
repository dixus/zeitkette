/**
 * Analyze gaps in the person database
 * 
 * This script identifies:
 * - Centuries with low coverage
 * - Domains with few representatives
 * - Regions underrepresented
 * - Specific important people who might be missing
 * 
 * Usage:
 *   node scripts/analyzeGaps.cjs
 */

const fs = require('fs');

function loadPeople() {
  return JSON.parse(fs.readFileSync('./public/people.json', 'utf8'));
}

function analyzeCenturies(people) {
  const centuries = new Map();
  
  for (const person of people) {
    const century = Math.floor(person.born / 100);
    if (!centuries.has(century)) {
      centuries.set(century, []);
    }
    centuries.get(century).push(person);
  }
  
  const sorted = Array.from(centuries.entries())
    .sort((a, b) => a[0] - b[0]);
  
  return sorted;
}

function analyzeDomains(people) {
  const domains = new Map();
  
  for (const person of people) {
    for (const domain of person.domains) {
      if (!domains.has(domain)) {
        domains.set(domain, []);
      }
      domains.get(domain).push(person);
    }
  }
  
  const sorted = Array.from(domains.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  return sorted;
}

function analyzeRegions(people) {
  const regions = new Map();
  
  for (const person of people) {
    const region = person.region || 'Unknown';
    if (!regions.has(region)) {
      regions.set(region, []);
    }
    regions.get(region).push(person);
  }
  
  const sorted = Array.from(regions.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  return sorted;
}

function analyzeSitelinkDistribution(people) {
  const ranges = {
    '200+': 0,
    '150-199': 0,
    '100-149': 0,
    '80-99': 0,
    '60-79': 0,
    '40-59': 0,
    '20-39': 0,
    '<20': 0
  };
  
  for (const person of people) {
    const sl = person.sitelinks || 0;
    if (sl >= 200) ranges['200+']++;
    else if (sl >= 150) ranges['150-199']++;
    else if (sl >= 100) ranges['100-149']++;
    else if (sl >= 80) ranges['80-99']++;
    else if (sl >= 60) ranges['60-79']++;
    else if (sl >= 40) ranges['40-59']++;
    else if (sl >= 20) ranges['20-39']++;
    else ranges['<20']++;
  }
  
  return ranges;
}

function identifyGaps(centuries) {
  const gaps = [];
  
  for (const [century, people] of centuries) {
    const count = people.length;
    const centuryLabel = century < 0 
      ? `${Math.abs(century)}th century BCE`
      : `${century + 1}th century CE`;
    
    let status = 'Good';
    let priority = 'Low';
    
    if (count < 10) {
      status = 'Critical';
      priority = 'High';
    } else if (count < 20) {
      status = 'Low';
      priority = 'Medium';
    } else if (count < 30) {
      status = 'Moderate';
      priority = 'Low';
    }
    
    if (status !== 'Good') {
      gaps.push({
        century,
        centuryLabel,
        count,
        status,
        priority,
        startYear: century * 100,
        endYear: century * 100 + 99
      });
    }
  }
  
  return gaps.sort((a, b) => a.count - b.count);
}

function suggestQueries(gaps) {
  const suggestions = [];
  
  // Group consecutive centuries
  let currentGroup = null;
  
  for (const gap of gaps) {
    if (!currentGroup) {
      currentGroup = { ...gap, endYear: gap.endYear };
    } else if (gap.century === currentGroup.century + 1) {
      // Extend current group
      currentGroup.endYear = gap.endYear;
      currentGroup.count += gap.count;
    } else {
      // Save current group and start new one
      suggestions.push(currentGroup);
      currentGroup = { ...gap };
    }
  }
  
  if (currentGroup) {
    suggestions.push(currentGroup);
  }
  
  return suggestions;
}

function main() {
  console.log('🔍 Zeitkette Database Gap Analysis');
  console.log('━'.repeat(80));
  console.log();
  
  const people = loadPeople();
  console.log(`📊 Total people in database: ${people.length}`);
  console.log();
  
  // Century analysis
  console.log('📅 CENTURY COVERAGE');
  console.log('━'.repeat(80));
  const centuries = analyzeCenturies(people);
  
  const gaps = identifyGaps(centuries);
  
  if (gaps.length > 0) {
    console.log(`\n⚠️  Found ${gaps.length} centuries with low coverage:\n`);
    
    for (const gap of gaps.slice(0, 20)) {
      const icon = gap.priority === 'High' ? '🔴' : gap.priority === 'Medium' ? '🟡' : '🟢';
      console.log(`${icon} ${gap.centuryLabel.padEnd(25)} ${gap.count.toString().padStart(3)} people`);
    }
  } else {
    console.log('✅ All centuries have good coverage!');
  }
  
  // Domain analysis
  console.log('\n\n🎯 DOMAIN DISTRIBUTION');
  console.log('━'.repeat(80));
  const domains = analyzeDomains(people);
  
  for (const [domain, domainPeople] of domains) {
    const percentage = ((domainPeople.length / people.length) * 100).toFixed(1);
    console.log(`${domain.padEnd(15)} ${domainPeople.length.toString().padStart(5)} (${percentage}%)`);
  }
  
  // Region analysis
  console.log('\n\n🌍 GEOGRAPHIC DISTRIBUTION (Top 20)');
  console.log('━'.repeat(80));
  const regions = analyzeRegions(people);
  
  for (const [region, regionPeople] of regions.slice(0, 20)) {
    const percentage = ((regionPeople.length / people.length) * 100).toFixed(1);
    console.log(`${region.padEnd(15)} ${regionPeople.length.toString().padStart(5)} (${percentage}%)`);
  }
  
  // Sitelink distribution
  console.log('\n\n⭐ FAME DISTRIBUTION (by sitelinks)');
  console.log('━'.repeat(80));
  const sitelinks = analyzeSitelinkDistribution(people);
  
  for (const [range, count] of Object.entries(sitelinks)) {
    const percentage = ((count / people.length) * 100).toFixed(1);
    console.log(`${range.padEnd(15)} ${count.toString().padStart(5)} (${percentage}%)`);
  }
  
  // Suggestions
  console.log('\n\n💡 SUGGESTED FETCH COMMANDS');
  console.log('━'.repeat(80));
  
  if (gaps.length > 0) {
    const suggestions = suggestQueries(gaps.filter(g => g.priority === 'High' || g.priority === 'Medium'));
    
    console.log('\nTo fill the most critical gaps, run these commands:\n');
    
    for (const suggestion of suggestions.slice(0, 10)) {
      const startYear = suggestion.startYear;
      const endYear = suggestion.endYear;
      
      // Suggest different sitelink thresholds based on era
      let minSitelinks = 60;
      if (startYear < 0) minSitelinks = 40; // Ancient: lower threshold
      else if (startYear < 1500) minSitelinks = 50; // Medieval: medium threshold
      else if (startYear < 1800) minSitelinks = 55; // Early modern: medium-high
      
      console.log(`# ${suggestion.centuryLabel} (currently ${suggestion.count} people)`);
      console.log(`node scripts/fetchWikidataByDecade.cjs --start-year ${startYear} --end-year ${endYear} --min-sitelinks ${minSitelinks}`);
      console.log();
    }
    
    console.log('\nOr fetch everything at once (will take 30-60 minutes):');
    console.log('node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 60');
  } else {
    console.log('\n✅ Coverage looks good! Consider lowering sitelink threshold to add more people:');
    console.log('node scripts/fetchWikidataByDecade.cjs --all --min-sitelinks 50');
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    totalPeople: people.length,
    centuries: centuries.map(([century, centuryPeople]) => ({
      century,
      count: centuryPeople.length,
      avgSitelinks: Math.round(centuryPeople.reduce((sum, p) => sum + (p.sitelinks || 0), 0) / centuryPeople.length)
    })),
    gaps: gaps,
    domains: domains.map(([domain, domainPeople]) => ({
      domain,
      count: domainPeople.length,
      percentage: ((domainPeople.length / people.length) * 100).toFixed(1)
    })),
    regions: regions.map(([region, regionPeople]) => ({
      region,
      count: regionPeople.length,
      percentage: ((regionPeople.length / people.length) * 100).toFixed(1)
    })),
    sitelinkDistribution: sitelinks
  };
  
  fs.writeFileSync('./scripts/gap_analysis.json', JSON.stringify(report, null, 2));
  console.log('\n\n📄 Detailed report saved to scripts/gap_analysis.json');
  console.log();
}

main();


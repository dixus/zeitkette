import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowRight, Clock, Users, Sparkles, RotateCcw, List, BarChart3, Image as ImageIcon, Search, Network, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadAllData } from './dataLoader';
import * as d3 from 'd3';

// Extracted utilities
import { THIS_YEAR, fetchPersonImage, getOccupation, chainFrom, findPathBetween, buildChainThroughWaypoints } from './utils';

// Extracted hooks
import { usePersonImage, useKeyboardShortcuts } from './hooks';

// Extracted components
import { PersonAvatar, TimelineView } from './components';

// All utility functions, hooks, and small components have been extracted to separate files
// See src/utils, src/hooks, and src/components folders

// Removed duplicate TimelineView definition - now imported from ./components/views/TimelineView.jsx

// ✅ All chain algorithms (findPathBetween, buildChainThroughWaypoints, chainFrom) 
// are now imported from ./utils/chainAlgorithm.js

// Network View Component - Force-Directed Graph
function NetworkView({ chain, people, onPersonClick, hoveredQid, setHoveredQid }) {
  const { t } = useTranslation();
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [showAllConnections, setShowAllConnections] = useState(true);
  const [stats, setStats] = useState({ totalNodes: chain.length, totalLinks: 0, nearbyPeople: 0 });
  
  useEffect(() => {
    if (!svgRef.current || chain.length === 0) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    const width = dimensions.width;
    const height = dimensions.height;
    
    // Create nodes from chain
    const chainQids = new Set(chain.map(p => p.qid));
    const chainQidToIndex = new Map(chain.map((p, i) => [p.qid, i]));
    
    // Create graph data - start with chain members
    const nodes = chain.map(p => ({
      ...p,
      inChain: true,
      chainIndex: chainQidToIndex.get(p.qid),
      color: `hsl(${250 + (chainQidToIndex.get(p.qid) / chain.length) * 60}, 70%, 60%)`
    }));
    
    // Add nearby people who overlap with chain members (to show the network)
    const nearbyPeople = [];
    if (showAllConnections && people.length > 0) {
      people.forEach(p => {
        if (chainQids.has(p.qid)) return; // Skip if already in chain
        if ((p.sitelinks || 0) < 140) return; // Only show famous people
        
        // Check if this person overlaps with ANY chain member
        const overlapsWithChain = chain.some(chainPerson => {
          const p1End = chainPerson.died === 9999 ? THIS_YEAR : chainPerson.died;
          const p2End = p.died === 9999 ? THIS_YEAR : p.died;
          const overlap = Math.min(p1End, p2End) - Math.max(chainPerson.born, p.born);
          return overlap > 20; // At least 20 years overlap
        });
        
        if (overlapsWithChain && nearbyPeople.length < 30) { // Limit to 30 extra nodes
          nearbyPeople.push(p);
        }
      });
      
      // Add nearby people as nodes
      nearbyPeople.forEach(p => {
        nodes.push({
          ...p,
          inChain: false,
          color: '#94a3b8' // Gray color for non-chain people
        });
      });
    }
    
    const links = [];
    
    // Create links between ALL people who overlap in time (not just chain)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const p1 = nodes[i];
        const p2 = nodes[j];
        const p1End = p1.died === 9999 ? THIS_YEAR : p1.died;
        const p2End = p2.died === 9999 ? THIS_YEAR : p2.died;
        const overlap = Math.min(p1End, p2End) - Math.max(p1.born, p2.born);
        
        if (overlap > 20) { // They overlapped for at least 20 years
          const bothInChain = p1.inChain && p2.inChain;
          const isConsecutive = bothInChain && Math.abs((p1.chainIndex || 0) - (p2.chainIndex || 0)) === 1;
          
          links.push({
            source: p1.qid,
            target: p2.qid,
            overlap,
            strength: isConsecutive ? 2 : 0.3,
            type: isConsecutive ? 'chain' : 'connection'
          });
        }
      }
    }
    
    // Update stats
    setStats({
      totalNodes: nodes.length,
      totalLinks: links.length,
      nearbyPeople: nearbyPeople.length
    });
    
    // Setup D3 force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.qid)
        .distance(d => d.type === 'chain' ? 150 : 200)
        .strength(d => d.type === 'chain' ? 0.8 : 0.3))
      .force('charge', d3.forceManyBody()
        .strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    // Add zoom behavior
    const g = svg.append('g');
    
    svg.call(d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));
    
    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.type === 'chain' ? '#8b5cf6' : '#e2e8f0')
      .attr('stroke-width', d => d.type === 'chain' ? 4 : 1)
      .attr('stroke-opacity', d => d.type === 'chain' ? 0.8 : 0.2);
    
    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(drag(simulation));
    
    // Load images for all nodes
    nodes.forEach(async (d) => {
      if (d.qid && !d.imageUrl) {
        const url = await fetchPersonImage(d.qid);
        d.imageUrl = url;
        // Update the node with image and fade in
        if (url) {
          node.filter(n => n.qid === d.qid)
            .select('image')
            .attr('href', url)
            .transition()
            .duration(300)
            .attr('opacity', 1);
        }
      }
    });
    
    // Node background circles
    node.append('circle')
      .attr('r', d => d.inChain ? 30 : 15)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', d => d.inChain ? 3 : 2)
      .attr('opacity', d => d.inChain ? 1 : 0.6)
      .on('mouseover', function(event, d) {
        setHoveredQid(d.qid);
        d3.select(this.parentNode)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', d => d.inChain ? 40 : 22);
        d3.select(this.parentNode)
          .select('image')
          .transition()
          .duration(200)
          .attr('width', d => d.inChain ? 76 : 40)
          .attr('height', d => d.inChain ? 76 : 40)
          .attr('x', d => d.inChain ? -38 : -20)
          .attr('y', d => d.inChain ? -38 : -20);
      })
      .on('mouseout', function(event, d) {
        setHoveredQid(null);
        d3.select(this.parentNode)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', d => d.inChain ? 30 : 15);
        d3.select(this.parentNode)
          .select('image')
          .transition()
          .duration(200)
          .attr('width', d => d.inChain ? 56 : 26)
          .attr('height', d => d.inChain ? 56 : 26)
          .attr('x', d => d.inChain ? -28 : -13)
          .attr('y', d => d.inChain ? -28 : -13);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        onPersonClick(d);
      });
    
    // Clip path for circular images
    const defs = svg.append('defs');
    nodes.forEach((d, i) => {
      defs.append('clipPath')
        .attr('id', `clip-${d.qid}`)
        .append('circle')
        .attr('r', d.inChain ? 28 : 13)
        .attr('cx', 0)
        .attr('cy', 0);
    });
    
    // Avatar images
    node.append('image')
      .attr('width', d => d.inChain ? 56 : 26)
      .attr('height', d => d.inChain ? 56 : 26)
      .attr('x', d => d.inChain ? -28 : -13)
      .attr('y', d => d.inChain ? -28 : -13)
      .attr('href', d => d.imageUrl || '')
      .attr('clip-path', d => `url(#clip-${d.qid})`)
      .attr('opacity', d => d.imageUrl ? 1 : 0)
      .style('pointer-events', 'none');
    
    // Node labels
    node.append('text')
      .text(d => d.name.split(' ').pop()) // Last name
      .attr('text-anchor', 'middle')
      .attr('dy', 50)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
      .attr('pointer-events', 'none');
    
    // Chain number badges
    node.filter(d => d.inChain)
      .append('text')
      .text((d, i) => chain.length - i)
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');
    
    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag behavior
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
    
    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [chain, dimensions, onPersonClick, setHoveredQid, showAllConnections, people]);
  
  if (chain.length === 0) return null;
  
  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 mb-1">{t('network.title')}</h3>
          <p className="text-xs text-neutral-600">
            {t('network.description')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <span className="px-2 py-1 bg-purple-100 rounded-full font-medium">{t('network.inChain', { count: chain.length })}</span>
          {stats.nearbyPeople > 0 && (
            <span className="px-2 py-1 bg-neutral-100 rounded-full font-medium">{t('network.contemporaries', { count: stats.nearbyPeople })}</span>
          )}
          <span className="px-2 py-1 bg-blue-100 rounded-full font-medium">{t('network.connections', { count: stats.totalLinks })}</span>
        </div>
      </div>
      
      {/* Graph Container */}
      <div className="glass-strong rounded-2xl p-6 overflow-hidden">
        <svg ref={svgRef} style={{ width: '100%', height: '800px' }} />
      </div>
      
      {/* Legend */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 border-2 border-white flex items-center justify-center text-white font-bold text-xs">1</div>
            <span className="text-neutral-700 font-medium">{t('network.legend.personInChain')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-400 border-2 border-white opacity-60"></div>
            <span className="text-neutral-700 font-medium">{t('network.legend.contemporary')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-purple-600 rounded"></div>
            <span className="text-neutral-700 font-medium">{t('network.legend.chainConnection')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-neutral-300"></div>
            <span className="text-neutral-700 font-medium">{t('network.legend.timeOverlap')}</span>
          </div>
          <div className="text-neutral-600 ml-auto">
            {t('network.legend.tip')}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { t, i18n } = useTranslation();
  
  const [people, setPeople] = useState([]);
  const [relations, setRelations] = useState({});
  const [loading, setLoading] = useState(true);
  const [targetPerson, setTargetPerson] = useState('Leonardo da Vinci');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [hoveredQid, setHoveredQid] = useState(null);
  const [minOverlapYears, setMinOverlapYears] = useState(20); // Minimum overlap for realistic connections
  const [minFame, setMinFame] = useState(100); // Minimum sitelinks (fame level)
  const [expandedGap, setExpandedGap] = useState(null); // Which gap is expanded (index)
  const [pinnedWaypoints, setPinnedWaypoints] = useState([]); // Array of person names to route through
  const [viewMode, setViewMode] = useState('list'); // 'list', 'timeline', or 'network'
  const [timelineZoom, setTimelineZoom] = useState(1); // Timeline zoom level
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const [showSearch, setShowSearch] = useState(false); // Show search modal
  const [chainMode, setChainMode] = useState('toToday'); // 'toToday' or 'between'
  const [startPerson, setStartPerson] = useState('Leonardo da Vinci'); // For 'between' mode
  const [endPerson, setEndPerson] = useState('Albert Einstein'); // For 'between' mode
  const [showYearExplorer, setShowYearExplorer] = useState(false); // Show year explorer modal
  const [explorerYear, setExplorerYear] = useState(1500); // Year to explore
  const [explorerDomain, setExplorerDomain] = useState('all'); // Domain filter
  const [explorerFame, setExplorerFame] = useState(140); // Fame filter for explorer

  useEffect(() => {
    loadAllData().then(({ people, relations }) => {
      setPeople(people);
      setRelations(relations);
      setLoading(false);
    });
  }, []);

  // Build chain based on mode (with optional waypoints)
  const chain = useMemo(() => {
    if (!people.length) return [];
    
    if (chainMode === 'toToday') {
      if (!targetPerson) return [];
      // Use waypoints if specified
      return buildChainThroughWaypoints(targetPerson, pinnedWaypoints, null, people, minOverlapYears, minFame);
    } else {
      // 'between' mode
      if (!startPerson || !endPerson) return [];
      // Use waypoints if specified
      return buildChainThroughWaypoints(startPerson, pinnedWaypoints, endPerson, people, minOverlapYears, minFame);
    }
  }, [people, chainMode, targetPerson, startPerson, endPerson, pinnedWaypoints, minOverlapYears, minFame]);

  // Search filtered people
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return people
      .filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.domains?.some(d => d.toLowerCase().includes(query))
      )
      .slice(0, 20);
  }, [searchQuery, people]);

  // People alive in explorer year
  const explorerPeople = useMemo(() => {
    if (!showYearExplorer || !people.length) return [];
    
    return people
      .filter(p => {
        // Filter by year (person was alive during this year)
        if (p.born > explorerYear) return false;
        const pDied = p.died === 9999 ? THIS_YEAR : p.died;
        if (pDied < explorerYear) return false;
        
        // Filter by fame
        if ((p.sitelinks || 0) < explorerFame) return false;
        
        // Filter by domain
        if (explorerDomain !== 'all') {
          if (!p.domains || !p.domains.includes(explorerDomain)) return false;
        }
        
        return true;
      })
      .sort((a, b) => (b.sitelinks || 0) - (a.sitelinks || 0))
      .slice(0, 50); // Limit to 50 for performance
  }, [people, explorerYear, explorerDomain, explorerFame, showYearExplorer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case '/':
          e.preventDefault();
          setShowSearch(true);
          break;
        case 'y':
        case 'Y':
          e.preventDefault();
          setShowYearExplorer(true);
          break;
        case 'Escape':
          if (showSearch) setShowSearch(false);
          if (showYearExplorer) setShowYearExplorer(false);
          if (selectedPerson) setSelectedPerson(null);
          if (expandedGap !== null) setExpandedGap(null);
          break;
        case 'l':
          setViewMode('list');
          break;
        case 't':
          setViewMode('timeline');
          break;
        case 'n':
          setViewMode('network');
          break;
        case 'r':
          setShowLanding(true);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSearch, showYearExplorer, selectedPerson]);

  // Calculate metrics
  const totalYears = chain.length > 0 
    ? (chain[chain.length - 1].died === 9999 ? THIS_YEAR : chain[chain.length - 1].died) - chain[0].born
    : 0;
  
  const avgLifespan = 75;
  const lifetimeCount = Math.floor(totalYears / avgLifespan);

  // Fun Facts Generator
  const funFacts = useMemo(() => {
    if (chain.length < 2) return [];
    
    const facts = [];
    
    // Fact 1: Total timespan
    if (chainMode === 'toToday') {
      const personName = typeof targetPerson === 'string' ? targetPerson : targetPerson?.name;
      facts.push({
        icon: '⏳',
        text: t('funFacts.lifetimes', { count: lifetimeCount, person: personName }),
        type: 'primary'
      });
    } else {
      const startName = typeof startPerson === 'string' ? startPerson : startPerson?.name;
      const endName = typeof endPerson === 'string' ? endPerson : endPerson?.name;
      facts.push({
        icon: '🔗',
        text: t('funFacts.stepsApart', { start: startName, end: endName, count: chain.length }),
        type: 'primary'
      });
    }
    
    // Fact 2: Longest overlap
    let maxOverlap = 0;
    let overlapPair = null;
    for (let i = 0; i < chain.length - 1; i++) {
      const p1 = chain[i];
      const p2 = chain[i + 1];
      const p1End = p1.died === 9999 ? THIS_YEAR : p1.died;
      const p2End = p2.died === 9999 ? THIS_YEAR : p2.died;
      const overlap = Math.min(p1End, p2End) - Math.max(p1.born, p2.born);
      if (overlap > maxOverlap && overlap > 0) {
        maxOverlap = overlap;
        overlapPair = [p1, p2];
      }
    }
    if (overlapPair && maxOverlap > 30) {
      facts.push({
        icon: '🤝',
        text: t('funFacts.overlap', { person1: overlapPair[0].name, person2: overlapPair[1].name, years: maxOverlap }),
        type: 'info'
      });
    }
    
    // Fact 3: Biggest time gap
    let maxGap = 0;
    let gapPair = null;
    for (let i = 0; i < chain.length - 1; i++) {
      const p1 = chain[i];
      const p2 = chain[i + 1];
      const p1End = p1.died === 9999 ? THIS_YEAR : p1.died;
      const gap = Math.abs(p2.born - p1End);
      if (gap > maxGap && gap > 0) {
        maxGap = gap;
        gapPair = [p1, p2];
      }
    }
    if (gapPair && maxGap > 50) {
      facts.push({
        icon: '⚡',
        text: t('funFacts.gap', { years: maxGap, person1: gapPair[0].name, person2: gapPair[1].name }),
        type: 'warning'
      });
    }
    
    // Fact 4: Oldest person
    const oldest = chain.reduce((old, p) => {
      const age = (p.died === 9999 ? THIS_YEAR : p.died) - p.born;
      const oldAge = (old.died === 9999 ? THIS_YEAR : old.died) - old.born;
      return age > oldAge ? p : old;
    });
    const oldestAge = (oldest.died === 9999 ? THIS_YEAR : oldest.died) - oldest.born;
    if (oldestAge > 85) {
      facts.push({
        icon: '🎂',
        text: t('funFacts.longevity', { person: oldest.name, age: oldestAge }),
        type: 'success'
      });
    }
    
    // Fact 5: Domain diversity
    const allDomains = new Set(chain.flatMap(p => p.domains || []));
    if (allDomains.size >= 4) {
      facts.push({
        icon: '🌟',
        text: t('funFacts.diversity', { count: allDomains.size, domains: Array.from(allDomains).slice(0, 3).join(', ') }),
        type: 'info'
      });
    }
    
    // Fact 6: Century span
    const centuries = Math.floor(totalYears / 100);
    if (centuries >= 5) {
      facts.push({
        icon: '📅',
        text: t('funFacts.centuries', { count: centuries }),
        type: 'info'
      });
    }
    
    return facts;
  }, [chain, chainMode, targetPerson, startPerson, endPerson, totalYears, lifetimeCount]);

  const popularTargets = useMemo(() => {
    if (!people.length) return [];
    return [
      { name: 'Leonardo da Vinci', era: 'Renaissance' },
      { name: 'Albert Einstein', era: 'Modern' },
      { name: 'Kleopatra', era: 'Antike' },
      { name: 'William Shakespeare', era: 'Renaissance' },
      { name: 'Isaac Newton', era: 'Aufklärung' },
      { name: 'Napoleon Bonaparte', era: 'Modern' },
    ].map(target => ({
      ...target,
      person: people.find(p => p.name === target.name)
    })).filter(t => t.person);
  }, [people]);

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl w-full">
          <div className="text-8xl mb-8 animate-bounce drop-shadow-lg">⏳</div>
          <div className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent animate-pulse mb-6">
            {t('app.name')}
          </div>
          <div className="text-2xl font-semibold text-neutral-700 mb-8">
            Loading time travel data...
          </div>
          
          {/* Loading Skeleton */}
          <div className="glass-strong rounded-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-300 to-fuchsia-300 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gradient-to-r from-purple-200 to-fuchsia-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-purple-200 to-fuchsia-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-300 to-purple-300 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gradient-to-r from-violet-200 to-purple-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-violet-200 to-purple-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-fuchsia-300 to-pink-300 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gradient-to-r from-fuchsia-200 to-pink-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-fuchsia-200 to-pink-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing Screen
  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4 md:p-6 relative">
        {/* Language Switcher - Top Right */}
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
          className="fixed top-4 right-4 z-50 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
          title={`Switch to ${i18n.language === 'en' ? 'Deutsch' : 'English'}`}
        >
          <Globe className="w-5 h-5" />
          <span className="text-lg">{i18n.language === 'en' ? '🇩🇪' : '🇬🇧'}</span>
        </button>
        
        <div className="max-w-4xl w-full">
          {/* Hero */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="text-5xl mb-4 animate-bounce drop-shadow-lg">⏳</div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
              {t('app.name')}
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 leading-tight">
              {t('landing.title')}
            </p>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
              {t('landing.subtitle')}
            </p>
          </div>

          {/* Mode Selection */}
          <div className="glass-strong rounded-3xl p-6 mb-6 shadow-2xl animate-scale-in">
            <h2 className="text-lg font-bold text-center mb-4 text-neutral-800">{t('landing.modeTitle')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setChainMode('toToday')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  chainMode === 'toToday'
                    ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white border-violet-600 shadow-lg scale-105'
                    : 'bg-white/90 text-neutral-800 border-neutral-300 hover:border-purple-400'
                }`}
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="font-bold text-sm">{t('landing.modeToToday')}</div>
                <div className="text-xs mt-1 opacity-90">{t('landing.modeToTodayDesc')}</div>
              </button>
              <button
                onClick={() => setChainMode('between')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  chainMode === 'between'
                    ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white border-violet-600 shadow-lg scale-105'
                    : 'bg-white/90 text-neutral-800 border-neutral-300 hover:border-purple-400'
                }`}
              >
                <div className="text-2xl mb-2">🔗</div>
                <div className="font-bold text-sm">{t('landing.modeBetween')}</div>
                <div className="text-xs mt-1 opacity-90">{t('landing.modeBetweenDesc')}</div>
              </button>
            </div>
          </div>

          {/* Target Selection */}
          <div className="glass-strong rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-neutral-800">
              <Sparkles className="w-6 h-6 text-yellow-500 drop-shadow" />
              {chainMode === 'toToday' ? t('landing.selectPerson') : t('landing.startPerson') + ' & ' + t('landing.endPerson')}
            </h2>
            
            {chainMode === 'toToday' ? (
              // Single person selector for "To Today" mode
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
              {popularTargets.map((target) => (
                <button
                  key={target.name}
                  onClick={() => {
                    setTargetPerson(target.name);
                    setShowLanding(false);
                  }}
                    className="group p-4 md:p-6 bg-white/90 backdrop-blur-sm rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white hover:border-purple-400 hover:-translate-y-1"
                  >
                    <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                      <PersonAvatar person={target.person} size="lg" className="rounded-2xl" />
                    </div>
                    <div className="font-bold text-sm mb-1 text-neutral-800">{target.name}</div>
                    <div className="text-xs text-purple-600 font-medium">{target.era}</div>
                </button>
              ))}
              </div>
            ) : (
              // Dual person selector for "Between" mode
              <div className="space-y-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Person */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border-2 border-violet-300">
                    <div className="text-sm font-bold mb-2 text-violet-700 flex items-center gap-2">
                      <span>🎯</span> {t('landing.startPerson')}
                    </div>
                    <select
                      value={typeof startPerson === 'string' ? startPerson : startPerson?.name}
                      onChange={(e) => setStartPerson(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-sm bg-white font-medium"
                    >
                      {people
                        .filter(p => p.died !== 9999)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(p => (
                          <option key={p.qid} value={p.name}>
                            {p.name} ({p.born}–{p.died})
                          </option>
                        ))}
                    </select>
            </div>

                  {/* End Person */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border-2 border-fuchsia-300">
                    <div className="text-sm font-bold mb-2 text-fuchsia-700 flex items-center gap-2">
                      <span>🏁</span> {t('landing.endPerson')}
                    </div>
                    <select
                      value={typeof endPerson === 'string' ? endPerson : endPerson?.name}
                      onChange={(e) => setEndPerson(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-neutral-300 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all text-sm bg-white font-medium"
                    >
                      {people
                        .filter(p => p.died !== 9999)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(p => (
                          <option key={p.qid} value={p.name}>
                            {p.name} ({p.born}–{p.died})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                
                {/* Quick suggestions for "Between" mode */}
            <div className="text-center">
                  <p className="text-xs text-neutral-600 mb-2 font-medium">{t('landing.quickConnections')}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => {
                        setStartPerson('Leonardo da Vinci');
                        setEndPerson('Albert Einstein');
                      }}
                      className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                    >
                      {t('landing.daVinciEinstein')}
                    </button>
                    <button
                      onClick={() => {
                        setStartPerson('Kleopatra');
                        setEndPerson('Napoleon Bonaparte');
                      }}
                      className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                    >
                      {t('landing.cleopatraNapoleon')}
                    </button>
                    <button
                      onClick={() => {
                        setStartPerson('Aristoteles');
                        setEndPerson('Isaac Newton');
                      }}
                      className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                    >
                      {t('landing.aristotleNewton')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {chainMode === 'toToday' && (
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-3 font-medium">{t('landing.orChooseFrom', { count: people.length })}</p>
              <select
                  value={typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}
                onChange={(e) => setTargetPerson(e.target.value)}
                  className="px-4 py-3 rounded-xl border-2 border-neutral-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all text-sm bg-white/90 backdrop-blur-sm font-medium"
              >
                {people
                  .filter(p => p.died !== 9999)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(p => (
                    <option key={p.qid} value={p.name}>
                      {p.name} ({p.born}–{p.died})
                    </option>
                  ))}
              </select>
            </div>
            )}
          </div>

          <button
            onClick={() => setShowLanding(false)}
            className="w-full py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-lg md:text-xl font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
          >
            <span className="drop-shadow-lg">
              {t('landing.goButton')}
            </span>
        </button>

          {/* Stats Preview */}
          <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4 text-center">
            <div className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">{people.length}</div>
              <div className="text-xs text-neutral-600 font-medium">{t('stats.peopleInChain').replace(' in der Kette', '').replace(' in Chain', '')}</div>
            </div>
            <div className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-violet-600 mb-1">2654</div>
              <div className="text-xs text-neutral-600 font-medium">{t('stats.yearsSpanned').replace(' überbrückt', '').replace(' Spanned', '')}</div>
            </div>
            <div className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-fuchsia-600 mb-1">{Object.keys(relations).length}</div>
              <div className="text-xs text-neutral-600 font-medium">{t('modal.relations')}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chain View - THE MAIN EXPERIENCE
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-strong border-b border-white/30 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-1">
                {t('app.name')}
              </h1>
              <p className="text-base md:text-lg text-neutral-700 font-semibold">
                {chainMode === 'toToday' ? (
                  <>{t('header.to')} <strong className="text-purple-700">{typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}</strong></>
                ) : (
                  <><strong className="text-violet-700">{typeof startPerson === 'string' ? startPerson : startPerson?.name}</strong> → <strong className="text-fuchsia-700">{typeof endPerson === 'string' ? endPerson : endPerson?.name}</strong></>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl p-1 border-2 border-white">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  title={t('views.listView')}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-semibold">{t('views.list')}</span>
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    viewMode === 'timeline' 
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  title={t('views.timelineView')}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-semibold">{t('views.timeline')}</span>
                </button>
                <button
                  onClick={() => setViewMode('network')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    viewMode === 'network' 
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  title={t('views.networkView')}
                >
                  <Network className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-semibold">{t('views.network')}</span>
                </button>
              </div>
              
            <button
              onClick={() => setShowLanding(true)}
                className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
                title="Keyboard shortcut: R"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="hidden sm:inline">{t('header.otherPerson')}</span>
              </button>
              
              <button
                onClick={() => setShowSearch(true)}
                className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
                title="Keyboard shortcut: /"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">{t('header.search')}</span>
              </button>
              
              {/* Year Explorer */}
              <button
                onClick={() => setShowYearExplorer(true)}
                className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
                title={t('yearExplorer.shortcut')}
              >
                <span className="text-xl">🗓️</span>
                <span className="hidden sm:inline">{t('yearExplorer.title').replace('🗓️ ', '')}</span>
              </button>
              
              {/* Language Switcher */}
              <button
                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
                className="px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
                title={`Switch to ${i18n.language === 'en' ? 'Deutsch' : 'English'}`}
              >
                <Globe className="w-5 h-5" />
                <span className="text-lg">{i18n.language === 'en' ? '🇩🇪' : '🇬🇧'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar + Controls */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="glass-strong rounded-2xl p-4 md:p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">{chain.length}</div>
              <div className="text-xs md:text-sm text-neutral-700 font-semibold text-center">{t('stats.peopleInChain')}</div>
            </div>
            <div className="glass-strong rounded-2xl p-4 md:p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-violet-600 to-violet-400 bg-clip-text text-transparent mb-2">{lifetimeCount}</div>
              <div className="text-xs md:text-sm text-neutral-700 font-semibold text-center">{t('stats.lifetimesBack')}</div>
            </div>
            <div className="glass-strong rounded-2xl p-4 md:p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-fuchsia-600 to-fuchsia-400 bg-clip-text text-transparent mb-2">{totalYears}</div>
              <div className="text-xs md:text-sm text-neutral-700 font-semibold text-center">{t('stats.yearsSpanned')}</div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="glass-strong rounded-2xl p-4 md:p-6 space-y-4">
          {/* Overlap Control */}
            <div>
              <label className="block text-sm md:text-base font-bold text-neutral-800 mb-2">
              {t('stats.minOverlap', { years: minOverlapYears })}
            </label>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={minOverlapYears}
              onChange={(e) => setMinOverlapYears(parseInt(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-lg appearance-none cursor-pointer slider"
            />
              <div className="flex justify-between text-xs text-neutral-600 mt-1 font-medium">
              <span>{t('stats.overlapShort')}</span>
              <span>{t('stats.overlapRealistic')}</span>
            </div>
          </div>

            {/* Fame Control */}
            <div>
              <label className="block text-sm md:text-base font-bold text-neutral-800 mb-2">
                {t('stats.minFame', { count: minFame })}
              </label>
              <input
                type="range"
                min="100"
                max="220"
                step="10"
                value={minFame}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  setMinFame(newValue);
                }}
                className="w-full h-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-neutral-600 mt-1 font-medium">
                <span>{t('stats.fameLess')}</span>
                <span>{t('stats.fameVery')}</span>
        </div>
      </div>

            {/* Reset Edits Button */}
            {pinnedWaypoints.length > 0 && (
              <div className="pt-4 border-t border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-purple-600 font-semibold">{t('stats.chainEdited')}</span>
                  <span className="text-xs text-neutral-500">{t('stats.waypoints', { count: pinnedWaypoints.length })}</span>
                </div>
                <button
                  onClick={() => setPinnedWaypoints([])}
                  className="w-full px-3 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                >
                  {t('stats.resetToOriginal')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

          {/* The Chain - Views */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        {chain.length === 0 ? (
          /* No Path Found */
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="glass-strong rounded-3xl p-12 animate-fade-in">
              <div className="text-7xl mb-6">😔</div>
              <h2 className="text-3xl font-bold mb-4 text-neutral-800">
                Keine Verbindung gefunden
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                {chainMode === 'between' ? (
                  <>
                    Es konnte kein Pfad zwischen <strong className="text-violet-700">{typeof startPerson === 'string' ? startPerson : startPerson?.name}</strong> und <strong className="text-fuchsia-700">{typeof endPerson === 'string' ? endPerson : endPerson?.name}</strong> gefunden werden.
                  </>
                ) : (
                  <>Keine Kette verfügbar.</>
                )}
              </p>
              <p className="text-sm text-neutral-500 mb-8">
                Versuche die Filter anzupassen oder wähle andere Personen.
              </p>
              <button
                onClick={() => setShowLanding(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                ← Zurück zur Auswahl
              </button>
            </div>
          </div>
        ) : viewMode === 'network' ? (
          /* NETWORK VIEW */
          <NetworkView 
            chain={chain}
            people={people}
            onPersonClick={setSelectedPerson}
            hoveredQid={hoveredQid}
            setHoveredQid={setHoveredQid}
          />
        ) : viewMode === 'timeline' ? (
          /* TIMELINE VIEW */
          <TimelineView 
            chain={chain}
            people={people}
            targetPerson={targetPerson}
            zoom={timelineZoom}
            setZoom={setTimelineZoom}
            onPersonClick={setSelectedPerson}
            hoveredQid={hoveredQid}
            setHoveredQid={setHoveredQid}
          />
        ) : (
          /* LIST VIEW */
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-200 via-indigo-200 to-pink-200"></div>

          {/* Chain Cards */}
          <div className="space-y-6">
            {chain.map((person, idx) => {
              const isLast = idx === chain.length - 1;
              const nextPerson = !isLast ? chain[idx + 1] : null;
              
              let overlapYears = 0;
              let hasGap = false;
              let gapYears = 0;
              
              if (nextPerson) {
                const currEnd = person.died === 9999 ? THIS_YEAR : person.died;
                const overlapStart = Math.max(person.born, nextPerson.born);
                const overlapEnd = Math.min(currEnd, nextPerson.died === 9999 ? THIS_YEAR : nextPerson.died);
                overlapYears = overlapEnd - overlapStart;
                hasGap = overlapYears <= 0;
                if (hasGap) {
                  gapYears = nextPerson.born - currEnd;
                }
              }

              return (
                <div key={person.qid} id={`card-${person.qid}`} className="relative pl-16 md:pl-20 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {/* Timeline Dot */}
                  <div className="absolute left-2 md:left-4 top-6 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 border-4 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold">
                    {chain.length - idx}
                  </div>

                  {/* Person Card */}
                  <div
                    onClick={() => setSelectedPerson(person)}
                    onMouseEnter={() => setHoveredQid(person.qid)}
                    onMouseLeave={() => setHoveredQid(null)}
                    className={`relative glass-strong rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:-translate-y-1 ${hoveredQid === person.qid ? 'ring-2 ring-purple-400 shadow-xl' : ''}`}
                  >
                    {/* Replace Icon - Don't show for first person in toToday mode */}
                    {!(chainMode === 'toToday' && idx === 0) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          
                          // Find alternatives for this position
                          const prevPerson = idx > 0 ? chain[idx - 1] : null;
                          const nextPerson = idx < chain.length - 1 ? chain[idx + 1] : null;
                          
                          const allAlternatives = people
                            .filter(p => {
                              if (chain.find(c => c.qid === p.qid)) return false;
                              if (p.sitelinks < minFame) return false;
                              
                              const pEnd = p.died === 9999 ? THIS_YEAR : p.died;
                              
                              if (prevPerson) {
                                const prevEnd = prevPerson.died === 9999 ? THIS_YEAR : prevPerson.died;
                                const overlapWithPrev = Math.min(prevEnd, pEnd) - Math.max(prevPerson.born, p.born);
                                if (overlapWithPrev < minOverlapYears) return false;
                              }
                              
                              if (nextPerson) {
                                const nextEnd = nextPerson.died === 9999 ? THIS_YEAR : nextPerson.died;
                                const overlapWithNext = Math.min(nextEnd, pEnd) - Math.max(nextPerson.born, p.born);
                                if (overlapWithNext < minOverlapYears) return false;
                              }
                              
                              if (chainMode === 'toToday' && !nextPerson) {
                                if (p.died !== 9999 && THIS_YEAR - p.died > 0) return false;
                              }
                              
                              return true;
                            });
                          
                          if (allAlternatives.length === 0) {
                            alert('Keine Alternativen gefunden! 😕 Versuche die Filter zu reduzieren.');
                            return;
                          }
                          
                          // Pick a random alternative
                          const randomPerson = allAlternatives[Math.floor(Math.random() * allAlternatives.length)];
                          
                          // Replace this person with the random alternative
                          const newWaypoints = chain
                            .slice(1, -1)
                            .map((person, i) => i === idx - 1 ? randomPerson.name : person.name);
                          
                          setPinnedWaypoints(newWaypoints);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md hover:shadow-lg z-10"
                        title="Zufällig ersetzen"
                      >
                        🎲
                      </button>
                    )}
                    
                    <div className="flex items-start gap-3 md:gap-4">
                      {/* Avatar with Image */}
                      <PersonAvatar person={person} size="md" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold mb-1 text-neutral-800">{person.name}</h3>
                        <div className="text-sm text-purple-700 font-semibold mb-2">{getOccupation(person)}</div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-neutral-700 mb-2">
                          <span className="flex items-center gap-1 font-semibold text-sm md:text-base">
                            <Clock className="w-4 h-4 text-purple-600" />
                            {person.born}–{person.died === 9999 ? t('person.today') : person.died}
                          </span>
                          <span className="text-xs md:text-sm text-neutral-600">
                            ({t('person.years', { count: person.died === 9999 ? THIS_YEAR - person.born : person.died - person.born })})
                          </span>
                        </div>
                        
                        {/* Integrated Timeline Bar */}
                        {(() => {
                          const start = chain[0]?.born ?? person.born;
                          const end = chain[chain.length - 1]?.died === 9999 ? THIS_YEAR : chain[chain.length - 1]?.died ?? person.died;
                          const total = Math.max(1, end - start);
                          const x1 = Math.max(0, person.born - start);
                          const x2 = Math.min(total, (person.died === 9999 ? THIS_YEAR : person.died) - start);
                          const leftPct = (x1 / total) * 100;
                          const widthPct = Math.max(2, ((x2 - x1) / total) * 100);
                          return (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                <span>{start}</span>
                                <div className="flex-1"></div>
                                <span>{end === THIS_YEAR ? t('person.today') : end}</span>
                              </div>
                              <div className="h-3 w-full bg-neutral-200/70 rounded-full overflow-hidden relative">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all"
                                  style={{ width: `${widthPct}%`, marginLeft: `${leftPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                        
                        {person.domains && (
                          <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {person.domains.slice(0, 3).map(d => (
                              <span key={d} className="px-2 md:px-3 py-1 bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 rounded-full text-xs font-semibold shadow-sm">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Relations Indicator */}
                    {relations[person.qid]?.knew?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-200/60 flex items-center gap-2 text-sm text-neutral-700 font-medium">
                        <Users className="w-4 h-4 text-purple-600" />
                        {t('person.knew', { count: relations[person.qid].knew.length, count_plural: relations[person.qid].knew.length === 1 ? t('person.person_one') : t('person.person_other') })}
                      </div>
                    )}
                  </div>

                  {/* Connection Info with Explore Button */}
                  {nextPerson && (
                    <>
                      <div className="mt-3 ml-2 md:ml-4 flex items-center gap-2 md:gap-3">
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                      {hasGap ? (
                          <div className="text-sm md:text-base flex-1">
                            <span className="text-red-600 font-bold">{t('connection.gap', { years: gapYears })}</span>
                            <span className="text-neutral-600 font-medium hidden sm:inline"> {t('connection.couldNotMeet')}</span>
                        </div>
                      ) : (
                          <div className="text-sm md:text-base flex-1">
                            <span className="text-green-600 font-bold">{t('connection.overlap', { years: overlapYears })}</span>
                            <span className="text-neutral-600 font-medium hidden sm:inline"> {t('connection.couldMeet')}</span>
                        </div>
                      )}
                        
                        {/* Explore Button */}
                        <button
                          onClick={() => setExpandedGap(expandedGap === idx ? null : idx)}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md hover:shadow-lg"
                          title={t('connection.explore')}
                        >
                          {expandedGap === idx ? '−' : '+'}
                        </button>
                    </div>
                      
                      {/* Expanded alternatives */}
                      {expandedGap === idx && (() => {
                        const currEnd = person.died === 9999 ? THIS_YEAR : person.died;
                        const nextStart = nextPerson.born;
                        const nextEnd = nextPerson.died === 9999 ? THIS_YEAR : nextPerson.died;
                        
                        // Find people who overlap with BOTH current and next person
                        // Group by fame levels for drill-down exploration
                        const allAlternatives = people
                          .filter(p => {
                            if (chain.find(c => c.qid === p.qid)) return false; // Not in chain
                            const pEnd = p.died === 9999 ? THIS_YEAR : p.died;
                            // Must overlap with current person AND next person
                            const overlapWithCurr = Math.min(currEnd, pEnd) - Math.max(person.born, p.born);
                            const overlapWithNext = Math.min(nextEnd, pEnd) - Math.max(nextStart, p.born);
                            return overlapWithCurr > 0 && overlapWithNext > 0;
                          })
                          .sort((a, b) => (b.sitelinks || 0) - (a.sitelinks || 0));
                        
                        // Split into fame tiers for exploration
                        const veryFamous = allAlternatives.filter(p => (p.sitelinks || 0) >= 180).slice(0, 4);
                        const famous = allAlternatives.filter(p => (p.sitelinks || 0) >= 140 && (p.sitelinks || 0) < 180).slice(0, 4);
                        const lessFamous = allAlternatives.filter(p => (p.sitelinks || 0) < 140).slice(0, 4);
                        
                        const alternatives = [...veryFamous, ...famous, ...lessFamous];
                        
                        return (
                          <div className="mt-4 ml-2 md:ml-4 animate-fade-in">
                            <div className="glass-strong rounded-2xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                                  <span className="text-purple-600">🔍</span>
                                  {t('connection.moreFromTime')}
                                </h4>
                                <span className="text-xs text-neutral-500 font-medium">
                                  {t('connection.found', { count: allAlternatives.length })}
                                </span>
                              </div>
                              
                              {/* Fame tier indicator */}
                              {alternatives.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                                  {veryFamous.length > 0 && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                      {t('connection.veryFamous', { count: veryFamous.length })}
                                    </span>
                                  )}
                                  {famous.length > 0 && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                      {t('connection.famous', { count: famous.length })}
                                    </span>
                                  )}
                                  {lessFamous.length > 0 && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                      {t('connection.lessFamous', { count: lessFamous.length })}
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {alternatives.length === 0 ? (
                                  <p className="col-span-full text-sm text-neutral-500">{t('connection.noAlternatives')}</p>
                                ) : (
                                  alternatives.map(p => {
                                    // Determine fame tier color
                                    const fameLevel = (p.sitelinks || 0) >= 180 ? 'gold' : (p.sitelinks || 0) >= 140 ? 'blue' : 'purple';
                                    const bgGradient = fameLevel === 'gold' 
                                      ? 'from-yellow-300 to-orange-300' 
                                      : fameLevel === 'blue' 
                                      ? 'from-blue-300 to-cyan-300'
                                      : 'from-purple-300 to-fuchsia-300';
                                    
                                    return (
                                    <button
                                      key={p.qid}
                                      onClick={() => setSelectedPerson(p)}
                                      className="p-3 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white hover:shadow-md transition-all text-left group"
                                    >
                                      <div className="mx-auto mb-2 group-hover:scale-110 transition-transform">
                                        <PersonAvatar person={p} size="sm" className="rounded-full" />
                                      </div>
                                        <div className="font-semibold text-xs text-neutral-800 text-center line-clamp-2 mb-1">
                                          {p.name}
                                        </div>
                                        <div className="text-xs text-purple-600 font-medium text-center truncate">
                                          {getOccupation(p)}
                                        </div>
                                        <div className="text-xs text-neutral-500 text-center mt-1">
                                          {p.born}–{p.died === 9999 ? t('person.today') : p.died}
                                        </div>
                                        <div className="text-xs text-neutral-400 text-center mt-1 flex items-center justify-center gap-1">
                                          {fameLevel === 'gold' && '⭐⭐⭐'}
                                          {fameLevel === 'blue' && '⭐⭐'}
                                          {fameLevel === 'purple' && '⭐'}
                                          <span>{p.sitelinks}</span>
                                        </div>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              );
            })}

            {/* End Marker */}
            <div className="mt-8 glass-strong rounded-2xl p-6 md:p-8 text-center shadow-xl">
              <div className="text-5xl md:text-6xl mb-4 drop-shadow-lg">
                {chainMode === 'toToday' ? '🎯' : '🔗'}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-neutral-800">
                {chainMode === 'toToday' ? 'Ziel erreicht!' : 'Verbindung gefunden!'}
              </h2>
              <p className="text-base md:text-lg text-neutral-700 mb-6 font-medium">
                {chainMode === 'toToday' ? (
                  <>Von <strong className="text-purple-700">{t('person.today')}</strong> bis <strong className="text-purple-700">{typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}</strong></>
                ) : (
                  <>Von <strong className="text-violet-700">{typeof startPerson === 'string' ? startPerson : startPerson?.name}</strong> bis <strong className="text-fuchsia-700">{typeof endPerson === 'string' ? endPerson : endPerson?.name}</strong></>
                )}
              </p>
              <div className="space-y-4">
                <div className="inline-block px-6 md:px-8 py-4 bg-gradient-to-r from-purple-100 via-fuchsia-100 to-pink-100 rounded-2xl shadow-md">
                  <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {chainMode === 'toToday' ? (
                      <>Nur {lifetimeCount} Lebenszeiten!</>
                    ) : (
                      <>Nur {chain.length} {chain.length === 1 ? 'Person' : 'Personen'}!</>
                    )}
                </div>
                </div>
                
                {/* Share Button */}
                <button
                  onClick={() => {
                    const personName = typeof targetPerson === 'string' ? targetPerson : targetPerson?.name;
                    const startName = typeof startPerson === 'string' ? startPerson : startPerson?.name;
                    const endName = typeof endPerson === 'string' ? endPerson : endPerson?.name;
                    
                    const shareText = chainMode === 'toToday'
                      ? t('share.toToday', { person: personName, steps: chain.length, lifetimes: lifetimeCount })
                      : t('share.between', { start: startName, end: endName, steps: chain.length });
                    
                    if (navigator.share) {
                      navigator.share({
                        title: t('app.name'),
                        text: shareText
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(shareText);
                      alert(t('share.copied'));
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  {t('endMarker.shareButton')}
                </button>
              </div>
            </div>
          </div>
          
          {/* Alternatives Panel */}
            <aside className="hidden lg:block sticky top-24 self-start">
              <div className="glass-strong rounded-3xl p-6">
                <h3 className="text-base font-bold text-neutral-800 mb-4">
                {hoveredQid ? 'Lebten zur gleichen Zeit' : 'Andere Zeitgenossen'}
              </h3>
              {(() => {
                const focusPerson = hoveredQid ? chain.find(p => p.qid === hoveredQid) : chain[0];
                if (!focusPerson) return <p className="text-xs text-neutral-500">Bewege die Maus über eine Person</p>;
                
                const focusStart = focusPerson.born;
                const focusEnd = focusPerson.died === 9999 ? THIS_YEAR : focusPerson.died;
                
                // Find people who overlap with focus person's lifetime
                const alternatives = people
                  .filter(p => {
                    if (chain.find(c => c.qid === p.qid)) return false; // Not in chain
                    const pEnd = p.died === 9999 ? THIS_YEAR : p.died;
                    const overlap = Math.min(focusEnd, pEnd) - Math.max(focusStart, p.born);
                    return overlap > 0 && (p.sitelinks || 0) >= 20; // Has overlap and well-known
                  })
                  .sort((a, b) => (b.sitelinks || 0) - (a.sitelinks || 0))
                  .slice(0, 10);
                
                return (
                  <div className="space-y-3">
                    {alternatives.length === 0 ? (
                      <p className="text-sm text-neutral-500">Keine weiteren bekannten Personen gefunden</p>
                    ) : (
                      alternatives.map(p => (
                        <div
                          key={p.qid}
                          className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border border-white"
                          onClick={() => setSelectedPerson(p)}
                        >
                          <div className="font-bold text-neutral-800 line-clamp-1 mb-1">{p.name}</div>
                          <div className="text-xs text-purple-600 font-semibold mb-1 line-clamp-1">
                            {getOccupation(p)}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {p.born}–{p.died === 9999 ? t('person.today') : p.died}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })()}
            </div>
          </aside>
        </div>
        )}
      </main>

      {/* Fun Facts */}
      {chain.length > 0 && funFacts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="space-y-2 animate-fade-in">
            {funFacts.map((fact, idx) => (
              <div
                key={idx}
                className={`glass-strong rounded-xl p-3 md:p-4 flex items-start gap-3 animate-slide-up ${
                  fact.type === 'primary' ? 'border-2 border-purple-300' :
                  fact.type === 'success' ? 'border-l-4 border-green-400' :
                  fact.type === 'warning' ? 'border-l-4 border-yellow-400' :
                  'border-l-4 border-blue-400'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <span className="text-2xl flex-shrink-0">{fact.icon}</span>
                <p className="text-sm md:text-base text-neutral-800 font-medium leading-relaxed">
                  {fact.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 animate-fade-in overflow-y-auto pt-20"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="bg-gradient-to-br from-white via-purple-50/30 to-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border-2 border-white animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-2xl font-bold mb-2 text-neutral-900 flex items-center gap-2">
                <Search className="w-6 h-6 text-purple-600" />
                {t('search.title')}
              </h3>
              <p className="text-sm text-neutral-600">{t('search.placeholder')}</p>
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all mb-4 text-lg"
              autoFocus
            />
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchQuery === '' ? (
                <div className="text-center text-neutral-500 py-8">
                  {t('search.placeholder')}...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center text-neutral-500 py-8">
                  {t('search.noResults', { query: searchQuery })}
                </div>
              ) : (
                searchResults.map(person => (
                  <button
                    key={person.qid}
                    onClick={() => {
                      setTargetPerson(person);
                      setShowLanding(false);
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="w-full p-3 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white hover:shadow-md transition-all text-left flex items-center gap-3 group"
                  >
                    <PersonAvatar person={person} size="sm" className="rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-neutral-800 group-hover:text-purple-600 transition-colors">
                        {person.name}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {getOccupation(person)} • {person.born}–{person.died === 9999 ? t('person.today') : person.died}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
              <span>💡 {t('keyboard.search')}: <kbd className="px-2 py-1 bg-neutral-100 rounded font-mono">/</kbd></span>
              <span>{people.length} {t('stats.peopleInChain').replace(' in der Kette', '').replace(' in Chain', '')}</span>
            </div>
            
            <button
              onClick={() => setShowSearch(false)}
              className="mt-4 w-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-semibold transition-all"
            >
              {t('modal.close')}
            </button>
          </div>
        </div>
      )}

      {/* Year Explorer Modal */}
      {showYearExplorer && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 animate-fade-in overflow-y-auto pt-10"
          onClick={() => setShowYearExplorer(false)}
        >
          <div
            className="bg-gradient-to-br from-white via-purple-50/30 to-white rounded-2xl p-6 max-w-6xl w-full shadow-2xl border-2 border-white animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-3xl font-bold mb-2 text-neutral-900 flex items-center gap-2">
                <span className="text-3xl">🗓️</span>
                {t('yearExplorer.title').replace('🗓️ ', '')}
              </h3>
              <p className="text-sm text-neutral-600">{t('yearExplorer.subtitle')}</p>
            </div>
            
            {/* Year Slider */}
            <div className="mb-6 glass-strong rounded-2xl p-6">
              <label className="block text-xl font-bold text-neutral-800 mb-4">
                {t('yearExplorer.year', { year: explorerYear })}
              </label>
              <input
                type="range"
                min={-600}
                max={THIS_YEAR}
                step={10}
                value={explorerYear}
                onChange={(e) => setExplorerYear(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-neutral-600 mt-2 font-medium">
                <span>600 BC</span>
                <span>1 AD</span>
                <span>1000</span>
                <span>1500</span>
                <span>2000</span>
                <span>{THIS_YEAR}</span>
              </div>
              
              {/* Era Label */}
              <div className="mt-4 text-center">
                <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-full font-semibold text-sm">
                  {explorerYear < 0 ? t('yearExplorer.era.ancient') :
                   explorerYear < 500 ? t('yearExplorer.era.classical') :
                   explorerYear < 1400 ? t('yearExplorer.era.medieval') :
                   explorerYear < 1600 ? t('yearExplorer.era.renaissance') :
                   explorerYear < 1800 ? t('yearExplorer.era.enlightenment') :
                   explorerYear < 1900 ? t('yearExplorer.era.industrial') :
                   explorerYear < 2000 ? t('yearExplorer.era.modern') :
                   t('yearExplorer.era.contemporary')}
                </span>
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Domain Filter */}
              <div className="glass rounded-xl p-4">
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  {t('yearExplorer.filterByDomain')}
                </label>
                <select
                  value={explorerDomain}
                  onChange={(e) => setExplorerDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white font-medium"
                >
                  <option value="all">{t('yearExplorer.allDomains')}</option>
                  <option value="Art">{t('domains.Art')}</option>
                  <option value="Science">{t('domains.Science')}</option>
                  <option value="Philosophy">{t('domains.Philosophy')}</option>
                  <option value="Politics">{t('domains.Politics')}</option>
                  <option value="Literature">{t('domains.Literature')}</option>
                  <option value="Music">{t('domains.Music')}</option>
                  <option value="Religion">{t('domains.Religion')}</option>
                  <option value="Military">{t('domains.Military')}</option>
                </select>
              </div>
              
              {/* Fame Filter */}
              <div className="glass rounded-xl p-4">
                <label className="block text-sm font-bold text-neutral-800 mb-2">
                  {t('yearExplorer.filterByFame')}
                </label>
                <select
                  value={explorerFame}
                  onChange={(e) => setExplorerFame(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white font-medium"
                >
                  <option value={0}>{t('yearExplorer.fameAny')}</option>
                  <option value={140}>{t('yearExplorer.fameMedium')}</option>
                  <option value={180}>{t('yearExplorer.fameHigh')}</option>
                  <option value={220}>{t('yearExplorer.fameVeryHigh')}</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mb-4 text-center">
              <span className="text-lg font-semibold text-purple-700">
                {explorerPeople.length === 1 ? 
                  t('yearExplorer.peopleAliveOne', { count: explorerPeople.length, year: explorerYear }) :
                  t('yearExplorer.peopleAlive', { count: explorerPeople.length, year: explorerYear })}
              </span>
            </div>
            
            {/* People Grid */}
            <div className="max-h-[500px] overflow-y-auto space-y-3">
              {explorerPeople.length === 0 ? (
                <div className="text-center text-neutral-500 py-12">
                  <div className="text-6xl mb-4">🤷</div>
                  <p className="text-lg font-semibold">{t('yearExplorer.noPeople')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {explorerPeople.map(person => (
                    <div
                      key={person.qid}
                      className="glass-strong rounded-xl p-4 hover:shadow-xl transition-all group cursor-pointer"
                      onClick={() => {
                        setSelectedPerson(person);
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <PersonAvatar person={person} size="md" className="rounded-xl flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-neutral-800 group-hover:text-purple-600 transition-colors text-sm mb-1">
                            {person.name}
                          </div>
                          <div className="text-xs text-purple-600 font-medium mb-1">
                            {getOccupation(person)}
                          </div>
                          <div className="text-xs text-neutral-600">
                            {person.born}–{person.died === 9999 ? t('person.today') : person.died}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetPerson(person.name);
                            setChainMode('toToday');
                            setShowLanding(false);
                            setShowYearExplorer(false);
                          }}
                          className="flex-1 px-2 py-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                          title={t('yearExplorer.actions.startChain', { name: person.name })}
                        >
                          🎯 {t('endMarker.newChain').replace('🔗 ', '').replace('Start ', '').replace('Starten', '').replace('Neue Kette ', '')}
                        </button>
                        {!showLanding && chain.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPinnedWaypoints([...pinnedWaypoints, person.name]);
                              setShowYearExplorer(false);
                            }}
                            className="px-3 py-1.5 bg-white border-2 border-purple-400 text-purple-600 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-all"
                            title={t('yearExplorer.actions.addWaypoint')}
                          >
                            ➕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setShowYearExplorer(false)}
              className="mt-6 w-full px-4 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-xl font-semibold transition-colors"
            >
              {t('yearExplorer.closeButton')}
            </button>
          </div>
        </div>
      )}

      {/* Person Detail Modal - Enhanced */}
      {selectedPerson && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="bg-gradient-to-br from-white via-purple-50/30 to-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-scale-in shadow-2xl border-2 border-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <PersonAvatar person={selectedPerson} size="xl" className="rounded-full mx-auto mb-4" />
              <h3 className="text-3xl font-extrabold mb-2 text-neutral-900">{selectedPerson.name}</h3>
              <p className="text-lg text-purple-700 font-bold mb-3">{getOccupation(selectedPerson)}</p>
              <p className="text-base text-neutral-700 mb-2 font-semibold">
                {selectedPerson.born}–{selectedPerson.died === 9999 ? t('person.today') : selectedPerson.died}
                {' '}
                <span className="text-sm text-neutral-600">({t('person.years', { count: selectedPerson.died === 9999 ? THIS_YEAR - selectedPerson.born : selectedPerson.died - selectedPerson.born })})</span>
              </p>
              {selectedPerson.region && (
                <p className="text-sm text-neutral-600 font-medium">📍 {selectedPerson.region}</p>
              )}
              {selectedPerson.domains && selectedPerson.domains.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {selectedPerson.domains.map(d => (
                    <span key={d} className="px-3 py-1 bg-gradient-to-r from-purple-100 via-fuchsia-100 to-pink-100 text-purple-700 rounded-full text-sm font-bold shadow-sm">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline Context */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <h4 className="font-bold text-base mb-3 flex items-center gap-2 text-neutral-800">
                <Clock className="w-4 h-4" />
                Historischer Kontext
              </h4>
              {(() => {
                const start = Math.min(...people.map(p => p.born));
                const end = THIS_YEAR;
                const total = end - start;
                const personStart = selectedPerson.born;
                const personEnd = selectedPerson.died === 9999 ? THIS_YEAR : selectedPerson.died;
                const leftPct = ((personStart - start) / total) * 100;
                const widthPct = ((personEnd - personStart) / total) * 100;
                
                return (
                  <div>
                    <div className="flex justify-between text-xs text-neutral-600 mb-1">
                      <span>{start}</span>
                      <span>Heute</span>
                    </div>
                    <div className="h-3 bg-neutral-200 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${widthPct}%`, marginLeft: `${leftPct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* In Chain Navigation */}
            {chain.find(p => p.qid === selectedPerson.qid) && (() => {
              const idx = chain.findIndex(p => p.qid === selectedPerson.qid);
              const prevPerson = idx > 0 ? chain[idx - 1] : null;
              const nextPerson = idx < chain.length - 1 ? chain[idx + 1] : null;
              
              return (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                  <h4 className="font-bold text-base mb-3 flex items-center gap-2 text-neutral-800">
                    🔗 Position in der Kette
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {prevPerson ? (
                      <button
                        onClick={() => setSelectedPerson(prevPerson)}
                        className="p-3 bg-white rounded-lg hover:shadow-md transition-all text-left"
                      >
                        <div className="text-xs text-neutral-500 mb-1">← Vorherige</div>
                        <div className="font-semibold text-sm text-neutral-800 line-clamp-1">{prevPerson.name}</div>
                        <div className="text-xs text-neutral-600">{prevPerson.born}–{prevPerson.died === 9999 ? t('person.today') : prevPerson.died}</div>
                      </button>
                    ) : (
                      <div className="p-3 bg-neutral-100 rounded-lg opacity-50">
                        <div className="text-xs text-neutral-500">← Start</div>
                      </div>
                    )}
                    
                    {nextPerson ? (
                      <button
                        onClick={() => setSelectedPerson(nextPerson)}
                        className="p-3 bg-white rounded-lg hover:shadow-md transition-all text-left"
                      >
                        <div className="text-xs text-neutral-500 mb-1">Nächste →</div>
                        <div className="font-semibold text-sm text-neutral-800 line-clamp-1">{nextPerson.name}</div>
                        <div className="text-xs text-neutral-600">{nextPerson.born}–{nextPerson.died === 9999 ? t('person.today') : nextPerson.died}</div>
                      </button>
                    ) : (
                      <div className="p-3 bg-neutral-100 rounded-lg opacity-50">
                        <div className="text-xs text-neutral-500">Ende →</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Known Relations */}
            {relations[selectedPerson.qid]?.knew && relations[selectedPerson.qid].knew.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-base mb-3 flex items-center gap-2 text-neutral-800">
                  <Users className="w-4 h-4" />
                  Bekannte Personen
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {relations[selectedPerson.qid].knew.slice(0, 4).map((rel, idx) => {
                    const relPerson = people.find(p => p.name === rel.name);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (relPerson) {
                            setSelectedPerson(relPerson);
                          }
                        }}
                        className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all text-left"
                      >
                        <div className="text-lg">
                          {rel.type.includes('Lehrer') ? '👨‍🏫' : 
                           rel.type.includes('Freund') ? '🤝' : 
                           rel.type.includes('Schüler') ? '📚' : '👥'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-neutral-800 truncate">{rel.name}</div>
                          <div className="text-xs text-neutral-600 truncate">{rel.type}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Zeitgenossen (People who lived at same time) */}
            {(() => {
              const focusStart = selectedPerson.born;
              const focusEnd = selectedPerson.died === 9999 ? THIS_YEAR : selectedPerson.died;
              
              const contemporaries = people
                .filter(p => {
                  if (p.qid === selectedPerson.qid) return false;
                  const pEnd = p.died === 9999 ? THIS_YEAR : p.died;
                  const overlap = Math.min(focusEnd, pEnd) - Math.max(focusStart, p.born);
                  return overlap > 10 && (p.sitelinks || 0) >= 30;
                })
                .sort((a, b) => (b.sitelinks || 0) - (a.sitelinks || 0))
                .slice(0, 4);
              
              if (contemporaries.length > 0) {
                return (
                  <div className="mb-4">
                    <h4 className="font-bold text-base mb-3 flex items-center gap-2 text-neutral-800">
                      ⏳ Lebte zur gleichen Zeit
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {contemporaries.map(p => (
                        <button
                          key={p.qid}
                          onClick={() => setSelectedPerson(p)}
                          className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all text-left"
                        >
                          <div className="font-semibold text-neutral-800 text-sm truncate">{p.name}</div>
                          <div className="text-xs text-neutral-600">{p.born}–{p.died === 9999 ? t('person.today') : p.died}</div>
                          {p.domains && p.domains[0] && (
                            <div className="text-xs text-purple-600 mt-1 truncate">{getOccupation(p)}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedPerson(null)}
                className="flex-1 py-3 bg-white hover:bg-neutral-50 rounded-xl transition-all font-bold text-neutral-700 text-base border-2 border-neutral-200 hover:border-neutral-300 shadow-sm hover:shadow-md"
              >
                Schließen
              </button>
              {!chain.find(p => p.qid === selectedPerson.qid) && (
                <button
                  onClick={() => {
                    setTargetPerson(selectedPerson.name);
                    setShowLanding(false);
                    setSelectedPerson(null);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-base hover:scale-105"
                >
                  🔗 Neue Kette starten
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Helper */}
      {!showLanding && (
        <div className="fixed bottom-4 right-4 z-40">
          <details className="group">
            <summary className="glass-strong rounded-xl px-4 py-2 cursor-pointer hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-sm list-none">
              <span>⌨️</span>
              <span className="hidden md:inline">{t('keyboard.title')}</span>
            </summary>
            <div className="absolute bottom-full right-0 mb-2 glass-strong rounded-xl p-4 w-64 shadow-xl animate-fade-in">
              <h4 className="font-bold mb-2 text-neutral-800">{t('keyboard.shortcutsTitle')}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">/</kbd>
                  <span className="text-neutral-700">{t('keyboard.search')}</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">Y</kbd>
                  <span className="text-neutral-700">{t('yearExplorer.title').replace('🗓️ ', '')}</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">ESC</kbd>
                  <span className="text-neutral-700">{t('keyboard.close')}</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">L</kbd>
                  <span className="text-neutral-700">{t('keyboard.listView')}</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">T</kbd>
                  <span className="text-neutral-700">{t('keyboard.timelineView')}</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">N</kbd>
                  <span className="text-neutral-700">{t('keyboard.networkView')}</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">R</kbd>
                  <span className="text-neutral-700">{t('keyboard.backToSelection')}</span>
                </div>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

export default App;

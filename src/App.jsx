import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowRight, Clock, Users, Sparkles, RotateCcw, List, BarChart3, Image as ImageIcon, Search } from 'lucide-react';
import { loadAllData } from './dataLoader';

const THIS_YEAR = new Date().getFullYear();

// Wikipedia/Wikidata image cache
const imageCache = new Map();

// Fetch person image from Wikidata
async function fetchPersonImage(qid) {
  if (!qid) return null;
  if (imageCache.has(qid)) return imageCache.get(qid);
  
  try {
    // Use Wikidata API to get image
    const response = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P18&format=json&origin=*`
    );
    const data = await response.json();
    
    if (data.claims && data.claims.P18 && data.claims.P18[0]) {
      const filename = data.claims.P18[0].mainsnak.datavalue.value;
      // Convert filename to Commons URL
      const encodedFilename = encodeURIComponent(filename.replace(/ /g, '_'));
      const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}?width=300`;
      imageCache.set(qid, imageUrl);
      return imageUrl;
    }
  } catch (error) {
    console.warn(`Failed to fetch image for ${qid}:`, error);
  }
  
  imageCache.set(qid, null);
  return null;
}

// Hook to load images for a person
function usePersonImage(person) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!person?.qid) {
      setLoading(false);
      return;
    }
    
    fetchPersonImage(person.qid).then(url => {
      setImageUrl(url);
      setLoading(false);
    });
  }, [person?.qid]);
  
  return { imageUrl, loading };
}

// Domain to occupation mapping
const DOMAIN_TO_OCCUPATION = {
  'Art': 'Künstler',
  'Science': 'Wissenschaftler',
  'Literature': 'Schriftsteller',
  'Philosophy': 'Philosoph',
  'Politics': 'Politiker',
  'Music': 'Musiker',
  'Math': 'Mathematiker',
  'Medicine': 'Mediziner',
  'Business': 'Unternehmer',
  'Military': 'Militär',
  'Religion': 'Theologe',
  'Sports': 'Sportler',
  'Other': 'Historische Persönlichkeit'
};

// Get occupation from domains
function getOccupation(person) {
  if (!person.domains || person.domains.length === 0) {
    return 'Historische Persönlichkeit';
  }
  
  // Return the first domain's occupation, or combine if multiple
  if (person.domains.length === 1) {
    return DOMAIN_TO_OCCUPATION[person.domains[0]] || person.domains[0];
  }
  
  // For multiple domains, create a combined label
  const occupations = person.domains
    .slice(0, 2)
    .map(d => DOMAIN_TO_OCCUPATION[d] || d);
  return occupations.join(' & ');
}

// Person Avatar Component with Image Support
function PersonAvatar({ person, size = 'md', className = '' }) {
  const { imageUrl, loading } = usePersonImage(person);
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 md:w-20 md:h-20 text-2xl md:text-3xl',
    lg: 'w-20 h-20 md:w-24 md:h-24 text-4xl md:text-5xl',
    xl: 'w-36 h-36 text-7xl'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md overflow-hidden relative ${className}`}>
      {loading ? (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-white/50 animate-pulse" />
        </div>
      ) : imageUrl ? (
        <img 
          src={imageUrl} 
          alt={person.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div className={imageUrl ? 'hidden' : 'flex items-center justify-center w-full h-full'}>
        {person.name.charAt(0)}
      </div>
    </div>
  );
}

// Timeline View Component
function TimelineView({ chain, people, targetPerson, zoom, setZoom, onPersonClick, hoveredQid, setHoveredQid }) {
  if (chain.length === 0) return null;
  
  const minYear = Math.min(...chain.map(p => p.born));
  const maxYear = Math.max(...chain.map(p => p.died === 9999 ? THIS_YEAR : p.died));
  const timeSpan = maxYear - minYear;
  
  const SVG_WIDTH = 1200;
  const SVG_HEIGHT = 400;
  const PADDING = 60;
  const TIMELINE_Y = SVG_HEIGHT - 60;
  const BAR_HEIGHT = 30;
  
  // Calculate positions
  const yearToX = (year) => PADDING + ((year - minYear) / timeSpan) * (SVG_WIDTH - 2 * PADDING) * zoom;
  
  return (
    <div className="space-y-6">
      {/* Zoom Controls */}
      <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-neutral-800">🔍 Zoom:</span>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center font-bold transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={zoom <= 0.5}
          >
            −
          </button>
          <span className="text-sm font-semibold text-neutral-700 w-20 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(5, zoom + 0.25))}
            className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center font-bold transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={zoom >= 5}
            title="Für große Zeitspannen höher zoomen"
          >
            +
          </button>
          </div>
          <button
            onClick={() => setZoom(1)}
            className="px-3 py-1 text-xs rounded-lg bg-white hover:bg-neutral-100 border-2 border-neutral-200 font-semibold transition-all"
          >
            Reset
          </button>
          {timeSpan > 1000 && zoom < 2 && (
            <button
              onClick={() => setZoom(3)}
              className="px-3 py-1 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold transition-all"
            >
              📊 Auto-Zoom (300%)
            </button>
          )}
        </div>
        <div className="text-sm text-neutral-600 flex items-center gap-2">
          <span>
            <span className="font-semibold">{minYear}</span> bis <span className="font-semibold">{maxYear}</span>
            <span className="ml-2 text-neutral-500">({timeSpan} Jahre)</span>
          </span>
          {timeSpan > 500 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
              ⚠️ Große Zeitspanne - Zoom empfohlen!
            </span>
          )}
        </div>
      </div>
      
      {/* Timeline SVG */}
      <div className="glass-strong rounded-2xl p-6 overflow-x-auto relative" style={{ maxWidth: '100%' }}>
        {/* Scroll hint */}
        {zoom > 1 && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10 animate-pulse">
            ← Scroll horizontal →
          </div>
        )}
        <svg width={SVG_WIDTH * zoom} height={SVG_HEIGHT} style={{ minWidth: '100%' }}>
          {/* Timeline axis */}
          <line
            x1={PADDING}
            y1={TIMELINE_Y}
            x2={(SVG_WIDTH - PADDING) * zoom}
            y2={TIMELINE_Y}
            stroke="#cbd5e1"
            strokeWidth="2"
          />
          
          {/* Year markers */}
          {Array.from({ length: Math.ceil(timeSpan / 50) + 1 }, (_, i) => {
            const year = minYear + i * 50;
            if (year > maxYear) return null;
            const x = yearToX(year);
            return (
              <g key={year}>
                <line
                  x1={x}
                  y1={TIMELINE_Y - 5}
                  x2={x}
                  y2={TIMELINE_Y + 5}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={TIMELINE_Y + 20}
                  textAnchor="middle"
                  className="text-xs fill-neutral-600 font-semibold"
                >
                  {year}
                </text>
              </g>
            );
          })}
          
          {/* Person lifespans */}
          {chain.map((person, idx) => {
            const startX = yearToX(person.born);
            const endX = yearToX(person.died === 9999 ? THIS_YEAR : person.died);
            const width = endX - startX;
            const y = 50 + (idx % 3) * 50; // Stagger vertically
            const isHovered = hoveredQid === person.qid;
            
            // Color gradient based on position in chain
            const hue = 250 + (idx / chain.length) * 60; // Purple to pink
            const color = `hsl(${hue}, 70%, 60%)`;
            const darkColor = `hsl(${hue}, 70%, 50%)`;
            
            return (
              <g key={person.qid}>
                {/* Life span bar */}
                <rect
                  x={startX}
                  y={y}
                  width={Math.max(width, 4)}
                  height={BAR_HEIGHT}
                  fill={color}
                  stroke={darkColor}
                  strokeWidth="2"
                  rx="6"
                  className={`cursor-pointer transition-all ${isHovered ? 'opacity-100 drop-shadow-lg' : 'opacity-80'}`}
                  onMouseEnter={() => setHoveredQid(person.qid)}
                  onMouseLeave={() => setHoveredQid(null)}
                  onClick={() => onPersonClick(person)}
                />
                
                {/* Person avatar at end of bar */}
                <foreignObject
                  x={endX - 20}
                  y={y + BAR_HEIGHT / 2 - 20}
                  width="40"
                  height="40"
                  className="cursor-pointer overflow-visible"
                  onClick={() => onPersonClick(person)}
                  onMouseEnter={() => setHoveredQid(person.qid)}
                  onMouseLeave={() => setHoveredQid(null)}
                >
                  <div style={{ width: '40px', height: '40px' }}>
                    <PersonAvatar person={person} size="sm" className="rounded-full border-3 border-white shadow-lg w-10 h-10" />
                  </div>
                </foreignObject>
                
                {/* Birth indicator dot */}
                <circle
                  cx={startX}
                  cy={y + BAR_HEIGHT / 2}
                  r="6"
                  fill="white"
                  stroke={darkColor}
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => onPersonClick(person)}
                />
                
                {/* Name label */}
                <text
                  x={startX + width / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className={`text-xs font-bold fill-neutral-800 cursor-pointer ${isHovered ? 'text-base' : ''}`}
                  onClick={() => onPersonClick(person)}
                >
                  {person.name}
                </text>
                
                {/* Chain number */}
                <text
                  x={startX - 8}
                  y={y + BAR_HEIGHT / 2 + 4}
                  textAnchor="end"
                  className="text-xs font-bold fill-purple-600"
                >
                  {chain.length - idx}
                </text>
                
                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={startX + width / 2 - 80}
                      y={y + BAR_HEIGHT + 10}
                      width="160"
                      height="60"
                      fill="white"
                      stroke={darkColor}
                      strokeWidth="2"
                      rx="8"
                      className="drop-shadow-xl"
                    />
                    <text
                      x={startX + width / 2}
                      y={y + BAR_HEIGHT + 28}
                      textAnchor="middle"
                      className="text-xs font-bold fill-neutral-800"
                    >
                      {person.name}
                    </text>
                    <text
                      x={startX + width / 2}
                      y={y + BAR_HEIGHT + 44}
                      textAnchor="middle"
                      className="text-xs fill-purple-600 font-semibold"
                    >
                      {getOccupation(person)}
                    </text>
                    <text
                      x={startX + width / 2}
                      y={y + BAR_HEIGHT + 60}
                      textAnchor="middle"
                      className="text-xs fill-neutral-600"
                    >
                      {person.born}–{person.died === 9999 ? 'heute' : person.died}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-400 to-fuchsia-400"></div>
            <span className="text-neutral-700 font-medium">Lebensspanne</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white border-2 border-purple-600"></div>
            <span className="text-neutral-700 font-medium">Geburt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 border-2 border-white"></div>
            <span className="text-neutral-700 font-medium">Portrait (am Ende)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600 font-bold text-lg">1</span>
            <span className="text-neutral-700 font-medium">Position in der Kette</span>
          </div>
          <div className="text-neutral-600 ml-auto">
            💡 Klicke auf eine Person für Details • Hover für Info
          </div>
        </div>
      </div>
    </div>
  );
}

// Find shortest path between any two people using BFS
function findPathBetween(startPerson, endPerson, people, minOverlap = 20, minFame = 100) {
  const byName = new Map(people.map(p => [p.name, p]));
  const start = typeof startPerson === 'string' ? byName.get(startPerson) : startPerson;
  const end = typeof endPerson === 'string' ? byName.get(endPerson) : endPerson;
  
  if (!start || !end) return [];
  if (start.name === end.name) return [start];
  
  // Filter for well-known people
  const topPeople = people.filter(p => (p.sitelinks || 0) >= minFame);
  const peopleByName = new Map(topPeople.map(p => [p.name, p]));
  
  // Helper: Check if two people can be connected (bidirectional, allow gaps)
  const canConnect = (p1, p2) => {
    const p1End = p1.died === 9999 ? THIS_YEAR : p1.died;
    const p2End = p2.died === 9999 ? THIS_YEAR : p2.died;
    
    // Check for overlap
    const overlapStart = Math.max(p1.born, p2.born);
    const overlapEnd = Math.min(p1End, p2End);
    const overlap = overlapEnd - overlapStart;
    
    // Prefer connections with good overlap
    if (overlap >= minOverlap) return true;
    
    // Fallback: Allow connections with gaps up to 200 years in either direction
    // This ensures we can find paths even across time periods
    const timeDiff = Math.abs(p1.born - p2.born);
    return timeDiff <= 200;
  };
  
  // BFS from both ends
  const queueStart = [[start]];
  const queueEnd = [[end]];
  const visitedStart = new Map([[start.name, [start]]]);
  const visitedEnd = new Map([[end.name, [end]]]);
  const MAX_DEPTH = 10; // Prevent infinite search
  
  while (queueStart.length > 0 || queueEnd.length > 0) {
    // Expand from start
    if (queueStart.length > 0) {
      const path = queueStart.shift();
      const current = path[path.length - 1];
      
      // Stop if path is too long
      if (path.length > MAX_DEPTH) continue;
      
      // Check if we've met a path from the end
      if (visitedEnd.has(current.name)) {
        const endPath = visitedEnd.get(current.name);
        return [...path, ...endPath.slice(1).reverse()];
      }
      
      // Find neighbors
      for (const neighbor of topPeople) {
        if (!visitedStart.has(neighbor.name) && canConnect(current, neighbor)) {
          const newPath = [...path, neighbor];
          visitedStart.set(neighbor.name, newPath);
          queueStart.push(newPath);
        }
      }
    }
    
    // Expand from end
    if (queueEnd.length > 0) {
      const path = queueEnd.shift();
      const current = path[path.length - 1];
      
      // Stop if path is too long
      if (path.length > MAX_DEPTH) continue;
      
      // Check if we've met a path from the start
      if (visitedStart.has(current.name)) {
        const startPath = visitedStart.get(current.name);
        return [...startPath, ...path.slice(1).reverse()];
      }
      
      // Find neighbors
      for (const neighbor of topPeople) {
        if (!visitedEnd.has(neighbor.name) && canConnect(current, neighbor)) {
          const newPath = [...path, neighbor];
          visitedEnd.set(neighbor.name, newPath);
          queueEnd.push(newPath);
        }
      }
    }
  }
  
  return []; // No path found
}

// Chain algorithm - shortest path from start to today
// Each person's BIRTH should be close to the previous person's DEATH
// minOverlap controls how much people's lives should overlap for realistic connections
// minFame controls minimum sitelinks required
function chainFrom(start, people, minOverlap = 20, minFame = 100) {
  const byName = new Map(people.map(p => [p.name, p]));
  const visited = new Set();
  const result = [];
  let curr = typeof start === 'string' ? byName.get(start) : start;
  if (!curr) return result;
  
  // Filter for well-known people (using user's fame filter)
  const topPeople = people
    .filter(p => (p.sitelinks || 0) >= minFame) // Use minFame parameter for filtering
    .sort((a, b) => (b.sitelinks || 0) - (a.sitelinks || 0));
  
  while (true) {
    result.push(curr);
    visited.add(curr.name);
    
    const currEnd = curr.died === 9999 ? THIS_YEAR : curr.died;
    
    // If current person is still alive or died recently, we're done
    if (currEnd >= THIS_YEAR - 10) break;
    
    // Strategy: Find person whose life overlaps by at least minOverlap years
    // Higher minOverlap = more realistic connections but longer chains
    let candidates = topPeople.filter(p => {
      if (visited.has(p.name)) return false;
      // Must be born after current person's birth (forward in time)
      // Must be born early enough to have minOverlap years of overlap
      return p.born > curr.born && p.born <= currEnd - minOverlap;
    });
    
    // Fallback: If no candidates with required overlap, allow gaps
    if (candidates.length === 0) {
      candidates = topPeople.filter(p => {
        if (visited.has(p.name)) return false;
        // Born after current person, within reasonable range (max 150 years gap)
        return p.born > curr.born && p.born <= currEnd + 150;
      });
      
      if (candidates.length === 0) break; // Still no candidates, we're done
    }
    
    // Find person whose birth is CLOSEST to current person's death
    // This creates the shortest chain
    let best = null;
    let bestScore = -Infinity;
    
    for (const c of candidates) {
      // Distance from current person's death to candidate's birth
      const distanceToDeath = Math.abs(c.born - currEnd);
      
      // We want births CLOSE to death (small distance = high score)
      const proximityScore = 200 - distanceToDeath; // Closer = higher score
      
      // Bonus for popular people (but less influential)
      const popularity = c.sitelinks || 0;
      const popularityBonus = Math.min(50, popularity / 10);
      
      const totalScore = proximityScore + popularityBonus;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        best = c;
      }
    }
    
    if (!best) break;
    curr = best;
  }
  
  return result;
}

function App() {
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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'
  const [timelineZoom, setTimelineZoom] = useState(1); // Timeline zoom level
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const [showSearch, setShowSearch] = useState(false); // Show search modal
  const [chainMode, setChainMode] = useState('toToday'); // 'toToday' or 'between'
  const [startPerson, setStartPerson] = useState('Leonardo da Vinci'); // For 'between' mode
  const [endPerson, setEndPerson] = useState('Albert Einstein'); // For 'between' mode

  useEffect(() => {
    loadAllData().then(({ people, relations }) => {
      setPeople(people);
      setRelations(relations);
      setLoading(false);
    });
  }, []);

  // Build chain based on mode
  const chain = useMemo(() => {
    if (!people.length) return [];
    
    if (chainMode === 'toToday') {
      if (!targetPerson) return [];
      return chainFrom(targetPerson, people, minOverlapYears, minFame);
    } else {
      // 'between' mode
      if (!startPerson || !endPerson) return [];
      return findPathBetween(startPerson, endPerson, people, minOverlapYears, minFame);
    }
  }, [people, chainMode, targetPerson, startPerson, endPerson, minOverlapYears, minFame]);

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
        case 'Escape':
          if (showSearch) setShowSearch(false);
          if (selectedPerson) setSelectedPerson(null);
          break;
        case 'l':
          setViewMode('list');
          break;
        case 't':
          setViewMode('timeline');
          break;
        case 'r':
          setShowLanding(true);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSearch, selectedPerson]);

  // Calculate metrics
  const totalYears = chain.length > 0 
    ? (chain[chain.length - 1].died === 9999 ? THIS_YEAR : chain[chain.length - 1].died) - chain[0].born
    : 0;
  
  const avgLifespan = 75;
  const lifetimeCount = Math.floor(totalYears / avgLifespan);

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
            Zeitkette
          </div>
          <div className="text-2xl font-semibold text-neutral-700 mb-8">
            Lade Zeitreisedaten...
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-4xl w-full">
          {/* Hero */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="text-5xl mb-4 animate-bounce drop-shadow-lg">⏳</div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
              Zeitkette
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 leading-tight">
              Die Vergangenheit ist näher als du denkst!
            </p>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
              Entdecke, wie wenige <strong className="text-purple-700">Lebenszeiten</strong> uns von historischen Größen trennen
            </p>
          </div>

          {/* Mode Selection */}
          <div className="glass-strong rounded-3xl p-6 mb-6 shadow-2xl animate-scale-in">
            <h2 className="text-lg font-bold text-center mb-4 text-neutral-800">Wähle deinen Modus</h2>
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
                <div className="font-bold text-sm">Bis Heute</div>
                <div className="text-xs mt-1 opacity-90">Von Person X bis jetzt</div>
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
                <div className="font-bold text-sm">Zwei Personen</div>
                <div className="text-xs mt-1 opacity-90">Kürzester Pfad A → B</div>
              </button>
            </div>
          </div>

          {/* Target Selection */}
          <div className="glass-strong rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-neutral-800">
              <Sparkles className="w-6 h-6 text-yellow-500 drop-shadow" />
              {chainMode === 'toToday' ? 'Wähle dein Ziel' : 'Wähle Start & Ziel'}
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
                      <span>🎯</span> Start Person
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
                      <span>🏁</span> Ziel Person
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
                  <p className="text-xs text-neutral-600 mb-2 font-medium">🚀 Oder probiere diese spannenden Verbindungen:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => {
                        setStartPerson('Leonardo da Vinci');
                        setEndPerson('Albert Einstein');
                      }}
                      className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                    >
                      Da Vinci → Einstein
                    </button>
                    <button
                      onClick={() => {
                        setStartPerson('Kleopatra');
                        setEndPerson('Napoleon Bonaparte');
                      }}
                      className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                    >
                      Kleopatra → Napoleon
                    </button>
                    <button
                      onClick={() => {
                        setStartPerson('Aristoteles');
                        setEndPerson('Isaac Newton');
                      }}
                      className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                    >
                      Aristoteles → Newton
                    </button>
                  </div>
                </div>
              </div>
            )}

            {chainMode === 'toToday' && (
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-3 font-medium">oder wähle aus allen {people.length} Personen:</p>
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
              {chainMode === 'toToday' ? '🚀 Zeitkette starten' : '🔗 Pfad finden'}
            </span>
        </button>

          {/* Stats Preview */}
          <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4 text-center">
            <div className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">{people.length}</div>
              <div className="text-xs text-neutral-600 font-medium">Personen</div>
            </div>
            <div className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-violet-600 mb-1">2654</div>
              <div className="text-xs text-neutral-600 font-medium">Jahre</div>
            </div>
            <div className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300">
              <div className="text-2xl md:text-3xl font-bold text-fuchsia-600 mb-1">{Object.keys(relations).length}</div>
              <div className="text-xs text-neutral-600 font-medium">Beziehungen</div>
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
                Zeitkette
              </h1>
              <p className="text-base md:text-lg text-neutral-700 font-semibold">
                {chainMode === 'toToday' ? (
                  <>Zu: <strong className="text-purple-700">{typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}</strong></>
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
                  title="Listenansicht"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-semibold">Liste</span>
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    viewMode === 'timeline' 
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  title="Timeline-Ansicht"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-semibold">Timeline</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowLanding(true)}
                className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
                title="Keyboard shortcut: R"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Andere Person</span>
              </button>
              
              <button
                onClick={() => setShowSearch(true)}
                className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
                title="Keyboard shortcut: /"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Suchen</span>
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
              <div className="text-xs md:text-sm text-neutral-700 font-semibold text-center">Personen in der Kette</div>
            </div>
            <div className="glass-strong rounded-2xl p-4 md:p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-violet-600 to-violet-400 bg-clip-text text-transparent mb-2">{lifetimeCount}</div>
              <div className="text-xs md:text-sm text-neutral-700 font-semibold text-center">Lebenszeiten zurück</div>
            </div>
            <div className="glass-strong rounded-2xl p-4 md:p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-fuchsia-600 to-fuchsia-400 bg-clip-text text-transparent mb-2">{totalYears}</div>
              <div className="text-xs md:text-sm text-neutral-700 font-semibold text-center">Jahre überbrückt</div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="glass-strong rounded-2xl p-4 md:p-6 space-y-4">
            {/* Overlap Control */}
            <div>
              <label className="block text-sm md:text-base font-bold text-neutral-800 mb-2">
                Min. Überlappung: {minOverlapYears} Jahre
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
                <span>Kurz</span>
                <span>Realistisch</span>
              </div>
            </div>

            {/* Fame Control */}
            <div>
              <label className="block text-sm md:text-base font-bold text-neutral-800 mb-2">
                Min. Bekanntheit: {minFame} Wikipedia-Artikel
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
                <span>Weniger bekannt (100+)</span>
                <span>Sehr bekannt (220)</span>
              </div>
            </div>
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
        ) : viewMode === 'list' ? (
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
                    className={`glass-strong rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:-translate-y-1 ${hoveredQid === person.qid ? 'ring-2 ring-purple-400 shadow-xl' : ''}`}
                  >
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
                            {person.born}–{person.died === 9999 ? 'heute' : person.died}
                          </span>
                          <span className="text-xs md:text-sm text-neutral-600">
                            ({person.died === 9999 ? THIS_YEAR - person.born : person.died - person.born} Jahre)
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
                                <span>{end === THIS_YEAR ? 'heute' : end}</span>
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
                        Kannte {relations[person.qid].knew.length} {relations[person.qid].knew.length === 1 ? 'Person' : 'Personen'}
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
                            <span className="text-red-600 font-bold">{gapYears} Jahre Lücke</span>
                            <span className="text-neutral-600 font-medium hidden sm:inline"> → hätten sich nicht treffen können</span>
                          </div>
                        ) : (
                          <div className="text-sm md:text-base flex-1">
                            <span className="text-green-600 font-bold">{overlapYears} Jahre Überlappung</span>
                            <span className="text-neutral-600 font-medium hidden sm:inline"> → hätten sich treffen können! ✨</span>
                          </div>
                        )}
                        
                        {/* Explore Button */}
                        <button
                          onClick={() => setExpandedGap(expandedGap === idx ? null : idx)}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md hover:shadow-lg"
                          title="Weitere Personen aus dieser Zeit entdecken"
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
                                  Weitere Personen aus dieser Zeit
                                </h4>
                                <span className="text-xs text-neutral-500 font-medium">
                                  {allAlternatives.length} gefunden
                                </span>
                              </div>
                              
                              {/* Fame tier indicator */}
                              {alternatives.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                                  {veryFamous.length > 0 && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                      ⭐⭐⭐ Sehr bekannt ({veryFamous.length})
                                    </span>
                                  )}
                                  {famous.length > 0 && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                      ⭐⭐ Bekannt ({famous.length})
                                    </span>
                                  )}
                                  {lessFamous.length > 0 && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                      ⭐ Weniger bekannt ({lessFamous.length})
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {alternatives.length === 0 ? (
                                  <p className="col-span-full text-sm text-neutral-500">Keine weiteren passenden Personen gefunden</p>
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
                                          {p.born}–{p.died === 9999 ? 'heute' : p.died}
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
                  <>Von <strong className="text-purple-700">heute</strong> bis <strong className="text-purple-700">{typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}</strong></>
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
                    const shareText = chainMode === 'toToday'
                      ? `🎯 Ich habe ${typeof targetPerson === 'string' ? targetPerson : targetPerson?.name} erreicht in nur ${chain.length} Schritten und ${lifetimeCount} Lebenszeiten! ⏳ #Zeitkette`
                      : `🔗 Ich habe ${typeof startPerson === 'string' ? startPerson : startPerson?.name} mit ${typeof endPerson === 'string' ? endPerson : endPerson?.name} verbunden in nur ${chain.length} Schritten! ⏳ #Zeitkette`;
                    
                    if (navigator.share) {
                      navigator.share({
                        title: 'Zeitkette',
                        text: shareText
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(shareText);
                      alert('Text in Zwischenablage kopiert! 📋');
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  📤 Teilen
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
                            {p.born}–{p.died === 9999 ? 'heute' : p.died}
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
        ) : (
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
        )}
      </main>

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
                Person suchen
              </h3>
              <p className="text-sm text-neutral-600">Suche nach Namen oder Beruf</p>
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="z.B. Einstein, Künstler, Philosopher..."
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all mb-4 text-lg"
              autoFocus
            />
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchQuery === '' ? (
                <div className="text-center text-neutral-500 py-8">
                  Beginne zu tippen um zu suchen...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center text-neutral-500 py-8">
                  Keine Ergebnisse gefunden
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
                        {getOccupation(person)} • {person.born}–{person.died === 9999 ? 'heute' : person.died}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
              <span>💡 Tipp: Drücke <kbd className="px-2 py-1 bg-neutral-100 rounded font-mono">/</kbd> um zu suchen</span>
              <span>Insgesamt {people.length} Personen</span>
            </div>
            
            <button
              onClick={() => setShowSearch(false)}
              className="mt-4 w-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-semibold transition-all"
            >
              Schließen
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
                {selectedPerson.born}–{selectedPerson.died === 9999 ? 'heute' : selectedPerson.died}
                {' '}
                <span className="text-sm text-neutral-600">({selectedPerson.died === 9999 ? THIS_YEAR - selectedPerson.born : selectedPerson.died - selectedPerson.born} Jahre)</span>
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
                        <div className="text-xs text-neutral-600">{prevPerson.born}–{prevPerson.died === 9999 ? 'heute' : prevPerson.died}</div>
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
                        <div className="text-xs text-neutral-600">{nextPerson.born}–{nextPerson.died === 9999 ? 'heute' : nextPerson.died}</div>
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
                          <div className="text-xs text-neutral-600">{p.born}–{p.died === 9999 ? 'heute' : p.died}</div>
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
              <span className="hidden md:inline">Shortcuts</span>
            </summary>
            <div className="absolute bottom-full right-0 mb-2 glass-strong rounded-xl p-4 w-64 shadow-xl animate-fade-in">
              <h4 className="font-bold mb-2 text-neutral-800">Tastaturkürzel</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">/</kbd>
                  <span className="text-neutral-700">Suche öffnen</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">ESC</kbd>
                  <span className="text-neutral-700">Schließen</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">L</kbd>
                  <span className="text-neutral-700">Listen-Ansicht</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">T</kbd>
                  <span className="text-neutral-700">Timeline-Ansicht</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">R</kbd>
                  <span className="text-neutral-700">Zurück zur Auswahl</span>
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

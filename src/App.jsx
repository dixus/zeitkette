import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowRight, Clock, Users, RotateCcw, List, BarChart3, Image as ImageIcon, Search, Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadAllData } from './dataLoader';
import * as d3 from 'd3';

// Extracted utilities
import { THIS_YEAR, fetchPersonImage, getOccupation, chainFrom, findPathBetween, buildChainThroughWaypoints } from './utils';

// Extracted hooks
import { usePersonImage, useKeyboardShortcuts } from './hooks';

// Extracted components
import { PersonAvatar, TimelineView, NetworkView, SearchModal, YearExplorerModal, PersonDetailModal, Header, StatsBar, ListView, LandingPage, FunFacts, KeyboardShortcuts } from './components';

// All utility functions, hooks, and small components have been extracted to separate files
// See src/utils, src/hooks, and src/components folders

// Removed duplicate TimelineView definition - now imported from ./components/views/TimelineView.jsx

// ✅ All chain algorithms (findPathBetween, buildChainThroughWaypoints, chainFrom) 
// are now imported from ./utils/chainAlgorithm.js
// ✅ NetworkView extracted to ./components/views/NetworkView.jsx

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
      <LandingPage
        chainMode={chainMode}
        setChainMode={setChainMode}
        targetPerson={targetPerson}
        setTargetPerson={setTargetPerson}
        startPerson={startPerson}
        setStartPerson={setStartPerson}
        endPerson={endPerson}
        setEndPerson={setEndPerson}
        setShowLanding={setShowLanding}
        people={people}
        relations={relations}
        popularTargets={popularTargets}
      />
    );
  }

  // Chain View - THE MAIN EXPERIENCE
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Header */}
      <Header
        chainMode={chainMode}
        targetPerson={targetPerson}
        startPerson={startPerson}
        endPerson={endPerson}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onShowLanding={() => setShowLanding(true)}
        onShowSearch={() => setShowSearch(true)}
        onShowYearExplorer={() => setShowYearExplorer(true)}
      />

      {/* Stats Bar + Controls */}
      <StatsBar
        chain={chain}
        lifetimeCount={lifetimeCount}
        totalYears={totalYears}
        minOverlapYears={minOverlapYears}
        setMinOverlapYears={setMinOverlapYears}
        minFame={minFame}
        setMinFame={setMinFame}
        pinnedWaypoints={pinnedWaypoints}
        setPinnedWaypoints={setPinnedWaypoints}
      />

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
          <ListView
            chain={chain}
            chainMode={chainMode}
            targetPerson={targetPerson}
            startPerson={startPerson}
            endPerson={endPerson}
            people={people}
            relations={relations}
            hoveredQid={hoveredQid}
            setHoveredQid={setHoveredQid}
            expandedGap={expandedGap}
            setExpandedGap={setExpandedGap}
            onPersonClick={setSelectedPerson}
            minOverlapYears={minOverlapYears}
            minFame={minFame}
            pinnedWaypoints={pinnedWaypoints}
            setPinnedWaypoints={setPinnedWaypoints}
            lifetimeCount={lifetimeCount}
            onStartNewChain={() => {
              setTargetPerson(selectedPerson.name);
              setShowLanding(false);
              setSelectedPerson(null);
            }}
          />
        )}
      </main>

      {/* Fun Facts */}
      <FunFacts funFacts={funFacts} />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        people={people}
        onSelectPerson={(person) => {
          setTargetPerson(person);
          setShowLanding(false);
          setShowSearch(false);
          setSearchQuery('');
        }}
      />

      {/* Year Explorer Modal */}
      <YearExplorerModal
        isOpen={showYearExplorer}
        onClose={() => setShowYearExplorer(false)}
        explorerYear={explorerYear}
        setExplorerYear={setExplorerYear}
        explorerDomain={explorerDomain}
        setExplorerDomain={setExplorerDomain}
        explorerFame={explorerFame}
        setExplorerFame={setExplorerFame}
        explorerPeople={explorerPeople}
        showLanding={showLanding}
        chain={chain}
        onStartChain={(e, person) => {
          e.stopPropagation();
          setTargetPerson(person.name);
          setChainMode('toToday');
          setShowLanding(false);
          setShowYearExplorer(false);
        }}
        onAddWaypoint={(e, person) => {
          e.stopPropagation();
          setPinnedWaypoints([...pinnedWaypoints, person.name]);
          setShowYearExplorer(false);
        }}
        onPersonClick={setSelectedPerson}
      />

      {/* Person Detail Modal - Enhanced */}
      <PersonDetailModal
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        selectedPerson={selectedPerson}
        people={people}
        chain={chain}
        relations={relations}
        onNavigateToPerson={setSelectedPerson}
        onStartNewChain={() => {
          setTargetPerson(selectedPerson.name);
          setShowLanding(false);
          setSelectedPerson(null);
        }}
      />


      {/* Keyboard Shortcuts Helper */}
      <KeyboardShortcuts showLanding={showLanding} />
    </div>
  );
}

export default App;

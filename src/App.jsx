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
import { PersonAvatar, TimelineView, NetworkView, SearchModal, YearExplorerModal, PersonDetailModal, Header, StatsBar, ListView } from './components';

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

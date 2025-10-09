import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Clock, Users, Sparkles, RotateCcw } from 'lucide-react';
import { loadAllData } from './dataLoader';

const THIS_YEAR = new Date().getFullYear();

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

  useEffect(() => {
    loadAllData().then(({ people, relations }) => {
      setPeople(people);
      setRelations(relations);
      setLoading(false);
    });
  }, []);

  // Build chain from target person to today (chronological order)
  const chain = useMemo(() => {
    if (!people.length || !targetPerson) return [];
    return chainFrom(targetPerson, people, minOverlapYears, minFame);
  }, [people, targetPerson, minOverlapYears, minFame]);

  // Calculate metrics
  const totalYears = chain.length > 0 
    ? (chain[chain.length - 1].died === 9999 ? THIS_YEAR : chain[chain.length - 1].died) - chain[0].born
    : 0;
  
  const avgLifespan = 75;
  const lifetimeCount = Math.floor(totalYears / avgLifespan);

  const popularTargets = [
    { name: 'Leonardo da Vinci', icon: '🎨', era: 'Renaissance' },
    { name: 'Albert Einstein', icon: '🧠', era: 'Modern' },
    { name: 'Kleopatra', icon: '👑', era: 'Antike' },
    { name: 'William Shakespeare', icon: '📚', era: 'Renaissance' },
    { name: 'Isaac Newton', icon: '🍎', era: 'Aufklärung' },
    { name: 'Napoleon Bonaparte', icon: '⚔️', era: 'Modern' },
  ];

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-8 animate-bounce drop-shadow-lg">⏳</div>
          <div className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent animate-pulse mb-4">
            Zeitkette
          </div>
          <div className="text-2xl font-semibold text-neutral-700">
            Lade Zeitreisedaten...
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

          {/* Target Selection */}
          <div className="glass-strong rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-neutral-800">
              <Sparkles className="w-6 h-6 text-yellow-500 drop-shadow" />
              Wähle dein Ziel
            </h2>
            
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
                  <div className="text-4xl md:text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">{target.icon}</div>
                  <div className="font-bold text-sm mb-1 text-neutral-800">{target.name}</div>
                  <div className="text-xs text-purple-600 font-medium">{target.era}</div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-3 font-medium">oder wähle aus allen {people.length} Personen:</p>
              <select
                value={targetPerson}
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
          </div>

          <button
            onClick={() => setShowLanding(false)}
            className="w-full py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-lg md:text-xl font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
          >
            <span className="drop-shadow-lg">🚀 Zeitkette starten</span>
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
                Zu: <strong className="text-purple-700">{targetPerson}</strong>
              </p>
            </div>
            <button
              onClick={() => setShowLanding(true)}
              className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="hidden sm:inline">Andere Person</span>
            </button>
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

          {/* The Chain - Vertical Timeline + Alternatives Panel */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
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
                      {/* Avatar */}
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 flex items-center justify-center text-white text-2xl md:text-3xl font-bold flex-shrink-0 shadow-md">
                        {person.name.charAt(0)}
                      </div>

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

                  {/* Connection Info */}
                  {nextPerson && (
                    <div className="mt-3 ml-2 md:ml-4 flex items-center gap-2 md:gap-3">
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                      {hasGap ? (
                        <div className="text-sm md:text-base">
                          <span className="text-red-600 font-bold">{gapYears} Jahre Lücke</span>
                          <span className="text-neutral-600 font-medium hidden sm:inline"> → hätten sich nicht treffen können</span>
                        </div>
                      ) : (
                        <div className="text-sm md:text-base">
                          <span className="text-green-600 font-bold">{overlapYears} Jahre Überlappung</span>
                          <span className="text-neutral-600 font-medium hidden sm:inline"> → hätten sich treffen können! ✨</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* End Marker */}
            <div className="mt-8 glass-strong rounded-2xl p-6 md:p-8 text-center shadow-xl">
              <div className="text-5xl md:text-6xl mb-4 drop-shadow-lg">🎯</div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-neutral-800">Ziel erreicht!</h2>
              <p className="text-base md:text-lg text-neutral-700 mb-6 font-medium">
                Von <strong className="text-purple-700">heute</strong> bis <strong className="text-purple-700">{targetPerson}</strong>
              </p>
              <div className="inline-block px-6 md:px-8 py-4 bg-gradient-to-r from-purple-100 via-fuchsia-100 to-pink-100 rounded-2xl shadow-md">
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Nur {lifetimeCount} Lebenszeiten!
                </div>
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
      </main>

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
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {selectedPerson.name.charAt(0)}
              </div>
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
    </div>
  );
}

export default App;

import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Clock, Users, Sparkles, RotateCcw } from 'lucide-react';
import { loadAllData } from './dataLoader';

const THIS_YEAR = new Date().getFullYear();

// Chain algorithm - shortest path from start to today
// Each person's BIRTH should be close to the previous person's DEATH
// minOverlap controls how much people's lives should overlap for realistic connections
function chainFrom(start, people, minOverlap = 20) {
  const byName = new Map(people.map(p => [p.name, p]));
  const visited = new Set();
  const result = [];
  let curr = typeof start === 'string' ? byName.get(start) : start;
  if (!curr) return result;
  
  // Filter for well-known people (lower threshold to get better coverage)
  const topPeople = people
    .filter(p => (p.sitelinks || 0) >= 30) // Lowered from 60 to 30 for better historical coverage
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
    return chainFrom(targetPerson, people, minOverlapYears);
  }, [people, targetPerson, minOverlapYears]);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <div className="text-2xl font-bold text-neutral-700 animate-pulse">
            Lade Zeitreisedaten...
          </div>
        </div>
      </div>
    );
  }

  // Landing Screen
  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Hero */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="text-7xl mb-6 animate-bounce">⏳</div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Zeitkette
            </h1>
            <p className="text-3xl md:text-4xl font-semibold text-neutral-800 mb-4">
              Die Vergangenheit ist näher als du denkst!
            </p>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Entdecke, wie wenige <strong>Lebenszeiten</strong> uns von historischen Größen trennen
            </p>
          </div>

          {/* Target Selection */}
          <div className="glass rounded-3xl p-8 shadow-2xl animate-scale-in mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Wähle dein Ziel
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {popularTargets.map((target) => (
                <button
                  key={target.name}
                  onClick={() => {
                    setTargetPerson(target.name);
                    setShowLanding(false);
                  }}
                  className="p-6 bg-white rounded-2xl hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-purple-300"
                >
                  <div className="text-5xl mb-3">{target.icon}</div>
                  <div className="font-semibold text-sm mb-1">{target.name}</div>
                  <div className="text-xs text-neutral-500">{target.era}</div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-3">oder wähle aus allen {people.length} Personen:</p>
              <select
                value={targetPerson}
                onChange={(e) => setTargetPerson(e.target.value)}
                className="px-6 py-3 rounded-xl border-2 border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
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
            className="w-full py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl hover:shadow-2xl transition-all hover:scale-105"
          >
            🚀 Zeitkette starten
        </button>

          {/* Stats Preview */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-600">{people.length}</div>
              <div className="text-xs text-neutral-600">Personen</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-bold text-indigo-600">2654</div>
              <div className="text-xs text-neutral-600">Jahre</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-bold text-pink-600">{Object.keys(relations).length}</div>
              <div className="text-xs text-neutral-600">Beziehungen</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chain View - THE MAIN EXPERIENCE
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-white/20 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Zeitkette
              </h1>
              <p className="text-sm text-neutral-600">
                Zu: <strong>{targetPerson}</strong>
              </p>
            </div>
            <button
              onClick={() => setShowLanding(true)}
              className="px-4 py-2 bg-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Andere Person
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar + Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-purple-600">{chain.length}</div>
              <div className="text-sm text-neutral-600 mt-1">Personen in der Kette</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-indigo-600">{lifetimeCount}</div>
              <div className="text-sm text-neutral-600 mt-1">Lebenszeiten zurück</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-pink-600">{totalYears}</div>
              <div className="text-sm text-neutral-600 mt-1">Jahre überbrückt</div>
            </div>
          </div>
          
          {/* Overlap Control */}
          <div className="glass rounded-2xl p-6">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
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
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Kurz</span>
              <span>Realistisch</span>
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
                <div key={person.qid} id={`card-${person.qid}`} className="relative pl-20 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {/* Timeline Dot */}
                  <div className="absolute left-4 top-8 w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-white shadow-lg flex items-center justify-center text-white font-bold">
                    {chain.length - idx}
                  </div>

                  {/* Person Card */}
                  <div
                    onClick={() => setSelectedPerson(person)}
                    onMouseEnter={() => setHoveredQid(person.qid)}
                    onMouseLeave={() => setHoveredQid(null)}
                    className={`glass rounded-2xl p-6 hover:shadow-2xl transition-all cursor-pointer hover:scale-102 ${hoveredQid === person.qid ? 'ring-4 ring-purple-400' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                        {person.name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1">{person.name}</h3>
                        <div className="flex items-center gap-3 text-neutral-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {person.born}–{person.died === 9999 ? 'heute' : person.died}
                          </span>
                          <span className="text-sm">
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
                          <div className="flex flex-wrap gap-2">
                            {person.domains.slice(0, 3).map(d => (
                              <span key={d} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Relations Indicator */}
                    {relations[person.qid]?.knew?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center gap-2 text-sm text-neutral-600">
                        <Users className="w-4 h-4" />
                        Kannte {relations[person.qid].knew.length} {relations[person.qid].knew.length === 1 ? 'Person' : 'Personen'}
                      </div>
                    )}
                  </div>

                  {/* Connection Info */}
                  {nextPerson && (
                    <div className="mt-4 ml-4 flex items-center gap-3">
                      <ArrowRight className="w-5 h-5 text-neutral-400" />
                      {hasGap ? (
                        <div className="text-sm">
                          <span className="text-red-600 font-semibold">{gapYears} Jahre Lücke</span>
                          <span className="text-neutral-500"> → hätten sich nicht treffen können</span>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className="text-green-600 font-semibold">{overlapYears} Jahre Überlappung</span>
                          <span className="text-neutral-500"> → hätten sich treffen können! ✨</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* End Marker */}
            <div className="mt-12 glass rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold mb-2">Ziel erreicht!</h2>
              <p className="text-lg text-neutral-600 mb-4">
                Von <strong>heute</strong> bis <strong>{targetPerson}</strong>
              </p>
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Nur {lifetimeCount} Lebenszeiten!
                </div>
              </div>
            </div>
          </div>
          
          {/* Alternatives Panel */}
          <aside className="hidden lg:block sticky top-20 self-start">
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">
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
                  <div className="space-y-2">
                    {alternatives.length === 0 ? (
                      <p className="text-xs text-neutral-500">Keine weiteren bekannten Personen gefunden</p>
                    ) : (
                      alternatives.map(p => (
                        <div
                          key={p.qid}
                          className="p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-colors cursor-pointer text-sm"
                          onClick={() => setSelectedPerson(p)}
                        >
                          <div className="font-semibold text-neutral-800 line-clamp-1">{p.name}</div>
                          <div className="text-xs text-neutral-600">
                            {p.born}–{p.died === 9999 ? 'heute' : p.died}
                          </div>
                          {p.domains && p.domains.length > 0 && (
                            <div className="text-xs text-purple-600 mt-1 line-clamp-1">
                              {p.domains[0]}
                            </div>
                          )}
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
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-6xl font-bold shadow-lg">
                {selectedPerson.name.charAt(0)}
              </div>
              <h3 className="text-4xl font-bold mb-3 text-neutral-900">{selectedPerson.name}</h3>
              <p className="text-xl text-neutral-600 mb-2">
                {selectedPerson.born}–{selectedPerson.died === 9999 ? 'heute' : selectedPerson.died}
                {' '}
                <span className="text-base">({selectedPerson.died === 9999 ? THIS_YEAR - selectedPerson.born : selectedPerson.died - selectedPerson.born} Jahre)</span>
              </p>
              {selectedPerson.region && (
                <p className="text-neutral-500">📍 {selectedPerson.region}</p>
              )}
              {selectedPerson.domains && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {selectedPerson.domains.map(d => (
                    <span key={d} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline Context */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-neutral-800">
                <Clock className="w-5 h-5" />
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
                    <div className="flex justify-between text-xs text-neutral-600 mb-2">
                      <span>{start}</span>
                      <span>Heute</span>
                    </div>
                    <div className="h-4 bg-neutral-200 rounded-full overflow-hidden relative">
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
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-neutral-800">
                    🔗 Position in der Kette
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prevPerson ? (
                      <button
                        onClick={() => setSelectedPerson(prevPerson)}
                        className="p-4 bg-white rounded-xl hover:shadow-lg transition-all text-left"
                      >
                        <div className="text-xs text-neutral-500 mb-1">← Vorherige Person</div>
                        <div className="font-semibold text-neutral-800">{prevPerson.name}</div>
                        <div className="text-xs text-neutral-600">{prevPerson.born}–{prevPerson.died === 9999 ? 'heute' : prevPerson.died}</div>
                      </button>
                    ) : (
                      <div className="p-4 bg-neutral-100 rounded-xl opacity-50">
                        <div className="text-xs text-neutral-500">← Startperson</div>
                      </div>
                    )}
                    
                    {nextPerson ? (
                      <button
                        onClick={() => setSelectedPerson(nextPerson)}
                        className="p-4 bg-white rounded-xl hover:shadow-lg transition-all text-left"
                      >
                        <div className="text-xs text-neutral-500 mb-1">Nächste Person →</div>
                        <div className="font-semibold text-neutral-800">{nextPerson.name}</div>
                        <div className="text-xs text-neutral-600">{nextPerson.born}–{nextPerson.died === 9999 ? 'heute' : nextPerson.died}</div>
                      </button>
                    ) : (
                      <div className="p-4 bg-neutral-100 rounded-xl opacity-50">
                        <div className="text-xs text-neutral-500">Ende der Kette →</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Known Relations */}
            {relations[selectedPerson.qid]?.knew && relations[selectedPerson.qid].knew.length > 0 && (
              <div className="mb-8">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-neutral-800">
                  <Users className="w-5 h-5" />
                  Bekannte Personen
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {relations[selectedPerson.qid].knew.map((rel, idx) => {
                    const relPerson = people.find(p => p.name === rel.name);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (relPerson) {
                            setSelectedPerson(relPerson);
                          }
                        }}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-all text-left"
                      >
                        <div className="text-2xl">
                          {rel.type.includes('Lehrer') ? '👨‍🏫' : 
                           rel.type.includes('Freund') ? '🤝' : 
                           rel.type.includes('Schüler') ? '📚' : '👥'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-800 truncate">{rel.name}</div>
                          <div className="text-xs text-neutral-600">{rel.type}</div>
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
                .slice(0, 6);
              
              if (contemporaries.length > 0) {
                return (
                  <div className="mb-8">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-neutral-800">
                      ⏳ Lebte zur gleichen Zeit
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {contemporaries.map(p => (
                        <button
                          key={p.qid}
                          onClick={() => setSelectedPerson(p)}
                          className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all text-left"
                        >
                          <div className="font-semibold text-neutral-800 text-sm truncate">{p.name}</div>
                          <div className="text-xs text-neutral-600">{p.born}–{p.died === 9999 ? 'heute' : p.died}</div>
                          {p.domains && p.domains[0] && (
                            <div className="text-xs text-purple-600 mt-1 truncate">{p.domains[0]}</div>
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
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPerson(null)}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors font-semibold text-neutral-700"
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
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
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

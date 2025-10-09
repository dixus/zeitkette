import { ArrowRight, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { THIS_YEAR, getOccupation } from '../../utils';

/**
 * ListView Component
 * Displays the chain as a vertical list of person cards with timeline
 */
export function ListView({
  chain,
  chainMode,
  targetPerson,
  startPerson,
  endPerson,
  people,
  relations,
  hoveredQid,
  setHoveredQid,
  expandedGap,
  setExpandedGap,
  onPersonClick,
  minOverlapYears,
  minFame,
  pinnedWaypoints,
  setPinnedWaypoints,
  lifetimeCount,
  onStartNewChain
}) {
  const { t } = useTranslation();

  return (
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
                onClick={() => onPersonClick(person)}
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
                                
                                return (
                                <button
                                  key={p.qid}
                                  onClick={() => onPersonClick(p)}
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
                      onClick={() => onPersonClick(p)}
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
  );
}


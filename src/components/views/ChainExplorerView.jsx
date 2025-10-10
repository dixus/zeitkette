import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { THIS_YEAR } from '../../utils';

/**
 * Chain Explorer View
 * Shows a horizontal timeline of people in a knowledge chain with their connections
 */
export function ChainExplorerView({ chain, people, relations, onClose, onPersonClick }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [hoveredPerson, setHoveredPerson] = useState(null);
  
  // Filter people to only those in this chain
  const chainPeople = people.filter(p => chain.qids.includes(p.qid));
  
  // Debug: log what we found
  useEffect(() => {
    console.log('Chain Explorer:', {
      chainName: chain.name.en,
      expectedQids: chain.qids.length,
      foundPeople: chainPeople.length,
      chainPeople: chainPeople.map(p => ({ name: p.name, qid: p.qid, born: p.born }))
    });
  }, [chainPeople, chain]);
  
  // Sort by birth year
  const sortedPeople = [...chainPeople].sort((a, b) => a.born - b.born);
  
  // Helper to normalize open-ended lives (died === 9999 means still alive)
  const getEndYear = (p) => (p.died === 9999 || !p.died ? THIS_YEAR : p.died);
  
  // Calculate timeline bounds (clamp open-ended to THIS_YEAR so range stays realistic)
  const minYear = Math.min(...sortedPeople.map(p => p.born));
  const maxYear = Math.max(...sortedPeople.map(p => getEndYear(p)));
  const yearRange = maxYear - minYear;
  
  // Get position (0-100%) for a year
  const getPosition = (year) => {
    return ((year - minYear) / yearRange) * 100;
  };
  
  // Get connections for visualization
  const chainConnections = [];
  sortedPeople.forEach(person => {
    if (relations[person.qid]?.knew) {
      relations[person.qid].knew.forEach(rel => {
        const targetPerson = chainPeople.find(p => p.name === rel.name);
        if (targetPerson) {
          chainConnections.push({
            from: person,
            to: targetPerson,
            type: rel.type,
            confidence: rel.confidence
          });
        }
      });
    }
  });
  
  const handlePersonClick = (person) => {
    setSelectedPerson(selectedPerson?.qid === person.qid ? null : person);
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 z-50 overflow-hidden">
      {/* Header */}
      <div className="glass-strong border-b border-white/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-all"
              title={t('back')}
            >
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{chain.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {chain.name[lang] || chain.name.en}
                  </h1>
                  <p className="text-sm text-neutral-600">
                    {chain.description[lang] || chain.description.en}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{sortedPeople.length}</div>
              <div className="text-neutral-600">{t('people')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{chainConnections.length}</div>
              <div className="text-neutral-600">{t('connections')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{chain.period}</div>
              <div className="text-neutral-600">Period</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="h-full overflow-auto pb-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="glass-strong rounded-3xl p-8 min-h-[600px] relative">
            {/* Year markers */}
            <div className="relative h-16 border-b-2 border-purple-300 mb-12">
              {(() => {
                const step = yearRange <= 100 ? 10 : yearRange <= 200 ? 20 : 25;
                const count = Math.floor(yearRange / step) + 1;
                return Array.from({ length: Math.min(count, 25) }).map((_, i) => {
                  const year = minYear + i * step;
                if (year > maxYear) return null;
                return (
                  <div
                    key={year}
                    className="absolute top-0 h-full"
                    style={{ left: `${getPosition(year)}%` }}
                  >
                    <div className="w-0.5 h-6 bg-purple-400"></div>
                    <span className="absolute top-8 left-0 -translate-x-1/2 text-sm text-neutral-700 font-semibold whitespace-nowrap">
                      {year}
                    </span>
                  </div>
                );
                });
              })()}
            </div>
            
            {/* People timeline */}
            <div className="relative" style={{ minHeight: '600px' }}>
              {sortedPeople.map((person, index) => {
                const startPos = getPosition(person.born);
                const endPos = getPosition(getEndYear(person));
                const width = Math.max(endPos - startPos, 5); // ensure minimum width
                const isSelected = selectedPerson?.qid === person.qid;
                const isHovered = hoveredPerson?.qid === person.qid;
                
                // Stagger vertically to avoid overlap
                const row = index % 5;
                const top = row * 110;
                
                return (
                  <div
                    key={person.qid}
                    className="absolute"
                    style={{
                      left: `${startPos}%`,
                      width: `${width}%`,
                      top: `${top}px`
                    }}
                  >
                    <div
                      className={`
                        relative h-24 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden
                        ${isSelected ? 'ring-4 ring-purple-500 scale-105 z-20' : 'z-10'}
                        ${isHovered ? 'scale-105 z-20' : ''}
                      `}
                      onClick={() => handlePersonClick(person)}
                      onMouseEnter={() => setHoveredPerson(person)}
                      onMouseLeave={() => setHoveredPerson(null)}
                      style={{
                        background: `linear-gradient(135deg, ${chain.color}30, ${chain.color}50)`,
                        border: `3px solid ${chain.color}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="flex items-center h-full p-2 gap-2">
                        <div className="flex-shrink-0">
                          <PersonAvatar person={person} size="md" className="rounded-full shadow-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-neutral-900 truncate">
                            {person.name}
                          </div>
                          <div className="text-xs text-neutral-700 font-semibold">
                            {person.born}–{person.died || t('today')}
                          </div>
                          {isSelected && (
                            <div className="text-xs text-purple-800 font-bold mt-1">
                              ← See connections
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Connection lines */}
              <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 1 }}>
                {chainConnections
                  .filter(conn => {
                    // Show all connections if nothing selected, otherwise show only related to selected
                    if (!selectedPerson) return true;
                    return conn.from.qid === selectedPerson.qid || conn.to.qid === selectedPerson.qid;
                  })
                  .map((conn, i) => {
                    const fromIndex = sortedPeople.findIndex(p => p.qid === conn.from.qid);
                    const toIndex = sortedPeople.findIndex(p => p.qid === conn.to.qid);
                    
                    if (fromIndex === -1 || toIndex === -1) return null;
                    
                    const fromRow = fromIndex % 5;
                    const toRow = toIndex % 5;
                    
                    // Center of person's lifespan
                    const fromMid = (conn.from.born + getEndYear(conn.from)) / 2;
                    const toMid = (conn.to.born + getEndYear(conn.to)) / 2;
                    
                    const x1 = getPosition(fromMid);
                    const y1 = fromRow * 110 + 48; // Middle of card (48px = half of 96px height)
                    
                    const x2 = getPosition(toMid);
                    const y2 = toRow * 110 + 48;
                    
                    const isHighlighted = selectedPerson && 
                      (conn.from.qid === selectedPerson.qid || conn.to.qid === selectedPerson.qid);
                    
                    return (
                      <line
                        key={i}
                        x1={`${x1}%`}
                        y1={y1}
                        x2={`${x2}%`}
                        y2={y2}
                        stroke={chain.color}
                        strokeWidth={isHighlighted ? 4 : 2}
                        opacity={selectedPerson ? (isHighlighted ? 0.9 : 0.08) : 0.25}
                        strokeDasharray={conn.type === 'debated' ? '8,8' : 'none'}
                        className="transition-all duration-300"
                      />
                    );
                  })}
              </svg>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6 glass rounded-2xl p-4">
            <div className="flex items-center justify-center gap-8 text-sm text-neutral-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-purple-500"></div>
                <span>Solid: Teacher/Influenced/Collaborated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-purple-500" style={{ strokeDasharray: '5,5', stroke: '#8B5CF6', strokeWidth: 2 }}></div>
                <span>Dashed: Debated</span>
              </div>
              <div className="px-3 py-1 bg-purple-100 rounded-full text-purple-700 font-semibold">
                Click a person to highlight their connections
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected person sidebar */}
      {selectedPerson && (
        <div className="fixed right-0 top-0 h-full w-80 glass-strong border-l border-white/50 p-6 overflow-y-auto animate-slide-in-right z-50">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-neutral-900">{selectedPerson.name}</h3>
            <button
              onClick={() => setSelectedPerson(null)}
              className="p-1 hover:bg-white/50 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <PersonAvatar person={selectedPerson} size="lg" className="rounded-2xl mb-3" />
            <div className="text-neutral-700 text-sm">
              {selectedPerson.born}–{selectedPerson.died || t('today')}
            </div>
          </div>
          
          {/* Connections */}
          {(() => {
            const outgoing = chainConnections.filter(c => c.from.qid === selectedPerson.qid);
            const incoming = chainConnections.filter(c => c.to.qid === selectedPerson.qid);
            
            return (
              <>
                {outgoing.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-purple-700 mb-2">Influenced/Taught:</h4>
                    <div className="space-y-2">
                      {outgoing.map((conn, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedPerson(conn.to);
                            if (onPersonClick) onPersonClick(conn.to);
                          }}
                          className="w-full text-left p-2 bg-white/50 hover:bg-white rounded-lg transition-all"
                        >
                          <div className="font-semibold text-sm">{conn.to.name}</div>
                          <div className="text-xs text-neutral-600">{conn.type}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {incoming.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-purple-700 mb-2">Influenced By:</h4>
                    <div className="space-y-2">
                      {incoming.map((conn, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedPerson(conn.from);
                            if (onPersonClick) onPersonClick(conn.from);
                          }}
                          className="w-full text-left p-2 bg-white/50 hover:bg-white rounded-lg transition-all"
                        >
                          <div className="font-semibold text-sm">{conn.from.name}</div>
                          <div className="text-xs text-neutral-600">{conn.type}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}


import { Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { THIS_YEAR, getOccupation } from '../../utils';

/**
 * PersonDetailModal Component
 * Enhanced modal showing detailed information about a selected person
 */
export function PersonDetailModal({
  isOpen,
  onClose,
  selectedPerson,
  people,
  chain,
  relations,
  onNavigateToPerson,
  onStartNewChain
}) {
  const { t } = useTranslation();

  if (!isOpen || !selectedPerson) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
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
                    onClick={() => onNavigateToPerson(prevPerson)}
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
                    onClick={() => onNavigateToPerson(nextPerson)}
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
                        onNavigateToPerson(relPerson);
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
                      onClick={() => onNavigateToPerson(p)}
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
            onClick={onClose}
            className="flex-1 py-3 bg-white hover:bg-neutral-50 rounded-xl transition-all font-bold text-neutral-700 text-base border-2 border-neutral-200 hover:border-neutral-300 shadow-sm hover:shadow-md"
          >
            Schließen
          </button>
          {!chain.find(p => p.qid === selectedPerson.qid) && (
            <button
              onClick={onStartNewChain}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-base hover:scale-105"
            >
              🔗 Neue Kette starten
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


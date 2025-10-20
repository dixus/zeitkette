import { Clock, Users, Link, GraduationCap, Handshake, BookOpen, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { THIS_YEAR, getOccupation } from '../../utils';
import DomainChainBadge from '../DomainChainBadge';

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
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-start md:items-center justify-center p-0 md:p-4 z-50 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="modal-container bg-gradient-to-br from-white via-purple-50/30 to-white rounded-none md:rounded-xl p-3 max-w-lg w-full min-h-screen md:min-h-0 max-h-screen md:max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl border-0 md:border-2 border-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="text-center mb-3">
          <PersonAvatar person={selectedPerson} size="md" className="rounded-full mx-auto mb-2" />
          <h3 className="text-lg font-extrabold mb-0.5 text-neutral-900">{selectedPerson.name}</h3>
          <p className="text-xs text-purple-700 font-bold mb-1">{getOccupation(selectedPerson)}</p>
          <p className="text-xs text-neutral-700 mb-1 font-semibold">
            {selectedPerson.born}–{selectedPerson.died === 9999 ? t('person.today') : selectedPerson.died}
            {' '}
            <span className="text-[10px] text-neutral-600">({t('person.years', { count: selectedPerson.died === 9999 ? THIS_YEAR - selectedPerson.born : selectedPerson.died - selectedPerson.born })})</span>
          </p>
          {selectedPerson.region && (
            <p className="text-[10px] text-neutral-600 font-medium">{selectedPerson.region}</p>
          )}
          {selectedPerson.domains && selectedPerson.domains.length > 1 && (
            <div className="flex flex-wrap justify-center gap-1 mt-1.5">
              {selectedPerson.domains.map(d => (
                <DomainChainBadge key={d} domain={d} qid={selectedPerson.qid} />
              ))}
            </div>
          )}
        </div>

        {/* Timeline Context - Compact */}
        <div className="mb-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-bold text-xs mb-1.5 flex items-center gap-1 text-neutral-800">
            <Clock className="w-3 h-3" />
            {t('modal.historicalContext')}
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
                <div className="flex justify-between text-[10px] text-neutral-600 mb-0.5">
                  <span>{start}</span>
                  <span>{t('person.today')}</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden relative">
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
            <div className="mb-2 p-2 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
              <h4 className="font-bold text-xs mb-1.5 flex items-center gap-1 text-neutral-800">
                <Link className="w-3 h-3" />
                {t('modal.positionInChain')}
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {prevPerson ? (
                  <button
                    onClick={() => onNavigateToPerson(prevPerson)}
                    className="p-2 bg-white rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <div className="text-[10px] text-neutral-500 mb-0.5">← {t('modal.previous')}</div>
                    <div className="font-semibold text-xs text-neutral-800 line-clamp-1">{prevPerson.name}</div>
                    <div className="text-[10px] text-neutral-600">{prevPerson.born}–{prevPerson.died === 9999 ? t('person.today') : prevPerson.died}</div>
                  </button>
                ) : (
                  <div className="p-2 bg-neutral-100 rounded-lg opacity-50">
                    <div className="text-[10px] text-neutral-500">← {t('modal.start')}</div>
                  </div>
                )}
                
                {nextPerson ? (
                  <button
                    onClick={() => onNavigateToPerson(nextPerson)}
                    className="p-2 bg-white rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <div className="text-[10px] text-neutral-500 mb-0.5">{t('modal.next')} →</div>
                    <div className="font-semibold text-xs text-neutral-800 line-clamp-1">{nextPerson.name}</div>
                    <div className="text-[10px] text-neutral-600">{nextPerson.born}–{nextPerson.died === 9999 ? t('person.today') : nextPerson.died}</div>
                  </button>
                ) : (
                  <div className="p-2 bg-neutral-100 rounded-lg opacity-50">
                    <div className="text-[10px] text-neutral-500">{t('modal.end')} →</div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Known Relations - Compact */}
        {relations[selectedPerson.qid]?.knew && relations[selectedPerson.qid].knew.length > 0 && (
          <div className="mb-2">
            <h4 className="font-bold text-xs mb-1.5 flex items-center gap-1 text-neutral-800">
              <Users className="w-3 h-3" />
              {t('modal.knownPeople')}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
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
                    className="flex items-center gap-1.5 p-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <div className="flex-shrink-0">
                      {rel.type.includes('Lehrer') ? <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> : 
                       rel.type.includes('Freund') ? <Handshake className="w-3.5 h-3.5 text-purple-600" /> : 
                       rel.type.includes('Schüler') ? <BookOpen className="w-3.5 h-3.5 text-purple-600" /> : <UserCircle className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-neutral-800 truncate">{rel.name}</div>
                      <div className="text-[10px] text-neutral-600 truncate">{rel.type}</div>
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
              <div className="mb-2">
                <h4 className="font-bold text-xs mb-1.5 flex items-center gap-1 text-neutral-800">
                  <Clock className="w-3 h-3" />
                  {t('modal.contemporaries')}
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {contemporaries.map(p => (
                    <button
                      key={p.qid}
                      onClick={() => onNavigateToPerson(p)}
                      className="p-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all text-left"
                    >
                      <div className="font-semibold text-neutral-800 text-xs truncate">{p.name}</div>
                      <div className="text-[10px] text-neutral-600">{p.born}–{p.died === 9999 ? t('person.today') : p.died}</div>
                      {p.domains && p.domains[0] && (
                        <div className="text-[10px] text-purple-600 mt-0.5 truncate">{getOccupation(p)}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Actions - Compact */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-white hover:bg-neutral-50 rounded-lg transition-all font-bold text-neutral-700 text-xs border-2 border-neutral-200 hover:border-neutral-300 shadow-sm hover:shadow-md"
          >
            {t('modal.close')}
          </button>
          {!chain.find(p => p.qid === selectedPerson.qid) && (
            <button
              onClick={onStartNewChain}
              className="flex-1 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 font-bold text-xs hover:scale-105 flex items-center justify-center gap-1"
            >
              <Link className="w-3 h-3" />
              {t('modal.startNewChain')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


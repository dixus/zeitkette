import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { getOccupation } from '../../utils';

/**
 * SearchModal Component
 * Full-screen modal for searching people by name or domain
 */
export function SearchModal({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  people,
  onSelectPerson 
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-0 md:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="modal-container bg-gradient-to-br from-white via-purple-50/30 to-white rounded-none md:rounded-2xl p-4 md:p-6 max-w-2xl w-full min-h-screen md:min-h-0 shadow-2xl border-0 md:border-2 border-white animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 md:mb-4">
          <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 text-neutral-900 flex items-center gap-2">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            {t('search.title')}
          </h3>
          <p className="text-xs md:text-sm text-neutral-600">{t('search.placeholder')}</p>
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all mb-3 md:mb-4 text-base md:text-lg"
          autoFocus
        />
        
        <div className="max-h-[calc(100vh-200px)] md:max-h-96 overflow-y-auto space-y-2">
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
                onClick={() => onSelectPerson(person)}
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
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-semibold transition-all"
        >
          {t('modal.close')}
        </button>
      </div>
    </div>
  );
}


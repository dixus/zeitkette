import { Globe, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { SearchModal } from '../modals/SearchModal';
import { useState, useMemo } from 'react';

/**
 * LandingPage Component
 * Initial screen for mode selection and person selection
 */
export function LandingPage({
  chainMode,
  setChainMode,
  targetPerson,
  setTargetPerson,
  startPerson,
  setStartPerson,
  endPerson,
  setEndPerson,
  setShowLanding,
  people,
  relations,
  popularTargets
}) {
  const { t, i18n } = useTranslation();
  
  // Search modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalTarget, setSearchModalTarget] = useState('target'); // 'target', 'start', or 'end'
  
  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return people
      .filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.domains.some(d => d.toLowerCase().includes(query))
      )
      .slice(0, 50); // Limit to 50 results for performance
  }, [people, searchQuery]);
  
  const handleSelectPerson = (person) => {
    if (searchModalTarget === 'target') {
      setTargetPerson(person);
    } else if (searchModalTarget === 'start') {
      setStartPerson(person);
    } else if (searchModalTarget === 'end') {
      setEndPerson(person);
    }
    setShowSearchModal(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4 md:p-6 relative">
      {/* Language Switcher - Top Right */}
      <button
        onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
        className="fixed top-3 right-3 z-50 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-xs"
        title={`Switch to ${i18n.language === 'en' ? 'Deutsch' : 'English'}`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="text-sm">{i18n.language === 'en' ? '🇩🇪' : '🇬🇧'}</span>
      </button>
      
      <div className="max-w-4xl w-full">
        {/* Hero */}
        <div className="text-center mb-4 animate-fade-in">
          <div className="text-3xl mb-2 animate-bounce drop-shadow-lg">⏳</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
            {t('app.name')}
          </h1>
          <p className="text-lg md:text-xl font-bold text-neutral-800 mb-2 leading-tight">
            {t('landing.title')}
          </p>
          <p className="text-sm md:text-base text-neutral-600 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="glass-strong rounded-2xl p-4 mb-4 shadow-2xl animate-scale-in">
          <h2 className="text-base font-bold text-center mb-3 text-neutral-800">{t('landing.modeTitle')}</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setChainMode('toToday')}
              className={`p-3 rounded-xl border-2 transition-all ${
                chainMode === 'toToday'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white border-violet-600 shadow-lg scale-105'
                  : 'bg-white/90 text-neutral-800 border-neutral-300 hover:border-purple-400'
              }`}
            >
              <div className="text-xl mb-1">📅</div>
              <div className="font-bold text-xs">{t('landing.modeToToday')}</div>
              <div className="text-[10px] mt-0.5 opacity-90">{t('landing.modeToTodayDesc')}</div>
            </button>
            <button
              onClick={() => setChainMode('between')}
              className={`p-3 rounded-xl border-2 transition-all ${
                chainMode === 'between'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white border-violet-600 shadow-lg scale-105'
                  : 'bg-white/90 text-neutral-800 border-neutral-300 hover:border-purple-400'
              }`}
            >
              <div className="text-xl mb-1">🔗</div>
              <div className="font-bold text-xs">{t('landing.modeBetween')}</div>
              <div className="text-[10px] mt-0.5 opacity-90">{t('landing.modeBetweenDesc')}</div>
            </button>
          </div>
        </div>

        {/* Target Selection */}
        <div className="glass-strong rounded-2xl p-4 md:p-5 shadow-2xl animate-scale-in mb-4">
          <h2 className="text-base md:text-lg font-bold text-center mb-4 flex items-center justify-center gap-2 text-neutral-800">
            <Sparkles className="w-4 h-4 text-yellow-500 drop-shadow" />
            {chainMode === 'toToday' ? t('landing.selectPerson') : t('landing.startPerson') + ' & ' + t('landing.endPerson')}
          </h2>
          
          {chainMode === 'toToday' ? (
            // Single person selector for "To Today" mode
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
            {popularTargets.map((target) => (
              <button
                key={target.name}
                onClick={() => {
                  setTargetPerson(target.name);
                  setShowLanding(false);
                }}
                  className="group p-3 md:p-4 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white hover:border-purple-400 hover:-translate-y-1"
              >
                  <div className="mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    <PersonAvatar person={target.person} size="md" className="rounded-xl" />
                  </div>
                  <div className="font-bold text-xs mb-0.5 text-neutral-800">{target.name}</div>
                  <div className="text-[10px] text-purple-600 font-medium">{target.era}</div>
              </button>
            ))}
            </div>
          ) : (
            // Dual person selector for "Between" mode
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Start Person */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border-2 border-violet-300">
                  <div className="text-xs font-bold mb-1.5 text-violet-700 flex items-center gap-1.5">
                    <span>🎯</span> {t('landing.startPerson')}
                  </div>
                  <button
                    onClick={() => {
                      setSearchModalTarget('start');
                      setShowSearchModal(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border-2 border-violet-300 hover:border-violet-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-xs bg-white font-medium text-violet-700 hover:text-violet-800 text-left"
                  >
                    {typeof startPerson === 'string' ? startPerson : startPerson?.name || '🔍 ' + t('search.title')}
                  </button>
          </div>

                {/* End Person */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border-2 border-fuchsia-300">
                  <div className="text-xs font-bold mb-1.5 text-fuchsia-700 flex items-center gap-1.5">
                    <span>🏁</span> {t('landing.endPerson')}
                  </div>
                  <button
                    onClick={() => {
                      setSearchModalTarget('end');
                      setShowSearchModal(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border-2 border-fuchsia-300 hover:border-fuchsia-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all text-xs bg-white font-medium text-fuchsia-700 hover:text-fuchsia-800 text-left"
                  >
                    {typeof endPerson === 'string' ? endPerson : endPerson?.name || '🔍 ' + t('search.title')}
                  </button>
                </div>
              </div>
              
              {/* Quick suggestions for "Between" mode */}
          <div className="text-center">
                <p className="text-[10px] text-neutral-600 mb-1.5 font-medium">{t('landing.quickConnections')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => {
                      setStartPerson('Leonardo da Vinci');
                      setEndPerson('Albert Einstein');
                    }}
                    className="px-2.5 py-0.5 bg-white/90 rounded-full text-[10px] font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                  >
                    {t('landing.daVinciEinstein')}
                  </button>
                  <button
                    onClick={() => {
                      setStartPerson('Kleopatra');
                      setEndPerson('Napoleon Bonaparte');
                    }}
                    className="px-2.5 py-0.5 bg-white/90 rounded-full text-[10px] font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                  >
                    {t('landing.cleopatraNapoleon')}
                  </button>
                  <button
                    onClick={() => {
                      setStartPerson('Aristoteles');
                      setEndPerson('Isaac Newton');
                    }}
                    className="px-2.5 py-0.5 bg-white/90 rounded-full text-[10px] font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                  >
                    {t('landing.aristotleNewton')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {chainMode === 'toToday' && (
            <div className="text-center">
              <p className="text-xs text-neutral-600 mb-2 font-medium">{t('landing.orChooseFrom', { count: people.length })}</p>
              <button
                onClick={() => {
                  setSearchModalTarget('target');
                  setShowSearchModal(true);
                }}
                className="px-4 py-2 rounded-lg border-2 border-purple-300 hover:border-purple-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm bg-white/90 backdrop-blur-sm font-medium text-purple-700 hover:text-purple-800"
              >
                🔍 {t('search.title')} ({people.length} {t('stats.peopleInChain').replace(' in der Kette', '').replace(' in Chain', '')})
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowLanding(false)}
          className="w-full py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-base md:text-lg font-bold rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
        >
          <span className="drop-shadow-lg">
            {t('landing.goButton')}
          </span>
      </button>

        {/* Stats Preview */}
        <div className="mt-4 grid grid-cols-3 gap-2 md:gap-3 text-center">
          <div className="glass rounded-xl p-2.5 hover:scale-105 transition-transform duration-300">
            <div className="text-lg md:text-xl font-bold text-purple-600 mb-0.5">{people.length}</div>
            <div className="text-[10px] text-neutral-600 font-medium">{t('stats.peopleInChain').replace(' in der Kette', '').replace(' in Chain', '')}</div>
          </div>
          <div className="glass rounded-xl p-2.5 hover:scale-105 transition-transform duration-300">
            <div className="text-lg md:text-xl font-bold text-violet-600 mb-0.5">2654</div>
            <div className="text-[10px] text-neutral-600 font-medium">{t('stats.yearsSpanned').replace(' überbrückt', '').replace(' Spanned', '')}</div>
          </div>
          <div className="glass rounded-xl p-2.5 hover:scale-105 transition-transform duration-300">
            <div className="text-lg md:text-xl font-bold text-fuchsia-600 mb-0.5">{Object.keys(relations).length}</div>
            <div className="text-[10px] text-neutral-600 font-medium">{t('modal.relations')}</div>
          </div>
        </div>
      </div>
      
      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        people={people}
        onSelectPerson={handleSelectPerson}
      />
    </div>
  );
}


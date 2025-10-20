import { Globe, Sparkles, Clock, Target, Flag, Link, Search, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { SearchModal } from '../modals/SearchModal';
import { Footer } from '../ui/Footer';
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex flex-col relative">
      {/* Language Switcher - Top Right */}
      <button
        onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
        className="fixed top-3 right-3 z-50 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-xs"
        title={`Switch to ${i18n.language === 'en' ? 'Deutsch' : 'English'}`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="text-sm">{i18n.language === 'en' ? '🇩🇪' : '🇬🇧'}</span>
      </button>
      
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-4xl w-full">
        {/* Hero */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="mb-3 animate-bounce drop-shadow-lg">
            <Clock className="w-12 h-12 mx-auto text-purple-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
            {t('app.name')}
          </h1>
          <p className="text-xl md:text-2xl font-bold text-neutral-800 mb-3 leading-tight">
            {t('landing.title')}
          </p>
          <p className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            {t('landing.subtitle')}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="glass-strong rounded-2xl p-5 mb-6 shadow-2xl animate-scale-in">
          <h2 className="text-lg font-bold text-center mb-4 text-neutral-800">{t('landing.modeTitle')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setChainMode('toToday')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                chainMode === 'toToday'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white border-violet-600 shadow-lg scale-105'
                  : 'bg-white/90 text-neutral-800 border-neutral-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <div className="mb-2 flex justify-center">
                <Calendar className={`w-7 h-7 ${chainMode === 'toToday' ? 'text-white' : 'text-purple-600'}`} />
              </div>
              <div className="font-bold text-sm">{t('landing.modeToToday')}</div>
              <div className="text-xs mt-1 opacity-90 leading-tight">{t('landing.modeToTodayDesc')}</div>
            </button>
            <button
              onClick={() => setChainMode('between')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                chainMode === 'between'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white border-violet-600 shadow-lg scale-105'
                  : 'bg-white/90 text-neutral-800 border-neutral-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <div className="mb-2 flex justify-center">
                <Link className={`w-7 h-7 ${chainMode === 'between' ? 'text-white' : 'text-purple-600'}`} />
              </div>
              <div className="font-bold text-sm">{t('landing.modeBetween')}</div>
              <div className="text-xs mt-1 opacity-90 leading-tight">{t('landing.modeBetweenDesc')}</div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            {popularTargets.map((target, idx) => (
              <button
                key={target.name}
                onClick={() => {
                  setTargetPerson(target.name);
                  setShowLanding(false);
                }}
                className="group p-4 md:p-5 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white hover:border-purple-400 hover:-translate-y-1"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <PersonAvatar person={target.person} size="lg" className="rounded-xl shadow-md" />
                </div>
                <div className="font-bold text-sm mb-1 text-neutral-800 group-hover:text-purple-700 transition-colors">{target.name}</div>
                <div className="text-xs text-purple-600 font-medium">{target.era}</div>
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
                    <Target className="w-3 h-3" /> {t('landing.startPerson')}
                  </div>
                  <button
                    onClick={() => {
                      setSearchModalTarget('start');
                      setShowSearchModal(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border-2 border-violet-300 hover:border-violet-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-xs bg-white font-medium text-violet-700 hover:text-violet-800 text-left"
                  >
                    {typeof startPerson === 'string' ? startPerson : startPerson?.name || (
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3" /> {t('search.title')}
                      </span>
                    )}
                  </button>
          </div>

                {/* End Person */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border-2 border-fuchsia-300">
                  <div className="text-xs font-bold mb-1.5 text-fuchsia-700 flex items-center gap-1.5">
                    <Flag className="w-3 h-3" /> {t('landing.endPerson')}
                  </div>
                  <button
                    onClick={() => {
                      setSearchModalTarget('end');
                      setShowSearchModal(true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border-2 border-fuchsia-300 hover:border-fuchsia-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all text-xs bg-white font-medium text-fuchsia-700 hover:text-fuchsia-800 text-left"
                  >
                    {typeof endPerson === 'string' ? endPerson : endPerson?.name || (
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3" /> {t('search.title')}
                      </span>
                    )}
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
                <span className="flex items-center gap-1.5">
                  <Search className="w-4 h-4" /> {t('search.title')} ({people.length} {t('stats.peopleInChain').replace(' in der Kette', '').replace(' in Chain', '')})
                </span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowLanding(false)}
          className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-lg md:text-xl font-bold rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] group"
        >
          <span className="drop-shadow-lg flex items-center justify-center gap-3">
            <Target className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            {t('landing.goButton')}
          </span>
        </button>

        {/* Stats Preview */}
        <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4 text-center">
          <div className="glass-strong rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg group">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1 group-hover:text-purple-700 transition-colors">{people.length}</div>
            <div className="text-sm text-neutral-600 font-medium">{t('stats.peopleInChain').replace(' in der Kette', '').replace(' in Chain', '')}</div>
          </div>
          <div className="glass-strong rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg group">
            <div className="text-2xl md:text-3xl font-bold text-violet-600 mb-1 group-hover:text-violet-700 transition-colors">2654</div>
            <div className="text-sm text-neutral-600 font-medium">{t('stats.yearsSpanned').replace(' überbrückt', '').replace(' Spanned', '')}</div>
          </div>
          <div className="glass-strong rounded-xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg group">
            <div className="text-2xl md:text-3xl font-bold text-fuchsia-600 mb-1 group-hover:text-fuchsia-700 transition-colors">{Object.keys(relations).length}</div>
            <div className="text-sm text-neutral-600 font-medium">{t('modal.relations')}</div>
          </div>
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

      {/* Footer */}
      <Footer />
    </div>
  );
}


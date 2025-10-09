import { List, BarChart3, Network, RotateCcw, Search, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Header Component
 * Top navigation bar with app title, view mode toggles, and action buttons
 */
export function Header({
  chainMode,
  targetPerson,
  startPerson,
  endPerson,
  viewMode,
  setViewMode,
  onShowLanding,
  onShowSearch,
  onShowYearExplorer
}) {
  const { t, i18n } = useTranslation();

  return (
    <header className="sticky top-0 z-20 glass-strong border-b border-white/30 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-1">
              {t('app.name')}
            </h1>
            <p className="text-sm md:text-lg text-neutral-700 font-semibold truncate">
              {chainMode === 'toToday' ? (
                <>{t('header.to')} <strong className="text-purple-700">{typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}</strong></>
              ) : (
                <><strong className="text-violet-700">{typeof startPerson === 'string' ? startPerson : startPerson?.name}</strong> → <strong className="text-fuchsia-700">{typeof endPerson === 'string' ? endPerson : endPerson?.name}</strong></>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 flex-wrap md:flex-nowrap">
            {/* View Toggle */}
            <div className="flex items-center gap-0.5 md:gap-1 bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl p-0.5 md:p-1 border-2 border-white">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 md:px-3 py-1.5 md:py-2 rounded-md md:rounded-lg transition-all flex items-center gap-1.5 md:gap-2 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                title={t('views.listView')}
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-semibold">{t('views.list')}</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-2 md:px-3 py-1.5 md:py-2 rounded-md md:rounded-lg transition-all flex items-center gap-1.5 md:gap-2 ${
                  viewMode === 'timeline' 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                title={t('views.timelineView')}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-semibold">{t('views.timeline')}</span>
              </button>
              <button
                onClick={() => setViewMode('network')}
                className={`px-2 md:px-3 py-1.5 md:py-2 rounded-md md:rounded-lg transition-all flex items-center gap-1.5 md:gap-2 ${
                  viewMode === 'network' 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                title={t('views.networkView')}
              >
                <Network className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-semibold">{t('views.network')}</span>
              </button>
            </div>
            
          <button
            onClick={onShowLanding}
              className="px-3 md:px-5 py-2 md:py-3 bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 md:gap-2 border-2 border-white hover:border-purple-300 active:scale-95 md:hover:scale-105 font-semibold text-sm md:text-base"
              title="Keyboard shortcut: R"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{t('header.otherPerson')}</span>
            </button>
            
            <button
              onClick={onShowSearch}
              className="px-3 md:px-5 py-2 md:py-3 bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 md:gap-2 border-2 border-white hover:border-purple-300 active:scale-95 md:hover:scale-105 font-semibold text-sm md:text-base"
              title="Keyboard shortcut: /"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{t('header.search')}</span>
            </button>
            
            {/* Year Explorer */}
            <button
              onClick={onShowYearExplorer}
              className="px-3 md:px-5 py-2 md:py-3 bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 md:gap-2 border-2 border-white hover:border-purple-300 active:scale-95 md:hover:scale-105 font-semibold text-sm md:text-base"
              title={t('yearExplorer.shortcut')}
            >
              <span className="text-lg md:text-xl">🗓️</span>
              <span className="hidden sm:inline">{t('yearExplorer.title').replace('🗓️ ', '')}</span>
            </button>
            
            {/* Language Switcher */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
              className="px-2.5 md:px-4 py-2 md:py-3 bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 md:gap-2 border-2 border-white hover:border-purple-300 active:scale-95 md:hover:scale-105 font-semibold text-sm md:text-base"
              title={`Switch to ${i18n.language === 'en' ? 'Deutsch' : 'English'}`}
            >
              <Globe className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-base md:text-lg">{i18n.language === 'en' ? '🇩🇪' : '🇬🇧'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


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
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-1.5 md:py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-0.5 leading-tight">
              {t('app.name')}
            </h1>
            <p className="text-[10px] md:text-xs text-neutral-700 font-semibold truncate">
              {chainMode === 'toToday' ? (
                <>{t('header.to')} <strong className="text-purple-700">{typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}</strong></>
              ) : (
                <><strong className="text-violet-700">{typeof startPerson === 'string' ? startPerson : startPerson?.name}</strong> → <strong className="text-fuchsia-700">{typeof endPerson === 'string' ? endPerson : endPerson?.name}</strong></>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5 flex-wrap md:flex-nowrap">
            {/* View Toggle */}
            <div className="flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-md p-0.5 border border-white">
              <button
                onClick={() => setViewMode('list')}
                className={`px-1.5 py-1 rounded-sm transition-all flex items-center gap-1 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                title={t('views.listView')}
              >
                <List className="w-3 h-3" />
                <span className="hidden md:inline text-[10px] font-semibold">{t('views.list')}</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-1.5 py-1 rounded-sm transition-all flex items-center gap-1 ${
                  viewMode === 'timeline' 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                title={t('views.timelineView')}
              >
                <BarChart3 className="w-3 h-3" />
                <span className="hidden md:inline text-[10px] font-semibold">{t('views.timeline')}</span>
              </button>
              <button
                onClick={() => setViewMode('network')}
                className={`px-1.5 py-1 rounded-sm transition-all flex items-center gap-1 ${
                  viewMode === 'network' 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                title={t('views.networkView')}
              >
                <Network className="w-3 h-3" />
                <span className="hidden md:inline text-[10px] font-semibold">{t('views.network')}</span>
              </button>
            </div>
            
          <button
            onClick={onShowLanding}
              className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md hover:shadow-lg transition-all duration-300 flex items-center gap-1 border border-white hover:border-purple-300 active:scale-95 md:hover:scale-105 font-semibold text-[10px]"
              title="Keyboard shortcut: R"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">{t('header.otherPerson')}</span>
            </button>
            
            <button
              onClick={onShowSearch}
              className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md hover:shadow-lg transition-all duration-300 flex items-center gap-1 border border-white hover:border-purple-300 active:scale-95 md:hover:scale-105 font-semibold text-[10px]"
              title="Keyboard shortcut: /"
            >
              <Search className="w-3 h-3" />
              <span className="hidden sm:inline">{t('header.search')}</span>
            </button>
            
            {/* Year Explorer */}
            <button
              onClick={onShowYearExplorer}
              className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md hover:shadow-lg transition-all duration-300 flex items-center gap-1 border border-white hover:border-purple-300 active:scale-95 md:hover:scale-105 font-semibold text-[10px]"
              title={t('yearExplorer.shortcut')}
            >
              <span className="text-xs">🗓️</span>
              <span className="hidden sm:inline">{t('yearExplorer.title').replace('🗓️ ', '')}</span>
            </button>
            
            {/* Language Switcher */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
              className="px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md hover:shadow-lg transition-all duration-300 flex items-center gap-1 border border-white hover:border-purple-300 active:scale-95 md:hover:scale-105 font-semibold text-[10px]"
              title={`Switch to ${i18n.language === 'en' ? 'Deutsch' : 'English'}`}
            >
              <Globe className="w-3 h-3" />
              <span className="text-xs">{i18n.language === 'en' ? '🇩🇪' : '🇬🇧'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


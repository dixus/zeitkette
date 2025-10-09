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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-1">
              {t('app.name')}
            </h1>
            <p className="text-base md:text-lg text-neutral-700 font-semibold">
              {chainMode === 'toToday' ? (
                <>{t('header.to')} <strong className="text-purple-700">{typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}</strong></>
              ) : (
                <><strong className="text-violet-700">{typeof startPerson === 'string' ? startPerson : startPerson?.name}</strong> → <strong className="text-fuchsia-700">{typeof endPerson === 'string' ? endPerson : endPerson?.name}</strong></>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl p-1 border-2 border-white">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
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
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
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
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
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
              className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
              title="Keyboard shortcut: R"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="hidden sm:inline">{t('header.otherPerson')}</span>
            </button>
            
            <button
              onClick={onShowSearch}
              className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
              title="Keyboard shortcut: /"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">{t('header.search')}</span>
            </button>
            
            {/* Year Explorer */}
            <button
              onClick={onShowYearExplorer}
              className="px-5 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
              title={t('yearExplorer.shortcut')}
            >
              <span className="text-xl">🗓️</span>
              <span className="hidden sm:inline">{t('yearExplorer.title').replace('🗓️ ', '')}</span>
            </button>
            
            {/* Language Switcher */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
              className="px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
              title={`Switch to ${i18n.language === 'en' ? 'Deutsch' : 'English'}`}
            >
              <Globe className="w-5 h-5" />
              <span className="text-lg">{i18n.language === 'en' ? '🇩🇪' : '🇬🇧'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


import { List, BarChart3, Network, RotateCcw, Search, Globe, Calendar } from 'lucide-react';
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
    <header className="sticky top-0 z-20 glass-strong border-b border-white/20 backdrop-blur-xl shadow-sm">
      <div className="max-w-4xl mx-auto px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Title - Compact */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={onShowLanding}
              className="text-sm font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent hover:scale-105 transition-transform whitespace-nowrap"
              title={t('header.otherPerson')}
            >
              {t('app.name')}
            </button>
            <div className="h-3 w-px bg-purple-300"></div>
            <p className="text-[11px] text-neutral-600 font-medium truncate">
              {chainMode === 'toToday' ? (
                <span className="text-purple-700 font-semibold">{typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}</span>
              ) : (
                <><span className="text-violet-700 font-semibold">{typeof startPerson === 'string' ? startPerson : startPerson?.name}</span> → <span className="text-fuchsia-700 font-semibold">{typeof endPerson === 'string' ? endPerson : endPerson?.name}</span></>
              )}
            </p>
          </div>
          {/* Actions - Ultra Compact */}
          <div className="flex items-center gap-1">
            {/* View Toggle - Minimal */}
            <div className="flex items-center gap-px bg-white/80 backdrop-blur-sm rounded-md p-px">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
                }`}
                title={t('views.listView')}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'timeline' 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
                }`}
                title={t('views.timelineView')}
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('network')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'network' 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
                }`}
                title={t('views.networkView')}
              >
                <Network className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Utility Buttons - Icon Only */}
            <button
              onClick={onShowSearch}
              className="p-1.5 bg-white/80 backdrop-blur-sm rounded-md hover:bg-white hover:shadow-sm transition-all text-neutral-600 hover:text-purple-600"
              title="Search (Press /)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={onShowYearExplorer}
              className="p-1.5 bg-white/80 backdrop-blur-sm rounded-md hover:bg-white hover:shadow-sm transition-all"
              title={t('yearExplorer.title')}
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
              className="p-1.5 bg-white/80 backdrop-blur-sm rounded-md hover:bg-white hover:shadow-sm transition-all"
              title={`Switch to ${i18n.language === 'en' ? 'Deutsch' : 'English'}`}
            >
              <span className="text-sm">{i18n.language === 'en' ? '🇩🇪' : '🇬🇧'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


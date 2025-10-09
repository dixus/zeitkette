import { useTranslation } from 'react-i18next';

/**
 * StatsBar Component
 * Displays chain statistics and filter controls
 */
export function StatsBar({
  chain,
  lifetimeCount,
  totalYears,
  minOverlapYears,
  setMinOverlapYears,
  minFame,
  setMinFame,
  pinnedWaypoints,
  setPinnedWaypoints
}) {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 md:gap-4">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="glass-strong rounded-xl md:rounded-2xl p-3 md:p-6 hover:scale-105 active:scale-95 transition-transform duration-300 flex flex-col items-center justify-center">
            <div className="text-3xl md:text-5xl font-extrabold bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent mb-1 md:mb-2">{chain.length}</div>
            <div className="text-[10px] md:text-sm text-neutral-700 font-semibold text-center leading-tight">{t('stats.peopleInChain')}</div>
          </div>
          <div className="glass-strong rounded-xl md:rounded-2xl p-3 md:p-6 hover:scale-105 active:scale-95 transition-transform duration-300 flex flex-col items-center justify-center">
            <div className="text-3xl md:text-5xl font-extrabold bg-gradient-to-br from-violet-600 to-violet-400 bg-clip-text text-transparent mb-1 md:mb-2">{lifetimeCount}</div>
            <div className="text-[10px] md:text-sm text-neutral-700 font-semibold text-center leading-tight">{t('stats.lifetimesBack')}</div>
          </div>
          <div className="glass-strong rounded-xl md:rounded-2xl p-3 md:p-6 hover:scale-105 active:scale-95 transition-transform duration-300 flex flex-col items-center justify-center">
            <div className="text-3xl md:text-5xl font-extrabold bg-gradient-to-br from-fuchsia-600 to-fuchsia-400 bg-clip-text text-transparent mb-1 md:mb-2">{totalYears}</div>
            <div className="text-[10px] md:text-sm text-neutral-700 font-semibold text-center leading-tight">{t('stats.yearsSpanned')}</div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="glass-strong rounded-xl md:rounded-2xl p-3 md:p-6 space-y-3 md:space-y-4">
        {/* Overlap Control */}
          <div>
            <label className="block text-xs md:text-base font-bold text-neutral-800 mb-1.5 md:mb-2">
            {t('stats.minOverlap', { years: minOverlapYears })}
          </label>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={minOverlapYears}
            onChange={(e) => setMinOverlapYears(parseInt(e.target.value))}
            className="w-full h-2 md:h-2.5 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-lg appearance-none cursor-pointer slider touch-pan-y"
          />
            <div className="flex justify-between text-[10px] md:text-xs text-neutral-600 mt-1 font-medium">
            <span>{t('stats.overlapShort')}</span>
            <span>{t('stats.overlapRealistic')}</span>
          </div>
        </div>

          {/* Fame Control */}
          <div>
            <label className="block text-xs md:text-base font-bold text-neutral-800 mb-1.5 md:mb-2">
              {t('stats.minFame', { count: minFame })}
            </label>
            <input
              type="range"
              min="100"
              max="220"
              step="10"
              value={minFame}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                setMinFame(newValue);
              }}
              className="w-full h-2 md:h-2.5 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-lg appearance-none cursor-pointer slider touch-pan-y"
            />
            <div className="flex justify-between text-[10px] md:text-xs text-neutral-600 mt-1 font-medium">
              <span>{t('stats.fameLess')}</span>
              <span>{t('stats.fameVery')}</span>
      </div>
    </div>

          {/* Reset Edits Button */}
          {pinnedWaypoints.length > 0 && (
            <div className="pt-3 md:pt-4 border-t border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] md:text-xs text-purple-600 font-semibold">{t('stats.chainEdited')}</span>
                <span className="text-[10px] md:text-xs text-neutral-500">{t('stats.waypoints', { count: pinnedWaypoints.length })}</span>
              </div>
              <button
                onClick={() => setPinnedWaypoints([])}
                className="w-full px-3 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-lg text-xs md:text-sm font-semibold hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {t('stats.resetToOriginal')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


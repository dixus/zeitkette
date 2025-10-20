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
    <div className="max-w-4xl mx-auto px-3 py-2">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-1.5">
        <div className="grid grid-cols-3 gap-1.5">
          <div className="glass-strong rounded-lg p-1.5 hover:scale-[1.02] transition-transform flex flex-col items-center justify-center">
            <div className="text-lg font-extrabold bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent">{chain.length}</div>
            <div className="text-[9px] text-neutral-700 font-semibold text-center leading-tight">{t('stats.peopleInChain')}</div>
          </div>
          <div className="glass-strong rounded-lg p-1.5 hover:scale-[1.02] transition-transform flex flex-col items-center justify-center">
            <div className="text-lg font-extrabold bg-gradient-to-br from-violet-600 to-violet-400 bg-clip-text text-transparent">{lifetimeCount}</div>
            <div className="text-[9px] text-neutral-700 font-semibold text-center leading-tight">{t('stats.lifetimesBack')}</div>
          </div>
          <div className="glass-strong rounded-lg p-1.5 hover:scale-[1.02] transition-transform flex flex-col items-center justify-center">
            <div className="text-lg font-extrabold bg-gradient-to-br from-fuchsia-600 to-fuchsia-400 bg-clip-text text-transparent">{totalYears}</div>
            <div className="text-[9px] text-neutral-700 font-semibold text-center leading-tight">{t('stats.yearsSpanned')}</div>
          </div>
        </div>
        
        {/* Controls - Compact */}
        <div className="glass-strong rounded-lg p-2 space-y-1.5">
        {/* Overlap Control */}
          <div>
            <label className="block text-[9px] font-bold text-neutral-800 mb-0.5">
            {t('stats.minOverlap', { years: minOverlapYears })}
          </label>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={minOverlapYears}
            onChange={(e) => setMinOverlapYears(parseInt(e.target.value))}
            className="w-full h-1 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-lg appearance-none cursor-pointer slider touch-pan-y"
          />
            <div className="flex justify-between text-[8px] text-neutral-600 mt-0.5 font-medium">
            <span>{t('stats.overlapShort')}</span>
            <span>{t('stats.overlapRealistic')}</span>
          </div>
        </div>

          {/* Fame Control */}
          <div>
            <label className="block text-[9px] font-bold text-neutral-800 mb-0.5">
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
              className="w-full h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-lg appearance-none cursor-pointer slider touch-pan-y"
            />
            <div className="flex justify-between text-[8px] text-neutral-600 mt-0.5 font-medium">
              <span>{t('stats.fameLess')}</span>
              <span>{t('stats.fameVery')}</span>
      </div>
    </div>

          {/* Reset Edits Button */}
          {pinnedWaypoints.length > 0 && (
            <div className="pt-1.5 border-t border-purple-200">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] text-purple-600 font-semibold">{t('stats.chainEdited')}</span>
                <span className="text-[8px] text-neutral-500">{t('stats.waypoints', { count: pinnedWaypoints.length })}</span>
              </div>
              <button
                onClick={() => setPinnedWaypoints([])}
                className="w-full px-2 py-1 bg-white border-2 border-purple-300 text-purple-700 rounded-md text-[9px] font-semibold hover:bg-purple-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
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


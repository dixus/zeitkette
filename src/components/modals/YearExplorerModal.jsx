import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { THIS_YEAR, getOccupation } from '../../utils';

/**
 * YearExplorerModal Component
 * Allows users to explore people who lived in a specific year
 */
export function YearExplorerModal({
  isOpen,
  onClose,
  explorerYear,
  setExplorerYear,
  explorerDomain,
  setExplorerDomain,
  explorerFame,
  setExplorerFame,
  explorerPeople,
  showLanding,
  chain,
  onStartChain,
  onAddWaypoint,
  onPersonClick
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-0 md:p-4 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="modal-container bg-gradient-to-br from-white via-purple-50/30 to-white rounded-none md:rounded-2xl p-4 md:p-6 max-w-6xl w-full min-h-screen md:min-h-0 shadow-2xl border-0 md:border-2 border-white animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-3xl font-bold mb-2 text-neutral-900 flex items-center gap-2">
            <span className="text-3xl">🗓️</span>
            {t('yearExplorer.title').replace('🗓️ ', '')}
          </h3>
          <p className="text-sm text-neutral-600">{t('yearExplorer.subtitle')}</p>
        </div>
        
        {/* Year Slider */}
        <div className="mb-6 glass-strong rounded-2xl p-6">
          <label className="block text-xl font-bold text-neutral-800 mb-4">
            {t('yearExplorer.year', { year: explorerYear })}
          </label>
          <input
            type="range"
            min={-600}
            max={THIS_YEAR}
            step={10}
            value={explorerYear}
            onChange={(e) => setExplorerYear(parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="relative mt-2 h-4">
            <span className="absolute text-xs text-neutral-600 font-medium" style={{ left: '0%', transform: 'translateX(0%)' }}>600 BC</span>
            <span className="absolute text-xs text-neutral-600 font-medium" style={{ left: '22.86%', transform: 'translateX(-50%)' }}>0</span>
            <span className="absolute text-xs text-neutral-600 font-medium" style={{ left: '41.90%', transform: 'translateX(-50%)' }}>500</span>
            <span className="absolute text-xs text-neutral-600 font-medium" style={{ left: '60.95%', transform: 'translateX(-50%)' }}>1000</span>
            <span className="absolute text-xs text-neutral-600 font-medium" style={{ left: '80.00%', transform: 'translateX(-50%)' }}>1500</span>
            <span className="absolute text-xs text-neutral-600 font-medium" style={{ left: '99.05%', transform: 'translateX(-50%)' }}>2000</span>
            <span className="absolute text-xs text-neutral-600 font-medium" style={{ left: '100%', transform: 'translateX(-100%)' }}>{THIS_YEAR}</span>
          </div>
          
          {/* Era Label */}
          <div className="mt-4 text-center">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-full font-semibold text-sm">
              {explorerYear < 0 ? t('yearExplorer.era.ancient') :
               explorerYear < 500 ? t('yearExplorer.era.classical') :
               explorerYear < 1400 ? t('yearExplorer.era.medieval') :
               explorerYear < 1600 ? t('yearExplorer.era.renaissance') :
               explorerYear < 1800 ? t('yearExplorer.era.enlightenment') :
               explorerYear < 1900 ? t('yearExplorer.era.industrial') :
               explorerYear < 2000 ? t('yearExplorer.era.modern') :
               t('yearExplorer.era.contemporary')}
            </span>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Domain Filter */}
          <div className="glass rounded-xl p-4">
            <label className="block text-sm font-bold text-neutral-800 mb-2">
              {t('yearExplorer.filterByDomain')}
            </label>
            <select
              value={explorerDomain}
              onChange={(e) => setExplorerDomain(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white font-medium"
            >
              <option value="all">{t('yearExplorer.allDomains')}</option>
              <option value="Art">{t('domains.Art')}</option>
              <option value="Science">{t('domains.Science')}</option>
              <option value="Philosophy">{t('domains.Philosophy')}</option>
              <option value="Politics">{t('domains.Politics')}</option>
              <option value="Literature">{t('domains.Literature')}</option>
              <option value="Music">{t('domains.Music')}</option>
              <option value="Religion">{t('domains.Religion')}</option>
              <option value="Military">{t('domains.Military')}</option>
            </select>
          </div>
          
          {/* Fame Filter */}
          <div className="glass rounded-xl p-4">
            <label className="block text-sm font-bold text-neutral-800 mb-2">
              {t('yearExplorer.filterByFame')}
            </label>
            <select
              value={explorerFame}
              onChange={(e) => setExplorerFame(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border-2 border-neutral-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white font-medium"
            >
              <option value={0}>{t('yearExplorer.fameAny')}</option>
              <option value={140}>{t('yearExplorer.fameMedium')}</option>
              <option value={180}>{t('yearExplorer.fameHigh')}</option>
              <option value={220}>{t('yearExplorer.fameVeryHigh')}</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-4 text-center">
          <span className="text-lg font-semibold text-purple-700">
            {explorerPeople.length === 1 ? 
              t('yearExplorer.peopleAliveOne', { count: explorerPeople.length, year: explorerYear }) :
              t('yearExplorer.peopleAlive', { count: explorerPeople.length, year: explorerYear })}
          </span>
        </div>
        
        {/* People Grid */}
        <div className="max-h-[500px] overflow-y-auto space-y-3">
          {explorerPeople.length === 0 ? (
            <div className="text-center text-neutral-500 py-12">
              <div className="text-6xl mb-4">🤷</div>
              <p className="text-lg font-semibold">{t('yearExplorer.noPeople')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {explorerPeople.map(person => (
                <div
                  key={person.qid}
                  className="glass-strong rounded-xl p-4 hover:shadow-xl transition-all group cursor-pointer"
                  onClick={() => onPersonClick(person)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <PersonAvatar person={person} size="md" className="rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-neutral-800 group-hover:text-purple-600 transition-colors text-sm mb-1">
                        {person.name}
                      </div>
                      <div className="text-xs text-purple-600 font-medium mb-1">
                        {getOccupation(person)}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {person.born}–{person.died === 9999 ? t('person.today') : person.died}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => onStartChain(e, person)}
                      className="flex-1 px-2 py-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                      title={t('yearExplorer.actions.startChain', { name: person.name })}
                    >
                      🎯 {t('endMarker.newChain').replace('🔗 ', '').replace('Start ', '').replace('Starten', '').replace('Neue Kette ', '')}
                    </button>
                    {!showLanding && chain.length > 0 && (
                      <button
                        onClick={(e) => onAddWaypoint(e, person)}
                        className="px-3 py-1.5 bg-white border-2 border-purple-400 text-purple-600 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-all"
                        title={t('yearExplorer.actions.addWaypoint')}
                      >
                        ➕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-3 bg-neutral-200 hover:bg-neutral-300 rounded-xl font-semibold transition-colors"
        >
          {t('yearExplorer.closeButton')}
        </button>
      </div>
    </div>
  );
}


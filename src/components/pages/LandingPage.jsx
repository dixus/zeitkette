import { Globe, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4 md:p-6 relative">
      {/* Language Switcher - Top Right */}
      <button
        onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
        className="fixed top-4 right-4 z-50 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 border-2 border-white hover:border-purple-300 hover:scale-105 font-semibold text-base"
        title={`Switch to ${i18n.language === 'en' ? 'Deutsch' : 'English'}`}
      >
        <Globe className="w-5 h-5" />
        <span className="text-lg">{i18n.language === 'en' ? '🇩🇪' : '🇬🇧'}</span>
      </button>
      
      <div className="max-w-4xl w-full">
        {/* Hero */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-5xl mb-4 animate-bounce drop-shadow-lg">⏳</div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
            {t('app.name')}
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 leading-tight">
            {t('landing.title')}
          </p>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="glass-strong rounded-3xl p-6 mb-6 shadow-2xl animate-scale-in">
          <h2 className="text-lg font-bold text-center mb-4 text-neutral-800">{t('landing.modeTitle')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setChainMode('toToday')}
              className={`p-4 rounded-xl border-2 transition-all ${
                chainMode === 'toToday'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white border-violet-600 shadow-lg scale-105'
                  : 'bg-white/90 text-neutral-800 border-neutral-300 hover:border-purple-400'
              }`}
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-bold text-sm">{t('landing.modeToToday')}</div>
              <div className="text-xs mt-1 opacity-90">{t('landing.modeToTodayDesc')}</div>
            </button>
            <button
              onClick={() => setChainMode('between')}
              className={`p-4 rounded-xl border-2 transition-all ${
                chainMode === 'between'
                  ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white border-violet-600 shadow-lg scale-105'
                  : 'bg-white/90 text-neutral-800 border-neutral-300 hover:border-purple-400'
              }`}
            >
              <div className="text-2xl mb-2">🔗</div>
              <div className="font-bold text-sm">{t('landing.modeBetween')}</div>
              <div className="text-xs mt-1 opacity-90">{t('landing.modeBetweenDesc')}</div>
            </button>
          </div>
        </div>

        {/* Target Selection */}
        <div className="glass-strong rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-neutral-800">
            <Sparkles className="w-6 h-6 text-yellow-500 drop-shadow" />
            {chainMode === 'toToday' ? t('landing.selectPerson') : t('landing.startPerson') + ' & ' + t('landing.endPerson')}
          </h2>
          
          {chainMode === 'toToday' ? (
            // Single person selector for "To Today" mode
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            {popularTargets.map((target) => (
              <button
                key={target.name}
                onClick={() => {
                  setTargetPerson(target.name);
                  setShowLanding(false);
                }}
                  className="group p-4 md:p-6 bg-white/90 backdrop-blur-sm rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white hover:border-purple-400 hover:-translate-y-1"
                >
                  <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    <PersonAvatar person={target.person} size="lg" className="rounded-2xl" />
                  </div>
                  <div className="font-bold text-sm mb-1 text-neutral-800">{target.name}</div>
                  <div className="text-xs text-purple-600 font-medium">{target.era}</div>
              </button>
            ))}
            </div>
          ) : (
            // Dual person selector for "Between" mode
            <div className="space-y-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Person */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border-2 border-violet-300">
                  <div className="text-sm font-bold mb-2 text-violet-700 flex items-center gap-2">
                    <span>🎯</span> {t('landing.startPerson')}
                  </div>
                  <select
                    value={typeof startPerson === 'string' ? startPerson : startPerson?.name}
                    onChange={(e) => setStartPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-neutral-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-sm bg-white font-medium"
                  >
                    {people
                      .filter(p => p.died !== 9999)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(p => (
                        <option key={p.qid} value={p.name}>
                          {p.name} ({p.born}–{p.died})
                        </option>
                      ))}
                  </select>
          </div>

                {/* End Person */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border-2 border-fuchsia-300">
                  <div className="text-sm font-bold mb-2 text-fuchsia-700 flex items-center gap-2">
                    <span>🏁</span> {t('landing.endPerson')}
                  </div>
                  <select
                    value={typeof endPerson === 'string' ? endPerson : endPerson?.name}
                    onChange={(e) => setEndPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-neutral-300 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all text-sm bg-white font-medium"
                  >
                    {people
                      .filter(p => p.died !== 9999)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(p => (
                        <option key={p.qid} value={p.name}>
                          {p.name} ({p.born}–{p.died})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              
              {/* Quick suggestions for "Between" mode */}
          <div className="text-center">
                <p className="text-xs text-neutral-600 mb-2 font-medium">{t('landing.quickConnections')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => {
                      setStartPerson('Leonardo da Vinci');
                      setEndPerson('Albert Einstein');
                    }}
                    className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                  >
                    {t('landing.daVinciEinstein')}
                  </button>
                  <button
                    onClick={() => {
                      setStartPerson('Kleopatra');
                      setEndPerson('Napoleon Bonaparte');
                    }}
                    className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                  >
                    {t('landing.cleopatraNapoleon')}
                  </button>
                  <button
                    onClick={() => {
                      setStartPerson('Aristoteles');
                      setEndPerson('Isaac Newton');
                    }}
                    className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-all border border-purple-300"
                  >
                    {t('landing.aristotleNewton')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {chainMode === 'toToday' && (
            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-3 font-medium">{t('landing.orChooseFrom', { count: people.length })}</p>
            <select
                value={typeof targetPerson === 'string' ? targetPerson : targetPerson?.name}
              onChange={(e) => setTargetPerson(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-neutral-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all text-sm bg-white/90 backdrop-blur-sm font-medium"
            >
              {people
                .filter(p => p.died !== 9999)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(p => (
                  <option key={p.qid} value={p.name}>
                    {p.name} ({p.born}–{p.died})
                  </option>
                ))}
            </select>
          </div>
          )}
        </div>

        <button
          onClick={() => setShowLanding(false)}
          className="w-full py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-lg md:text-xl font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
        >
          <span className="drop-shadow-lg">
            {t('landing.goButton')}
          </span>
      </button>

        {/* Stats Preview */}
        <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4 text-center">
          <div className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">{people.length}</div>
            <div className="text-xs text-neutral-600 font-medium">{t('stats.peopleInChain').replace(' in der Kette', '').replace(' in Chain', '')}</div>
          </div>
          <div className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300">
            <div className="text-2xl md:text-3xl font-bold text-violet-600 mb-1">2654</div>
            <div className="text-xs text-neutral-600 font-medium">{t('stats.yearsSpanned').replace(' überbrückt', '').replace(' Spanned', '')}</div>
          </div>
          <div className="glass rounded-xl p-4 hover:scale-105 transition-transform duration-300">
            <div className="text-2xl md:text-3xl font-bold text-fuchsia-600 mb-1">{Object.keys(relations).length}</div>
            <div className="text-xs text-neutral-600 font-medium">{t('modal.relations')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


import { X, Github, Database, Zap, Users, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * AboutModal Component
 * Information about the project, data sources, and how it works
 */
export function AboutModal({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white via-purple-50/30 to-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl border-2 border-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-neutral-900">{t('footer.about')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Project Description */}
          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              {t('about.whatIsThis')}
            </h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {t('about.description')}
            </p>
          </section>

          {/* How it Works */}
          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              {t('about.howItWorks')}
            </h3>
            <p className="text-sm text-neutral-700 leading-relaxed mb-2">
              {t('about.algorithm')}
            </p>
            <ul className="text-sm text-neutral-700 space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>{t('about.step1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>{t('about.step2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>{t('about.step3')}</span>
              </li>
            </ul>
          </section>

          {/* Data Source */}
          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-600" />
              {t('about.dataSource')}
            </h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {t('about.wikidataInfo')}
            </p>
            <a
              href="https://www.wikidata.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
            >
              <Globe className="w-4 h-4" />
              wikidata.org
            </a>
          </section>

          {/* Technology */}
          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Github className="w-5 h-5 text-neutral-800" />
              {t('about.technology')}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">React</span>
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">Tailwind CSS</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">D3.js</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Vite</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Wikidata SPARQL</span>
            </div>
          </section>

          {/* Credits */}
          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-600" />
              {t('about.credits')}
            </h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {t('about.creditsText')}
            </p>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 font-bold"
          >
            {t('modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}


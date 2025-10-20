import { Info, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ImpressumModal } from '../modals/ImpressumModal';
import { AboutModal } from '../modals/AboutModal';

/**
 * Footer Component
 * Simple footer with legal and info links
 */
export function Footer() {
  const { t } = useTranslation();
  const [showImpressum, setShowImpressum] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <footer className="w-full border-t border-neutral-200 bg-white/80 backdrop-blur-sm mt-8">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-600">
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-1 hover:text-purple-600 transition-colors font-medium"
            >
              <Info className="w-3.5 h-3.5" />
              {t('footer.about')}
            </button>
            <span className="text-neutral-300">•</span>
            <button
              onClick={() => setShowImpressum(true)}
              className="flex items-center gap-1 hover:text-purple-600 transition-colors font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              {t('footer.impressum')}
            </button>
            <span className="text-neutral-300">•</span>
            <a
              href="https://www.wikidata.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-600 transition-colors font-medium"
            >
              {t('footer.dataSource')}
            </a>
          </div>
          <div className="text-center mt-2 text-[10px] text-neutral-400">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>

      <ImpressumModal isOpen={showImpressum} onClose={() => setShowImpressum(false)} />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}


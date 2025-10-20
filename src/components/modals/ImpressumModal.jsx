import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * ImpressumModal Component
 * Legal information required by German law (TMG §5)
 */
export function ImpressumModal({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-neutral-900">{t('footer.impressum')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="prose prose-sm max-w-none text-neutral-700 space-y-4">
          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Angaben gemäß § 5 TMG</h3>
            <p>
              Holger Kreissl<br />
              Weststr. 97<br />
              09116 Chemnitz<br />
              Deutschland
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Kontakt</h3>
            <p>
              E-Mail: kreissl@gmail.com<br />
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
            <p>
            Holger Kreissl<br />
            Weststr. 97<br />
            09116 Chemnitz<br />
            Deutschland
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Haftungsausschluss</h3>
            <h4 className="font-semibold text-neutral-800 mt-3 mb-1">Haftung für Inhalte</h4>
            <p className="text-sm">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
              nach den allgemeinen Gesetzen verantwortlich.
            </p>
            
            <h4 className="font-semibold text-neutral-800 mt-3 mb-1">Datenschutz</h4>
            <p className="text-sm">
              Diese Website verwendet keine Cookies und sammelt keine personenbezogenen Daten. 
              Alle Daten werden aus öffentlichen Quellen (Wikidata) bezogen und ausschließlich 
              lokal im Browser verarbeitet.
            </p>

            <h4 className="font-semibold text-neutral-800 mt-3 mb-1">Urheberrecht</h4>
            <p className="text-sm">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
              dem deutschen Urheberrecht. Die historischen Daten stammen aus Wikidata und stehen unter 
              der Creative Commons CC0 Lizenz.
            </p>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors font-medium"
          >
            {t('modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}


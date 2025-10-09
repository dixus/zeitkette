import { useTranslation } from 'react-i18next';

/**
 * KeyboardShortcuts Component
 * Shows available keyboard shortcuts in a floating panel
 */
export function KeyboardShortcuts({ showLanding }) {
  const { t } = useTranslation();

  if (showLanding) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <details className="group">
        <summary className="glass-strong rounded-xl px-4 py-2 cursor-pointer hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-sm list-none">
          <span>⌨️</span>
          <span className="hidden md:inline">{t('keyboard.title')}</span>
        </summary>
        <div className="absolute bottom-full right-0 mb-2 glass-strong rounded-xl p-4 w-64 shadow-xl animate-fade-in">
          <h4 className="font-bold mb-2 text-neutral-800">{t('keyboard.shortcutsTitle')}</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">/</kbd>
              <span className="text-neutral-700">{t('keyboard.search')}</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">Y</kbd>
              <span className="text-neutral-700">{t('yearExplorer.title').replace('🗓️ ', '')}</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">ESC</kbd>
              <span className="text-neutral-700">{t('keyboard.close')}</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">L</kbd>
              <span className="text-neutral-700">{t('keyboard.listView')}</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">T</kbd>
              <span className="text-neutral-700">{t('keyboard.timelineView')}</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">N</kbd>
              <span className="text-neutral-700">{t('keyboard.networkView')}</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-2 py-1 bg-white rounded font-mono text-xs">R</kbd>
              <span className="text-neutral-700">{t('keyboard.backToSelection')}</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}


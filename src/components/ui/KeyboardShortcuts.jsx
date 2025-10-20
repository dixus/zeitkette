import { useTranslation } from 'react-i18next';

/**
 * KeyboardShortcuts Component
 * Shows available keyboard shortcuts in a floating panel
 */
export function KeyboardShortcuts({ showLanding }) {
  const { t } = useTranslation();

  if (showLanding) return null;

  return (
    <div className="fixed bottom-3 right-3 z-40">
      <details className="group">
        <summary className="glass-strong rounded-lg px-3 py-1.5 cursor-pointer hover:shadow-md transition-all flex items-center gap-1.5 font-semibold text-xs list-none">
          <span>⌨️</span>
          <span className="hidden md:inline">{t('keyboard.title')}</span>
        </summary>
        <div className="absolute bottom-full right-0 mb-2 glass-strong rounded-lg p-3 w-56 shadow-lg animate-fade-in">
          <h4 className="font-bold mb-2 text-xs text-neutral-800">{t('keyboard.shortcutsTitle')}</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded font-mono text-[10px]">/</kbd>
              <span className="text-neutral-700 text-[11px]">{t('keyboard.search')}</span>
            </div>
            <div className="flex justify-between items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded font-mono text-[10px]">Y</kbd>
              <span className="text-neutral-700 text-[11px]">{t('yearExplorer.title').replace('🗓️ ', '')}</span>
            </div>
            <div className="flex justify-between items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded font-mono text-[10px]">ESC</kbd>
              <span className="text-neutral-700 text-[11px]">{t('keyboard.close')}</span>
            </div>
            <div className="flex justify-between items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded font-mono text-[10px]">L</kbd>
              <span className="text-neutral-700 text-[11px]">{t('keyboard.listView')}</span>
            </div>
            <div className="flex justify-between items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded font-mono text-[10px]">T</kbd>
              <span className="text-neutral-700 text-[11px]">{t('keyboard.timelineView')}</span>
            </div>
            <div className="flex justify-between items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded font-mono text-[10px]">N</kbd>
              <span className="text-neutral-700 text-[11px]">{t('keyboard.networkView')}</span>
            </div>
            <div className="flex justify-between items-center">
              <kbd className="px-1.5 py-0.5 bg-white rounded font-mono text-[10px]">R</kbd>
              <span className="text-neutral-700 text-[11px]">{t('keyboard.backToSelection')}</span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}


import { useEffect } from 'react';

/**
 * Hook to handle keyboard shortcuts
 * @param {Object} handlers - Object mapping keys to handler functions
 * @param {Array} deps - Dependencies for the effect
 */
export function useKeyboardShortcuts(handlers, deps = []) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const handler = handlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [...deps]);
}


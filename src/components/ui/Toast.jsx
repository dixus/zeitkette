import { useEffect, useState } from 'react';
import { CheckCircle, Copy } from 'lucide-react';

/**
 * Toast Component
 * Shows temporary notifications
 */
export function Toast({ message, show, onClose, duration = 3000 }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="glass-strong rounded-xl px-6 py-3 shadow-2xl border-2 border-green-300 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-neutral-800">{message}</span>
      </div>
    </div>
  );
}


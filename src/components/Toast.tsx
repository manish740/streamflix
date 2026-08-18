import React from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { CheckCircle2, Info, Heart, Trash2, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useWatchlist();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        return (
          <div
            key={toast.id}
            id={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-zinc-900/95 border border-zinc-800 text-white shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'favorite' && <Heart className="w-5 h-5 text-[#E50914] fill-[#E50914]" />}
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {toast.type === 'removed' && <Trash2 className="w-5 h-5 text-orange-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-zinc-400 mt-1 truncate">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

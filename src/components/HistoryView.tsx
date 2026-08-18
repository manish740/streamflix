import React from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { MovieCard } from './MovieCard';
import { EmptyState } from './LoadingSkeleton';
import { History, Trash2, Play, Calendar } from 'lucide-react';

interface HistoryViewProps {
  onExplore: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onExplore }) => {
  const { watchHistory, clearHistory, playMedia } = useWatchlist();

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#E50914]" />
            Viewing History
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Track your recently watched titles, resume playback, and manage activity
          </p>
        </div>

        {watchHistory.length > 0 && (
          <button
            id="clear-history-btn"
            onClick={clearHistory}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 hover:border-red-600 text-xs font-semibold text-zinc-300 hover:text-red-400 transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      {/* History Grid */}
      {watchHistory.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchHistory.map(item => (
              <div
                key={item.id}
                className="flex gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all group"
              >
                {/* Media Poster / Thumbnail */}
                <div
                  className="relative w-28 sm:w-32 aspect-[16/9] rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer"
                  onClick={() => playMedia(item.media)}
                >
                  <img
                    src={item.media.backdropUrl}
                    alt={item.media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 fill-white text-white" />
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-800">
                    <div
                      className="h-full bg-[#E50914]"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">{item.media.title}</h3>
                    {item.episodeTitle && (
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{item.episodeTitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                      <span className="text-[#E50914] font-semibold">{item.progressPercent}% completed</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.watchedAt)}
                    </span>
                    <button
                      onClick={() => playMedia(item.media)}
                      className="text-white hover:text-[#E50914] font-bold"
                    >
                      Resume →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<History className="w-8 h-8 text-[#E50914]" />}
          title="No Watch History Yet"
          description="Your stream history and continue-watching timestamps will be automatically saved here as you enjoy movies and series."
          actionText="Start Watching Now"
          onAction={onExplore}
        />
      )}
    </div>
  );
};

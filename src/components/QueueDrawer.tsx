import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Play, Pause, Trash2, X, Music, Disc3 } from 'lucide-react';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    currentQueueIndex,
    currentTrack,
    isPlaying,
    isQueueOpen,
    setIsQueueOpen,
    playQueueItem,
    togglePlay,
    removeFromQueue,
    clearQueue
  } = useMusic();

  if (!isQueueOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={() => setIsQueueOpen(false)}
    >
      <div
        className="w-full max-w-md h-full bg-[#0c0c0c] border-l border-zinc-800 shadow-2xl flex flex-col justify-between"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Music className="w-5 h-5 text-[#E50914]" />
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              Playback Queue
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="text-xs text-zinc-400 hover:text-red-400 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors flex items-center gap-1.5"
                title="Clear queue"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close queue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Now Playing Banner */}
        {currentTrack && (
          <div className="p-4 bg-gradient-to-r from-zinc-900 to-black border-b border-zinc-800/80 flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-zinc-700">
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={togglePlay}
                className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity hover:bg-black/70"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Disc3 className={`w-3.5 h-3.5 text-[#E50914] ${isPlaying ? 'animate-spin' : ''}`} />
                <span className="text-[10px] uppercase tracking-wider font-bold text-red-500">
                  Now Playing
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate">{currentTrack.title}</p>
              <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>
        )}

        {/* Queue Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-zinc-800/50 space-y-1">
          {queue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <Music className="w-12 h-12 mb-3 stroke-[1.5] text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-300">Your queue is empty</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Explore Live Discovery to add songs, soundtracks, and trending tracks.
              </p>
            </div>
          ) : (
            queue.map((track, idx) => {
              const isCurrent = currentTrack ? track.id === currentTrack.id : false;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playQueueItem(track, idx)}
                  className={`group py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-zinc-900 border border-[#E50914]/40 text-white'
                      : 'hover:bg-zinc-900/60 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold w-4 text-center text-zinc-500">
                      {idx + 1}
                    </span>

                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-md object-cover shrink-0 border border-zinc-800"
                      referrerPolicy="no-referrer"
                    />

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${
                          isCurrent ? 'text-[#E50914]' : 'text-white group-hover:text-red-400'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {track.duration || '3:30'}
                    </span>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

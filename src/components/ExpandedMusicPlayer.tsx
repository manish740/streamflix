import React from 'react';
import { useMusic } from '../context/MusicContext';
import { CURATED_MUSIC_TRACKS } from '../services/youtubeService';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Eye,
  Disc3
} from 'lucide-react';

export const ExpandedMusicPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isExpandedModalOpen,
    closeExpandedPlayer,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleMute,
    toggleFavorite,
    isFavorite,
    toggleQueue,
    playTrack
  } = useMusic();

  if (!isExpandedModalOpen || !currentTrack) return null;

  const trackId = currentTrack.videoId || currentTrack.id;
  const fav = isFavorite(trackId);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const similarTracks = CURATED_MUSIC_TRACKS.filter(
    t => (t.videoId || t.id) !== trackId
  ).slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in overflow-y-auto"
      onClick={closeExpandedPlayer}
    >
      <div
        className="relative w-full max-w-5xl bg-[#0c0c0c] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white">
              <Disc3 className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E50914] font-bold">
                StreamFlix Music Player
              </span>
              <h3 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                {currentTrack.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeExpandedPlayer}
              className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close player modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video / Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Main YouTube Video Anchor: PersistentPlayerHost anchors over this exact rect */}
          <div
            id="expanded-video-anchor"
            className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-zinc-800"
          >
            {/* Visual background placeholder before video positions */}
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
              <Disc3 className="w-12 h-12 text-zinc-700 animate-spin" />
            </div>
          </div>

          {/* Scrubbing & Progress Timeline */}
          <div className="space-y-1.5 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
            <div className="relative flex items-center group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#E50914] focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Playback Controls Row */}
            <div className="flex flex-wrap items-center justify-between pt-2">
              {/* Left: Track Info & Favorite */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleFavorite(trackId)}
                  className={`p-2 rounded-full border transition-all ${
                    fav
                      ? 'bg-[#E50914] border-[#E50914] text-white shadow-md'
                      : 'border-zinc-700 text-zinc-400 hover:text-white bg-black/50'
                  }`}
                  aria-label="Favorite track"
                >
                  <Heart className={`w-4 h-4 ${fav ? 'fill-white' : ''}`} />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate max-w-xs">{currentTrack.title}</p>
                  <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Center: Main Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={playPrevious}
                  className="p-2 text-zinc-300 hover:text-white transition-colors"
                  aria-label="Previous track"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-3.5 rounded-full bg-white hover:bg-zinc-200 text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? 'Pause track' : 'Play track'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-black" />
                  ) : (
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  )}
                </button>

                <button
                  onClick={playNext}
                  className="p-2 text-zinc-300 hover:text-white transition-colors"
                  aria-label="Next track"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Right: Volume & Queue */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-zinc-400 hover:text-white transition-colors p-1"
                    aria-label="Toggle mute"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-500" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#E50914]"
                  />
                </div>

                <button
                  onClick={toggleQueue}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title="Toggle Queue"
                >
                  <ListMusic className="w-4 h-4" />
                  <span className="hidden md:inline">Queue</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details & Recommended Sub-sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metadata & Description */}
            <div className="md:col-span-2 space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Track Details
                </span>
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {currentTrack.viewCount || '1.5M views'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {currentTrack.description ||
                  `Streaming official high quality audio and video for "${currentTrack.title}" by ${currentTrack.artist}. Powered by YouTube Data API.`}
              </p>
              {currentTrack.genre && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-zinc-500">Genre:</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                    {currentTrack.genre}
                  </span>
                </div>
              )}
            </div>

            {/* Up Next / Recommendations */}
            <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Up Next & Similar
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {similarTracks.map(sim => (
                  <div
                    key={sim.id}
                    onClick={() => playTrack(sim)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer transition-colors group"
                  >
                    <img
                      src={sim.thumbnailUrl || sim.thumbnail}
                      alt={sim.title}
                      className="w-10 h-10 rounded object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-red-400">
                        {sim.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">{sim.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

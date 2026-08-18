import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { YouTubePlayer } from './YouTubePlayer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  ListMusic,
  Heart,
  Headphones,
  Video
} from 'lucide-react';

export const MusicMiniPlayer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    currentTrack,
    isPlaying,
    activePlayer,
    currentTime,
    duration,
    volume,
    isMuted,
    isMiniPlayerVisible,
    closeMiniPlayer,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleQueue,
    toggleFavorite,
    isFavorite,
    audioPlayerRef,
    switchToAudio,
    switchToVideo,
    syncProgress,
    handleTrackEnded,
    handlePlayerPlay,
    handlePlayerPause
  } = useMusic();

  // Hide the floating mini bar on dedicated Audio or Video player pages to avoid duplicate UI
  const isVideoRoute = location.pathname === '/music/video';
  const isDedicatedPage =
    location.pathname === '/music/audio' || isVideoRoute;

  // IMPORTANT: Audio source MUST only be active/playing when activePlayer is 'audio' and NOT on Video page
  const isAudioActive = activePlayer === 'audio' && !isVideoRoute;

  if (!currentTrack) return null;

  // If on dedicated page or mini-player dismissed, keep the underlying background YouTube player ONLY IF in audio mode
  if (isDedicatedPage || !isMiniPlayerVisible) {
    if (!isAudioActive) return null;
    return (
      <div className="hidden">
        <YouTubePlayer
          ref={audioPlayerRef}
          videoId={currentTrack.id}
          autoplay={isPlaying}
          startTime={currentTime}
          onPlay={handlePlayerPlay}
          onPause={handlePlayerPause}
          onEnded={handleTrackEnded}
          onProgress={syncProgress}
        />
      </div>
    );
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const fav = isFavorite(currentTrack.id);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seekTo(pos * (duration || 100));
  };

  const handleOpenAudioPage = () => {
    switchToAudio(navigate);
  };

  const handleOpenVideoPage = () => {
    switchToVideo(navigate);
  };

  return (
    <div
      id="music-mini-player"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0c]/98 backdrop-blur-xl border-t border-zinc-800 shadow-2xl shadow-black transition-all duration-300 select-none animate-slide-up"
    >
      {/* Background YouTube player engine (Audio Mode Only) */}
      {isAudioActive && (
        <div className="hidden">
          <YouTubePlayer
            ref={audioPlayerRef}
            videoId={currentTrack.id}
            autoplay={isPlaying}
            startTime={currentTime}
            onPlay={handlePlayerPlay}
            onPause={handlePlayerPause}
            onEnded={handleTrackEnded}
            onProgress={syncProgress}
          />
        </div>
      )}

      {/* Top Scrub Timeline Bar */}
      <div
        onClick={handleSeek}
        className="w-full h-1.5 bg-zinc-800 hover:h-2.5 transition-all cursor-pointer relative group"
        title="Click to seek"
      >
        <div
          className="h-full bg-[#E50914] relative transition-all"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Main Bar Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Thumbnail & Song Title / Artist */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 max-w-[45%] sm:max-w-[30%]">
          {/* Thumbnail */}
          <div
            onClick={handleOpenAudioPage}
            className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-700/80 cursor-pointer group shadow-md"
            title="Open Audio Player"
          >
            <img
              src={currentTrack.thumbnailUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            {isPlaying && (
              <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
            )}
          </div>

          {/* Title & Artist */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p
                onClick={handleOpenAudioPage}
                className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-[#E50914] transition-colors"
                title="Open Audio Player"
              >
                {currentTrack.title}
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
              {currentTrack.artist}
            </p>
          </div>

          {/* Favorite button */}
          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`hidden md:block p-1.5 rounded-full transition-colors ${
              fav ? 'text-[#E50914]' : 'text-zinc-500 hover:text-white'
            }`}
            aria-label="Toggle favorite"
            title={fav ? 'Favorited' : 'Add to Favorites'}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-[#E50914]' : ''}`} />
          </button>
        </div>

        {/* Center: Controls & Timestamps */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              id="mini-prev-btn"
              onClick={previousTrack}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              aria-label="Previous Track"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              id="mini-play-pause-btn"
              onClick={togglePlay}
              className="p-2 sm:p-2.5 rounded-full bg-white hover:bg-zinc-200 text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />
              )}
            </button>

            <button
              id="mini-next-btn"
              onClick={nextTrack}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              aria-label="Next Track"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Time display */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Mode Switchers, Volume, Queue, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Audio Player Mode Button */}
          <button
            onClick={handleOpenAudioPage}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Open Audio Player"
          >
            <Headphones className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">Audio</span>
          </button>

          {/* Quick Video Player Mode Button */}
          <button
            onClick={handleOpenVideoPage}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E50914]/20 border border-red-500/40 text-xs font-semibold text-red-400 hover:text-white hover:bg-[#E50914] transition-colors"
            title="Watch Video"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Watch</span>
          </button>

          {/* Volume slider (desktop) */}
          <div className="hidden lg:flex items-center gap-2 ml-2">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              aria-label="Toggle sound"
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
              className="w-16 xl:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#E50914]"
              aria-label="Volume"
            />
          </div>

          {/* Queue Drawer toggle */}
          <button
            id="mini-queue-btn"
            onClick={toggleQueue}
            className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Open Queue"
            aria-label="Open Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Close mini player */}
          <button
            id="mini-close-btn"
            onClick={closeMiniPlayer}
            className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors"
            title="Dismiss Mini Player"
            aria-label="Dismiss Mini Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

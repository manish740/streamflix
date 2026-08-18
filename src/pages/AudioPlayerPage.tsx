import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useWatchlist } from '../context/WatchlistContext';
import { CURATED_MUSIC_TRACKS, extractPrimaryArtist } from '../services/youtubeService';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  ArrowLeft,
  Video,
  Mic2,
  Clock,
  Gauge,
  Disc3,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Radio,
  Share2,
  Music2,
  Dices,
  Sparkles,
  Loader2
} from 'lucide-react';

export const AudioPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoIdParam = searchParams.get('videoId');

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    currentQueueIndex,
    playbackSpeed,
    repeatMode,
    isShuffled,
    randomSameArtistAutoplay,
    isSearchingSameArtist,
    activePlayer,
    setActivePlayer,
    switchToVideo,
    stopCurrentPlayer,
    playTrack,
    playQueueItem,
    playTrackById,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackSpeed,
    toggleRepeat,
    toggleShuffle,
    toggleRandomSameArtistAutoplay,
    playRandomSameArtistSong,
    toggleFavorite,
    isFavorite,
    removeFromQueue,
    clearQueue,
    reorderQueue
  } = useMusic();

  const { showToast } = useWatchlist();

  // Local View States
  const [isQueueVisible, setIsQueueVisible] = useState<boolean>(true);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState<boolean>(false);
  const [isMobileQueueOpen, setIsMobileQueueOpen] = useState<boolean>(false);
  const [isFindingRandomLocal, setIsFindingRandomLocal] = useState<boolean>(false);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Set activePlayer to audio on mount
  useEffect(() => {
    setActivePlayer('audio');
  }, [setActivePlayer]);

  // Sync with URL videoId param if provided
  useEffect(() => {
    if (videoIdParam && (!currentTrack || currentTrack.id !== videoIdParam)) {
      playTrackById(videoIdParam);
    } else if (!currentTrack && !videoIdParam && CURATED_MUSIC_TRACKS.length > 0) {
      playTrack(CURATED_MUSIC_TRACKS[0]);
    }
  }, [videoIdParam, currentTrack, playTrackById, playTrack]);

  // Sleep timer countdown
  useEffect(() => {
    if (!sleepTimerRemaining) return;

    const timer = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (!prev || prev <= 1) {
          if (isPlaying) togglePlay();
          showToast('Sleep Timer', 'Playback paused by sleep timer.', 'info');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerRemaining, isPlaying, togglePlay, showToast]);

  const activeTrack = currentTrack || CURATED_MUSIC_TRACKS[0];
  const fav = activeTrack ? isFavorite(activeTrack.id) : false;
  const primaryArtist = activeTrack ? extractPrimaryArtist(activeTrack.artist, activeTrack.title) : 'Artist';

  const handlePlayRandomSameArtist = async () => {
    if (isFindingRandomLocal || isSearchingSameArtist) return;
    setIsFindingRandomLocal(true);
    try {
      const song = await playRandomSameArtistSong();
      if (song) {
        navigate(`/music/audio?videoId=${song.id}`, { replace: true });
        showToast('🎲 Random Track', `Now playing "${song.title}" by ${song.artist}`, 'success');
      } else {
        showToast('Artist Discovery', `No other songs found for ${primaryArtist}.`, 'info');
      }
    } catch {
      showToast('Error', 'Unable to find a random song right now.', 'info');
    } finally {
      setIsFindingRandomLocal(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    seekTo(val);
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/music');
    }
  };

  const handleSwitchToVideo = () => {
    switchToVideo(navigate);
  };

  const handleSetSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes ? minutes * 60 : null);
    setIsSleepTimerOpen(false);
    if (minutes) {
      showToast('Sleep Timer Set', `Playback will stop in ${minutes} minutes.`, 'info');
    } else {
      showToast('Sleep Timer Off', 'Sleep timer turned off.', 'info');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard && activeTrack) {
      const url = `${window.location.origin}/music/audio?videoId=${activeTrack.id}`;
      navigator.clipboard.writeText(url);
      showToast('Link Copied', 'Audio track link copied to clipboard.', 'success');
    }
  };

  const handleMoveQueueItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < queue.length) {
      reorderQueue(index, target);
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white pt-16 sm:pt-20 pb-28 relative overflow-hidden select-none font-sans">
      {/* Dynamic Ambient Backdrop from Album Artwork */}
      {activeTrack && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-3xl scale-125 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${activeTrack.thumbnailUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#060606]/90 to-[#060606] pointer-events-none" />

      {/* Top Header Action Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06]">
        {/* Back to Music Button */}
        <div className="flex items-center gap-3">
          <button
            id="audio-back-btn"
            onClick={handleBack}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-all active:scale-95"
            aria-label="Back to Music"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Music</span>
          </button>

          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs font-mono text-zinc-400">
            <Radio className="w-3.5 h-3.5 text-[#E50914] animate-pulse" />
            <span>High-Fidelity Audio Mode</span>
          </div>
        </div>

        {/* Center: Shared Audio / Video Mode Switcher */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-full border border-white/15 shadow-inner">
          <button
            id="mode-switch-audio"
            className="px-3.5 sm:px-4 py-1 rounded-full text-xs font-bold bg-[#E50914] text-white shadow-md flex items-center gap-1.5 transition-all cursor-default"
            aria-current="page"
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>

          <button
            id="mode-switch-video"
            onClick={handleSwitchToVideo}
            className="px-3.5 sm:px-4 py-1 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-all"
            title="Switch to Video Player Mode"
          >
            <Video className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
            <span>Video</span>
          </button>
        </div>

        {/* Right: Switch to Video Button & Queue Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            id="audio-switch-video-btn"
            onClick={handleSwitchToVideo}
            className="px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-[#E50914] hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-950/50 hover:scale-105 active:scale-95"
            title="Watch official music video"
          >
            <Video className="w-4 h-4 text-white" />
            <span>Switch to Video</span>
          </button>

          <button
            id="audio-queue-toggle-btn"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileQueueOpen(true);
              } else {
                setIsQueueVisible(prev => !prev);
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isQueueVisible
                ? 'bg-white text-black border-white shadow'
                : 'bg-white/[0.06] text-zinc-300 border-white/10 hover:bg-white/[0.12]'
            }`}
            title="Toggle Queue"
          >
            <ListMusic className="w-4 h-4" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Layout (Player + Right Queue Panel) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
        {/* Left: Spotify-style Centered Audio Player */}
        <div className="w-full max-w-lg lg:max-w-xl flex flex-col items-center text-center space-y-6 sm:space-y-8 animate-fade-in">
          {/* Centered Large Album Artwork */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/[0.12] group">
            <img
              src={activeTrack?.thumbnailUrl}
              alt={activeTrack?.title || 'Album Art'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Top Badge: StreamFlix Music */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Disc3 className={`w-3.5 h-3.5 text-[#E50914] ${isPlaying ? 'animate-spin' : ''}`} />
              <span>StreamFlix Audio</span>
            </div>

            {/* Duration pill */}
            <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-zinc-300 border border-white/10">
              {activeTrack?.duration || '3:30'}
            </div>
          </div>

          {/* Track Info (Title, Artist, Category) */}
          <div className="w-full space-y-2 px-2">
            <div className="flex items-center justify-between gap-4">
              <div className="text-left min-w-0 flex-1">
                <h1 className="font-sans text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate leading-tight">
                  {activeTrack?.title || 'Select a Song'}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-zinc-400 truncate mt-1">
                  {activeTrack?.artist || 'StreamFlix Music'}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-500">
                  <span className="capitalize">{activeTrack?.genre || 'Official Audio'}</span>
                  <span>•</span>
                  <span>{activeTrack?.viewCount || '1.2M streams'}</span>
                </div>
              </div>

              {/* Like / Favorite Button */}
              <button
                id="audio-favorite-btn"
                onClick={() => activeTrack && toggleFavorite(activeTrack.id)}
                className={`p-3 rounded-full transition-all shrink-0 border ${
                  fav
                    ? 'bg-red-600/20 text-[#E50914] border-red-500/40 shadow-lg shadow-red-900/30 scale-105'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border-white/10'
                }`}
                aria-label={fav ? 'Favorited' : 'Like'}
                title={fav ? 'In Favorites' : 'Add to Favorites'}
              >
                <Heart className={`w-6 h-6 ${fav ? 'fill-[#E50914]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Interactive Progress Scrub Bar */}
          <div className="w-full space-y-2 px-1">
            <div className="relative group flex items-center">
              <input
                id="audio-seek-slider"
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 sm:h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#E50914] focus:outline-none"
                aria-label="Seek track"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 font-semibold px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Center Playback Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
          <div className="flex items-center justify-between w-full max-w-sm sm:max-w-md px-4">
            {/* Shuffle */}
            <button
              id="audio-shuffle-btn"
              onClick={toggleShuffle}
              className={`p-2.5 rounded-full transition-all ${
                isShuffled
                  ? 'text-[#E50914] bg-red-600/20 shadow-md shadow-red-900/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={isShuffled ? 'Shuffle On' : 'Shuffle Off'}
              aria-label="Toggle Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Previous */}
            <button
              id="audio-prev-btn"
              onClick={previousTrack}
              className="p-3 text-zinc-300 hover:text-white transition-transform hover:scale-110 active:scale-95"
              title="Previous Song"
              aria-label="Previous Song"
            >
              <SkipBack className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

            {/* Big Centered Play / Pause Button */}
            <button
              id="audio-main-play-btn"
              onClick={togglePlay}
              className="p-5 sm:p-6 rounded-full bg-[#E50914] hover:bg-[#b80710] text-white shadow-2xl shadow-red-900/50 transition-all hover:scale-108 active:scale-95 flex items-center justify-center ring-4 ring-red-500/20"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 sm:w-9 sm:h-9 fill-white" />
              ) : (
                <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-white ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              id="audio-next-btn"
              onClick={nextTrack}
              className="p-3 text-zinc-300 hover:text-white transition-transform hover:scale-110 active:scale-95"
              title="Next Song"
              aria-label="Next Song"
            >
              <SkipForward className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

            {/* Repeat */}
            <button
              id="audio-repeat-btn"
              onClick={toggleRepeat}
              className={`p-2.5 rounded-full transition-all ${
                repeatMode !== 'off'
                  ? 'text-[#E50914] bg-red-600/20 shadow-md shadow-red-900/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
              aria-label="Toggle Repeat"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Secondary Controls Bar: Volume, Speed, Lyrics, Sleep Timer */}
          <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] text-xs">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
                aria-label="Toggle Sound"
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
                className="w-16 sm:w-24 h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-[#E50914]"
                aria-label="Volume Slider"
              />
            </div>

            {/* Action Buttons: Speed, Lyrics, Sleep Timer, Share */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Playback Speed Menu */}
              <div className="relative">
                <button
                  id="audio-speed-btn"
                  onClick={() => setIsSpeedMenuOpen(prev => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                  title="Playback Speed"
                >
                  <Gauge className="w-3.5 h-3.5 text-red-400" />
                  <span>{playbackSpeed}x</span>
                </button>

                {isSpeedMenuOpen && (
                  <div className="absolute bottom-full mb-2 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-1 shadow-2xl z-30 min-w-[90px] flex flex-col">
                    {speedOptions.map(speed => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setIsSpeedMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 text-xs text-left rounded-lg font-mono font-semibold transition-colors ${
                          playbackSpeed === speed
                            ? 'bg-[#E50914] text-white'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lyrics Drawer Toggle */}
              <button
                id="audio-lyrics-btn"
                onClick={() => setIsLyricsOpen(prev => !prev)}
                className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                  isLyricsOpen
                    ? 'bg-[#E50914] text-white border-red-500'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300 hover:text-white'
                }`}
                title="Lyrics"
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lyrics</span>
              </button>

              {/* Sleep Timer Menu */}
              <div className="relative">
                <button
                  id="audio-timer-btn"
                  onClick={() => setIsSleepTimerOpen(prev => !prev)}
                  className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                    sleepTimerMinutes
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300 hover:text-white'
                  }`}
                  title="Sleep Timer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {sleepTimerMinutes ? `${sleepTimerMinutes}m` : 'Timer'}
                  </span>
                </button>

                {isSleepTimerOpen && (
                  <div className="absolute bottom-full mb-2 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-1 shadow-2xl z-30 min-w-[130px] flex flex-col">
                    <span className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-500">
                      Sleep Timer
                    </span>
                    <button
                      onClick={() => handleSetSleepTimer(null)}
                      className="px-3 py-1.5 text-xs text-left rounded-lg text-zinc-300 hover:bg-zinc-800"
                    >
                      Turn Off
                    </button>
                    {[15, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => handleSetSleepTimer(mins)}
                        className={`px-3 py-1.5 text-xs text-left rounded-lg font-mono transition-colors ${
                          sleepTimerMinutes === mins
                            ? 'bg-[#E50914] text-white font-bold'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {mins} minutes
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-400 hover:text-white transition-colors"
                title="Share track"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Random Same-Artist Song Engine & Autoplay Toggle */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-red-950/30 via-zinc-900/70 to-zinc-900/50 border border-red-500/20 backdrop-blur-xl shadow-lg">
            {/* 🎲 Random Song Button */}
            <button
              id="audio-random-artist-song-btn"
              onClick={handlePlayRandomSameArtist}
              disabled={isFindingRandomLocal || isSearchingSameArtist}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E50914] to-red-700 hover:from-red-600 hover:to-[#E50914] text-white font-bold text-xs sm:text-sm shadow-md shadow-red-950/60 hover:shadow-red-700/40 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
              title={`Find and play a random song by ${primaryArtist}`}
            >
              {isFindingRandomLocal || isSearchingSameArtist ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="truncate">Finding random {primaryArtist} song...</span>
                </>
              ) : (
                <>
                  <Dices className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-white" />
                  <span className="truncate">🎲 Random Song from {primaryArtist}</span>
                </>
              )}
            </button>

            {/* Autoplay Same Artist Toggle */}
            <button
              id="audio-same-artist-autoplay-toggle"
              onClick={toggleRandomSameArtistAutoplay}
              className={`w-full sm:w-auto shrink-0 flex items-center justify-between sm:justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                randomSameArtistAutoplay
                  ? 'bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30'
                  : 'bg-zinc-900/80 border-zinc-700/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title="Automatically find and play a random song from the same artist when this track finishes"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${randomSameArtistAutoplay ? 'text-red-400' : 'text-zinc-500'}`} />
                <span>Autoplay Same Artist</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                  randomSameArtistAutoplay ? 'bg-[#E50914] text-white shadow-sm' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {randomSameArtistAutoplay ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Interactive Lyrics Modal/Panel if Active */}
          {isLyricsOpen && (
            <div className="w-full p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-xl shadow-2xl text-left space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Mic2 className="w-4 h-4 text-[#E50914]" />
                  <h3 className="text-sm font-bold text-white">Synchronized Lyrics</h3>
                </div>
                <button
                  onClick={() => setIsLyricsOpen(false)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-sm font-medium text-zinc-300 max-h-48 overflow-y-auto leading-relaxed pr-2">
                <p className="text-white font-bold text-base text-[#E50914]">
                  ♪ {activeTrack?.title} - {activeTrack?.artist} ♪
                </p>
                <p className="text-zinc-400 italic text-xs">
                  {activeTrack?.description ||
                    'Lyrics provided by StreamFlix Audio engine. High fidelity audio experience.'}
                </p>
                <p className="text-white font-bold">♪ You got me falling in the deep end...</p>
                <p className="text-zinc-300">♪ Running through the city with the lights down...</p>
                <p className="text-zinc-400">♪ Feel the rhythm in your heartbeat tonight...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Desktop Queue Column */}
        {isQueueVisible && (
          <div className="hidden lg:flex w-96 flex-col bg-zinc-950/90 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl h-[620px]">
            {/* Queue Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <ListMusic className="w-5 h-5 text-[#E50914]" />
                <h2 className="font-bold text-base text-white tracking-wide">Next in Queue</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300">
                  {queue.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayRandomSameArtist}
                  disabled={isFindingRandomLocal || isSearchingSameArtist}
                  className="text-xs text-red-400 hover:text-white px-2 py-1 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title={`Find and add random song by ${primaryArtist}`}
                >
                  {isFindingRandomLocal || isSearchingSameArtist ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Dices className="w-3 h-3" />
                  )}
                  <span>Random</span>
                </button>
                {queue.length > 1 && (
                  <button
                    onClick={clearQueue}
                    className="text-xs text-zinc-400 hover:text-red-400 px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/50 transition-colors flex items-center gap-1"
                    title="Clear queue"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  onClick={() => setIsQueueVisible(false)}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                  title="Hide Queue Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Queue Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-zinc-900/80">
              {queue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                  <ListMusic className="w-10 h-10 mb-2 text-zinc-700" />
                  <p className="text-sm font-semibold">Queue is empty</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Songs you play or add will appear here.
                  </p>
                </div>
              ) : (
                queue.map((track, idx) => {
                  const isCurrent = idx === currentQueueIndex;
                  return (
                    <div
                      key={`queue-${track.id}-${idx}`}
                      className={`group flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-[#E50914]/15 border border-red-500/40 text-white'
                          : 'hover:bg-white/[0.04] text-zinc-300'
                      }`}
                    >
                      {/* Track Info & Artwork */}
                      <div
                        onClick={() => playQueueItem(track, idx)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
                          <img
                            src={track.thumbnailUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Disc3 className="w-4 h-4 text-[#E50914] animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
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

                      {/* Right Item Actions (Move Up/Down, Remove, Duration) */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="text-[10px] font-mono text-zinc-500 mr-1">
                          {track.duration || '3:30'}
                        </span>

                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button
                              onClick={() => handleMoveQueueItem(idx, 'up')}
                              className="p-0.5 text-zinc-400 hover:text-white"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                          )}
                          {idx < queue.length - 1 && (
                            <button
                              onClick={() => handleMoveQueueItem(idx, 'down')}
                              className="p-0.5 text-zinc-400 hover:text-white"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromQueue(idx)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
        )}
      </div>

      {/* Mobile Queue Bottom Sheet */}
      {isMobileQueueOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end lg:hidden animate-fade-in"
          onClick={() => setIsMobileQueueOpen(false)}
        >
          <div
            className="w-full max-h-[75vh] bg-[#0d0d0d] border-t border-zinc-800 rounded-t-3xl p-4 flex flex-col space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-[#E50914]" />
                <h3 className="font-bold text-base text-white">Playback Queue ({queue.length})</h3>
              </div>
              <button
                onClick={() => setIsMobileQueueOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 space-y-1">
              {queue.map((track, idx) => (
                <div
                  key={`mob-q-${track.id}-${idx}`}
                  onClick={() => {
                    playQueueItem(track, idx);
                    setIsMobileQueueOpen(false);
                  }}
                  className="flex items-center justify-between py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold truncate ${
                          currentTrack && track.id === currentTrack.id ? 'text-[#E50914]' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      removeFromQueue(idx);
                    }}
                    className="p-2 text-zinc-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayerPage;

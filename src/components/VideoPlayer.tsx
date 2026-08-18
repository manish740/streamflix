import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  SkipForward,
  MessageSquare,
  Gauge,
  Check,
  Sparkles
} from 'lucide-react';

export const VideoPlayer: React.FC = () => {
  const { playingTarget, stopPlaying, saveProgress, playNextEpisode } = useWatchlist();

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const [selectedAudio, setSelectedAudio] = useState('English [Original]');
  const [selectedSubtitle, setSelectedSubtitle] = useState('English');
  const [showAudioSubDrawer, setShowAudioSubDrawer] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState<number | null>(null);

  const media = playingTarget?.media;
  const episode = playingTarget?.episode;
  const videoUrl = episode?.videoUrl || media?.videoUrl;

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying && !showAudioSubDrawer && !showSpeedMenu) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying, showAudioSubDrawer, showSpeedMenu]);

  // Handle Initial Start Time and Audio
  useEffect(() => {
    if (videoRef.current && playingTarget?.startTime) {
      videoRef.current.currentTime = playingTarget.startTime;
    }
  }, [playingTarget]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts if typing in text inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      resetHideControlsTimer();

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          seekDelta(-10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          seekDelta(10);
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'escape':
          if (!isFullscreen) {
            stopPlaying();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isFullscreen, resetHideControlsTimer]);

  // Periodic Progress Saving
  useEffect(() => {
    if (!media || currentTime <= 0 || duration <= 0) return;

    const interval = setInterval(() => {
      saveProgress(media.id, currentTime, duration, media.type, episode);
    }, 3000);

    return () => clearInterval(interval);
  }, [media, episode, currentTime, duration, saveProgress]);

  if (!media || !videoUrl) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const seekDelta = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPos(pos * 100);
    setHoverTime(pos * duration);
  };

  const changeVolume = (val: number) => {
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Video Time Update & Ended event
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);

      // Trigger countdown near end for TV series
      if (
        media.type === 'tv' &&
        videoRef.current.duration > 0 &&
        videoRef.current.duration - videoRef.current.currentTime < 10
      ) {
        const remaining = Math.ceil(videoRef.current.duration - videoRef.current.currentTime);
        setNextEpisodeCountdown(remaining);
      } else {
        setNextEpisodeCountdown(null);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (media.type === 'tv') {
      playNextEpisode();
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={playerContainerRef}
      id="streamflix-video-player-container"
      className="fixed inset-0 z-[100] bg-black select-none overflow-hidden flex items-center justify-center cursor-default"
      onMouseMove={resetHideControlsTimer}
      onClick={resetHideControlsTimer}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Simulated Subtitle Render Overlay */}
      {selectedSubtitle !== 'Off' && (
        <div className="absolute bottom-24 sm:bottom-28 inset-x-0 text-center pointer-events-none z-30 px-4">
          <span className="inline-block px-3 py-1 bg-black/75 text-yellow-300 font-medium text-sm sm:text-lg rounded backdrop-blur-sm shadow-md">
            [ {selectedSubtitle} Subtitle Track Active ]
          </span>
        </div>
      )}

      {/* Top Overlay Bar */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-8 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            id="player-back-btn"
            onClick={stopPlaying}
            className="p-2.5 rounded-full bg-black/50 hover:bg-white/20 text-white transition-transform hover:scale-110"
            aria-label="Back to browse"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div>
            <h3 className="text-base sm:text-xl font-bold text-white leading-tight">{media.title}</h3>
            {episode && (
              <p className="text-xs sm:text-sm text-gray-300">
                S{episode.seasonNumber}:E{episode.episodeNumber} &ldquo;{episode.title}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded border border-gray-400 text-xs font-semibold text-gray-200">
            {media.maturityRating}
          </span>
          <span className="px-2 py-0.5 rounded bg-gray-800 text-xs font-bold text-gray-300">
            {media.quality}
          </span>
        </div>
      </div>

      {/* Next Episode Auto-Countdown Banner (End of show) */}
      {nextEpisodeCountdown !== null && (
        <div className="absolute right-6 bottom-28 z-50 bg-[#0c0c0c]/98 border border-[#E50914] p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-xs animate-bounce">
          <div className="flex items-center gap-2 text-xs text-red-500 font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Next Episode
          </div>
          <p className="text-sm font-semibold text-white mt-1">Starting in {nextEpisodeCountdown}s...</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => playNextEpisode()}
              className="px-3 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold hover:bg-[#b80710]"
            >
              Watch Now
            </button>
            <button
              onClick={() => setNextEpisodeCountdown(null)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs font-medium hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Center Big Play/Pause indicator */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute z-30 p-6 rounded-full bg-black/70 text-white hover:bg-black/90 hover:scale-110 transition-all border border-zinc-700 shadow-2xl"
          aria-label="Resume playback"
        >
          <Play className="w-12 h-12 fill-white" />
        </button>
      )}

      {/* Bottom Overlay Controls */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-8 bg-gradient-to-t from-black/98 via-black/70 to-transparent z-40 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubbable Progress Bar */}
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          onMouseMove={handleProgressBarHover}
          onMouseLeave={() => setHoverTime(null)}
          className="relative w-full h-2 hover:h-3.5 bg-zinc-800/80 hover:bg-zinc-750 rounded-full cursor-pointer transition-all mb-4 group"
        >
          {/* Filled Progress */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#E50914] rounded-full flex items-center justify-end"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="w-3.5 h-3.5 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-md" />
          </div>

          {/* Hover timestamp indicator */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 px-2 py-0.5 rounded bg-black/95 text-white text-[11px] font-mono transform -translate-x-1/2 border border-zinc-700 pointer-events-none"
              style={{ left: `${hoverPos}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Play/Pause, 10s skip, Next Ep, Volume, Time */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Play/Pause */}
            <button
              id="player-toggle-play-btn"
              onClick={togglePlay}
              className="text-white hover:text-[#E50914] transition-colors p-1"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>

            {/* 10s Jump Back */}
            <button
              id="player-rewind-btn"
              onClick={() => seekDelta(-10)}
              className="text-zinc-300 hover:text-white transition-colors p-1"
              aria-label="Skip back 10 seconds"
              title="Rewind 10s"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* 10s Jump Forward */}
            <button
              id="player-forward-btn"
              onClick={() => seekDelta(10)}
              className="text-zinc-300 hover:text-white transition-colors p-1"
              aria-label="Skip forward 10 seconds"
              title="Fast forward 10s"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Next Episode (if TV show) */}
            {media.type === 'tv' && (
              <button
                id="player-next-ep-btn"
                onClick={playNextEpisode}
                className="text-zinc-300 hover:text-white transition-colors p-1"
                aria-label="Play next episode"
                title="Next Episode"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/vol">
              <button
                id="player-mute-btn"
                onClick={toggleMute}
                className="text-zinc-300 hover:text-white transition-colors p-1"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <input
                id="player-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => changeVolume(parseFloat(e.target.value))}
                className="w-16 sm:w-24 h-1 bg-zinc-700 accent-[#E50914] cursor-pointer rounded-lg opacity-80 group-hover/vol:opacity-100 transition-opacity"
                aria-label="Volume slider"
              />
            </div>

            {/* Time Display */}
            <span className="text-xs font-mono text-zinc-300 select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Audio & Subtitles, Playback Speed, Fullscreen */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Audio & Subtitles Button */}
            <div className="relative">
              <button
                id="player-audio-sub-btn"
                onClick={() => setShowAudioSubDrawer(!showAudioSubDrawer)}
                className="text-zinc-300 hover:text-white transition-colors p-1 flex items-center gap-1 text-xs"
                aria-label="Audio and subtitles"
                title="Audio & Subtitles"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">Subtitles</span>
              </button>

              {/* Audio / Subtitles Drawer Menu */}
              {showAudioSubDrawer && (
                <div className="absolute right-0 bottom-12 w-72 rounded-xl bg-[#0c0c0c] border border-zinc-800 p-4 shadow-2xl z-50 text-xs space-y-4">
                  {/* Audio Languages */}
                  <div>
                    <h4 className="font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Audio Track
                    </h4>
                    <div className="space-y-1">
                      {media.audioLanguages.map(lang => (
                        <button
                          key={lang}
                          onClick={() => {
                            setSelectedAudio(lang);
                            setShowAudioSubDrawer(false);
                          }}
                          className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-800/80 text-left text-white"
                        >
                          <span>{lang}</span>
                          {selectedAudio === lang && <Check className="w-4 h-4 text-[#E50914]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitles */}
                  <div className="pt-2 border-t border-zinc-800">
                    <h4 className="font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Subtitles
                    </h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedSubtitle('Off');
                          setShowAudioSubDrawer(false);
                        }}
                        className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-800/80 text-left text-white"
                      >
                        <span>Off</span>
                        {selectedSubtitle === 'Off' && <Check className="w-4 h-4 text-[#E50914]" />}
                      </button>

                      {media.subtitles.map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setSelectedSubtitle(sub);
                            setShowAudioSubDrawer(false);
                          }}
                          className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-800/80 text-left text-white"
                        >
                          <span>{sub}</span>
                          {selectedSubtitle === sub && <Check className="w-4 h-4 text-[#E50914]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                id="player-speed-btn"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-zinc-300 hover:text-white transition-colors p-1 flex items-center gap-1 text-xs"
                aria-label="Playback speed"
                title="Playback Speed"
              >
                <Gauge className="w-5 h-5" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-12 w-32 rounded-xl bg-[#0c0c0c] border border-zinc-800 p-2 shadow-2xl z-50 text-xs">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-800 ${
                        playbackRate === speed ? 'text-[#E50914] font-bold' : 'text-white'
                      }`}
                    >
                      <span>{speed === 1 ? '1.0x (Normal)' : `${speed}x`}</span>
                      {playbackRate === speed && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              id="player-fullscreen-btn"
              onClick={toggleFullscreen}
              className="text-zinc-300 hover:text-white transition-colors p-1"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

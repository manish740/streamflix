import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { MOCK_MEDIA } from '../data/mockData';
import { MediaItem, Episode } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Settings,
  Subtitles,
  FastForward,
  Check,
  List,
  Sparkles,
  Info
} from 'lucide-react';

export const WatchPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const [searchParams] = useSearchParams();
  const episodeQueryId = searchParams.get('ep');
  const navigate = useNavigate();

  const { progressList, saveProgress, recordHistory, showToast } = useWatchlist();

  // Find media item
  const media = MOCK_MEDIA.find(m => m.id === contentId || m.slug === contentId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('4K Ultra HD');
  const [selectedAudio, setSelectedAudio] = useState('English [Original]');
  const [selectedSubtitle, setSelectedSubtitle] = useState('English [CC]');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'audio' | 'speed' | 'quality'>('audio');

  // For TV Shows: Active Episode
  const currentEpisode: Episode | undefined = React.useMemo(() => {
    if (media?.type !== 'tv' || !media?.seasons) return undefined;
    if (episodeQueryId) {
      for (const season of media.seasons) {
        const found = season.episodes.find(e => e.id === episodeQueryId);
        if (found) return found;
      }
    }
    return media.seasons[0]?.episodes[0];
  }, [media, episodeQueryId]);

  // Video URL to play
  const streamUrl = currentEpisode?.videoUrl || media?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  // Initialize playback time from saved progress
  useEffect(() => {
    if (!media) return;
    const existingProgress = progressList[media.id];
    if (existingProgress && existingProgress.currentTime > 0 && existingProgress.currentTime < (existingProgress.duration - 15)) {
      setCurrentTime(existingProgress.currentTime);
      if (videoRef.current) {
        videoRef.current.currentTime = existingProgress.currentTime;
      }
      showToast('Resuming Playback', `Continuing at ${formatTime(existingProgress.currentTime)}`, 'info');
    }
  }, [media?.id]);

  // Controls fade-out timer
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();
      if (e.code === 'Space' || e.code === 'KeyK') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyL') {
        e.preventDefault();
        handleSeekRelative(10);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyJ') {
        e.preventDefault();
        handleSeekRelative(-10);
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
        } else {
          handleBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, duration, currentTime]);

  const handleBack = () => {
    // Record history before leaving
    if (media) {
      recordHistory(media, currentEpisode?.id, currentEpisode?.title);
    }
    if (window.history.state && typeof window.history.state.idx === 'number') {
      if (window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (!media) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-center text-[#E50914] mb-4 text-2xl font-bold">
          !
        </div>
        <h2 className="text-2xl font-bold mb-2">Title Not Found</h2>
        <p className="text-zinc-400 text-sm max-w-md mb-6">
          The movie or TV series you requested does not exist or has been removed from the catalog.
        </p>
        <button
          onClick={handleBack}
          className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] font-bold text-xs shadow-lg transition-all"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !media) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(curr);
    setDuration(dur);

    // Periodically save progress (every 5 seconds)
    if (Math.floor(curr) % 5 === 0) {
      saveProgress({
        mediaId: media.id,
        mediaType: media.type,
        episodeId: currentEpisode?.id,
        seasonNumber: currentEpisode?.seasonNumber,
        episodeNumber: currentEpisode?.episodeNumber,
        currentTime: Math.floor(curr),
        duration: Math.floor(dur),
        percent: Math.min(100, Math.round((curr / dur) * 100)),
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleSeekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      className="fixed inset-0 z-[150] bg-black flex items-center justify-center select-none overflow-hidden font-sans"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={streamUrl}
        className="w-full h-full object-contain cursor-pointer"
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            videoRef.current.playbackRate = playbackSpeed;
          }
        }}
        onClick={togglePlay}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
      />

      {/* Top Overlay Bar */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            id="watch-back-btn"
            onClick={handleBack}
            className="p-2 rounded-full bg-black/40 hover:bg-white/20 text-white transition-all backdrop-blur-md"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md md:max-w-xl">
              {media.title}
            </h1>
            {currentEpisode && (
              <p className="text-xs text-zinc-300">
                S{currentEpisode.seasonNumber} E{currentEpisode.episodeNumber}: {currentEpisode.title}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-zinc-300">
            {media.maturityRating}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#E50914]/20 border border-[#E50914]/50 text-red-400">
            {selectedQuality}
          </span>
        </div>
      </div>

      {/* Center Play/Pause Large Indicator for tactile visual feedback */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
        >
          <div className="w-20 h-20 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
            <Play className="w-10 h-10 fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent space-y-3 transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Progress Slider */}
        <div className="flex items-center gap-3 group/slider">
          <span className="text-xs text-zinc-400 font-mono min-w-[44px]">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              id="watch-seek-bar"
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#E50914] focus:outline-none hover:h-2 transition-all"
            />
          </div>
          <span className="text-xs text-zinc-400 font-mono min-w-[44px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Play/Pause Button */}
            <button
              id="watch-play-pause-btn"
              onClick={togglePlay}
              className="text-white hover:text-[#E50914] transition-colors p-1"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>

            {/* 10s Rewind */}
            <button
              onClick={() => handleSeekRelative(-10)}
              className="text-white hover:text-[#E50914] transition-colors p-1"
              title="Rewind 10 seconds (J / Left Arrow)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* 10s Fast Forward */}
            <button
              onClick={() => handleSeekRelative(10)}
              className="text-white hover:text-[#E50914] transition-colors p-1"
              title="Forward 10 seconds (L / Right Arrow)"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="text-white hover:text-[#E50914] transition-colors p-1"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#E50914] focus:outline-none"
              />
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* TV Show Episodes Drawer Toggle */}
            {media.type === 'tv' && media.seasons && (
              <button
                onClick={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  showEpisodesDrawer ? 'bg-[#E50914] text-white' : 'bg-zinc-800/80 text-zinc-300 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Episodes</span>
              </button>
            )}

            {/* Audio & Subtitles Settings Toggle */}
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`p-2 rounded-lg transition-all ${
                showSettingsMenu ? 'bg-[#E50914] text-white' : 'text-zinc-300 hover:text-white bg-black/40'
              }`}
              title="Audio, Subtitles & Speed"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              id="watch-fullscreen-btn"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-zinc-300 hover:text-white bg-black/40 transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal (Audio, Subtitles, Speed, Quality) */}
      {showSettingsMenu && (
        <div className="absolute right-4 sm:right-6 bottom-20 z-30 w-80 bg-[#0c0c0c]/95 backdrop-blur-xl rounded-2xl border border-zinc-800 p-4 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="text-sm font-bold text-white">Playback Settings</h3>
            <button
              onClick={() => setShowSettingsMenu(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="flex border-b border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-1.5 font-bold ${
                activeTab === 'audio' ? 'text-[#E50914] border-b-2 border-[#E50914]' : 'text-zinc-400'
              }`}
            >
              Audio/Subs
            </button>
            <button
              onClick={() => setActiveTab('speed')}
              className={`flex-1 py-1.5 font-bold ${
                activeTab === 'speed' ? 'text-[#E50914] border-b-2 border-[#E50914]' : 'text-zinc-400'
              }`}
            >
              Speed
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`flex-1 py-1.5 font-bold ${
                activeTab === 'quality' ? 'text-[#E50914] border-b-2 border-[#E50914]' : 'text-zinc-400'
              }`}
            >
              Quality
            </button>
          </div>

          {activeTab === 'audio' && (
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-zinc-400 mb-1">Audio Track</p>
                {['English [Original]', 'Spanish [Dubbed]', 'French [Dubbed]', 'German'].map(a => (
                  <div
                    key={a}
                    onClick={() => setSelectedAudio(a)}
                    className="flex items-center justify-between py-1.5 px-2 rounded cursor-pointer hover:bg-zinc-800 text-white"
                  >
                    <span>{a}</span>
                    {selectedAudio === a && <Check className="w-4 h-4 text-[#E50914]" />}
                  </div>
                ))}
              </div>

              <div>
                <p className="font-semibold text-zinc-400 mb-1">Subtitles</p>
                {['Off', 'English [CC]', 'Spanish', 'French', 'Japanese'].map(s => (
                  <div
                    key={s}
                    onClick={() => setSelectedSubtitle(s)}
                    className="flex items-center justify-between py-1.5 px-2 rounded cursor-pointer hover:bg-zinc-800 text-white"
                  >
                    <span>{s}</span>
                    {selectedSubtitle === s && <Check className="w-4 h-4 text-[#E50914]" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'speed' && (
            <div className="space-y-1 text-xs">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                <div
                  key={speed}
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    if (videoRef.current) videoRef.current.playbackRate = speed;
                  }}
                  className="flex items-center justify-between py-2 px-2.5 rounded cursor-pointer hover:bg-zinc-800 text-white"
                >
                  <span>{speed === 1 ? '1.0x (Normal)' : `${speed}x`}</span>
                  {playbackSpeed === speed && <Check className="w-4 h-4 text-[#E50914]" />}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-1 text-xs">
              {['Auto (4K HDR)', '4K Ultra HD', '1080p Full HD', '720p HD', 'Data Saver'].map(q => (
                <div
                  key={q}
                  onClick={() => setSelectedQuality(q)}
                  className="flex items-center justify-between py-2 px-2.5 rounded cursor-pointer hover:bg-zinc-800 text-white"
                >
                  <span>{q}</span>
                  {selectedQuality === q && <Check className="w-4 h-4 text-[#E50914]" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TV Show Episode Picker Drawer */}
      {showEpisodesDrawer && media.type === 'tv' && media.seasons && (
        <div className="absolute right-0 inset-y-0 w-80 sm:w-96 bg-[#0c0c0c]/98 backdrop-blur-xl border-l border-zinc-800 p-6 z-40 overflow-y-auto space-y-4 animate-slide-left">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white">Episodes & Seasons</h3>
            <button
              onClick={() => setShowEpisodesDrawer(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Done
            </button>
          </div>

          <div className="space-y-4">
            {media.seasons.map(season => (
              <div key={season.id} className="space-y-2">
                <h4 className="text-xs font-bold text-[#E50914] uppercase tracking-wider">
                  Season {season.seasonNumber}: {season.title}
                </h4>
                <div className="space-y-2">
                  {season.episodes.map(ep => (
                    <div
                      key={ep.id}
                      onClick={() => {
                        navigate(`/watch/${media.id}?ep=${ep.id}`);
                        setShowEpisodesDrawer(false);
                      }}
                      className={`flex gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                        currentEpisode?.id === ep.id
                          ? 'bg-zinc-800 border border-[#E50914]'
                          : 'bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800'
                      }`}
                    >
                      <div className="relative w-20 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                        <img
                          src={ep.thumbnailUrl}
                          alt={ep.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {ep.episodeNumber}. {ep.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                          {ep.synopsis}
                        </p>
                        <span className="text-[10px] text-zinc-500">{ep.duration}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

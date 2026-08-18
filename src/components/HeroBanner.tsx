import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { Play, Info, Volume2, VolumeX, Plus, Check } from 'lucide-react';

interface HeroBannerProps {
  media: MediaItem;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ media }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openModal, toggleWatchlist, isInWatchlist, showToast } = useWatchlist();
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const inWatchlist = isInWatchlist(media.id);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlay = () => {
    if (!isAuthenticated) {
      showToast('Sign in Required', 'Please sign in to start streaming', 'info');
      navigate('/login');
      return;
    }
    navigate(`/watch/${media.id}`);
  };

  const handleMoreInfo = () => {
    openModal(media);
  };

  return (
    <section className="relative w-full h-[72vh] sm:h-[82vh] md:h-[88vh] lg:h-[92vh] max-h-[950px] overflow-hidden select-none">
      {/* Background Image / Video Player */}
      <div className="absolute inset-0 w-full h-full">
        {/* Background Image */}
        <img
          src={media.backdropUrl}
          alt={media.title}
          className={`w-full h-full object-cover object-center scale-105 transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          referrerPolicy="no-referrer"
        />

        {/* Video Trailer Loop if available */}
        {media.trailerUrl && (
          <video
            ref={videoRef}
            src={media.trailerUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Immersive UI Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 sm:via-[#050505]/50 to-transparent w-full sm:w-[75%] lg:w-[60%]" />
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-64 bg-gradient-to-t from-[#050505] via-[#050505]/85 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#050505]/90 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col justify-end pb-24 sm:pb-32 lg:pb-36">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Series / Film Category Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-[#E50914] text-white shadow-md">
              {media.type === 'tv' ? 'Series' : 'Film'} Original
            </span>
            <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
              ★ {media.ratingScore.toFixed(1)} / 10
            </span>
          </div>

          {/* Title */}
          <h1
            id="hero-media-title"
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-bold leading-none tracking-tight drop-shadow-2xl uppercase"
          >
            {media.title}
          </h1>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-zinc-300">
            <span className="font-bold text-green-400">{media.matchPercentage}% Match</span>
            <span className="text-zinc-400">{media.releaseYear}</span>
            <span className="px-1.5 py-0.5 rounded border border-zinc-700 text-[11px] font-semibold text-zinc-300">
              {media.maturityRating}
            </span>
            <span className="text-zinc-300">
              {media.type === 'movie' ? `${media.duration}m` : `${media.totalSeasons || 1} Seasons`}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800/90 border border-zinc-700 text-[10px] font-bold text-zinc-300">
              {media.quality}
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-800/90 border border-zinc-700 text-[10px] font-bold text-zinc-300">
              Dolby Atmos
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 md:line-clamp-4 leading-relaxed font-normal drop-shadow">
            {media.synopsis}
          </p>

          {/* Genre tags */}
          <div className="hidden sm:flex items-center gap-2 pt-0.5">
            {media.genres.map(g => (
              <span key={g} className="text-xs text-zinc-400 font-medium">
                • {g}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Play Button */}
            <button
              id="hero-play-btn"
              onClick={handlePlay}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded bg-white hover:bg-zinc-200 text-black font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-black" />
              Play
            </button>

            {/* More Info Button */}
            <button
              id="hero-more-info-btn"
              onClick={handleMoreInfo}
              className="px-5 sm:px-7 py-2.5 sm:py-3 rounded bg-zinc-800/80 hover:bg-zinc-700/90 text-white font-semibold text-sm sm:text-base flex items-center gap-2.5 transition-all backdrop-blur-md hover:scale-105 active:scale-95 border border-zinc-700/50"
            >
              <Info className="w-5 h-5 text-zinc-300" />
              More Info
            </button>

            {/* Add/Remove My List */}
            <button
              id="hero-watchlist-btn"
              onClick={() => toggleWatchlist(media)}
              className={`p-2.5 sm:p-3 rounded-full border transition-all ${
                inWatchlist
                  ? 'bg-[#E50914] border-[#E50914] text-white shadow-lg shadow-red-900/40'
                  : 'bg-black/60 border-zinc-700 text-white hover:border-white hover:bg-black/90'
              }`}
              aria-label={inWatchlist ? 'Remove from My List' : 'Add to My List'}
              title={inWatchlist ? 'In My List' : 'Add to My List'}
            >
              {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sound & Age Advisory Controls (Bottom Right) */}
      <div className="absolute right-4 sm:right-8 md:right-12 bottom-28 sm:bottom-36 z-20 flex items-center gap-3">
        {media.trailerUrl && (
          <button
            id="hero-audio-toggle-btn"
            onClick={toggleSound}
            className="p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-zinc-700 hover:border-white transition-all backdrop-blur-sm shadow-lg"
            aria-label={isMuted ? 'Unmute preview sound' : 'Mute preview sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        <div className="border-l-2 border-zinc-600 bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-zinc-300 tracking-wider">
          {media.maturityRating}
        </div>
      </div>
    </section>
  );
};

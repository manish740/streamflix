import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { Play, Plus, Check, ThumbsUp, ChevronDown, Heart } from 'lucide-react';

interface MovieCardProps {
  media: MediaItem;
  rank?: number;
  showProgress?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ media, rank, showProgress = true }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    openModal,
    toggleWatchlist,
    isInWatchlist,
    getProgress,
    ratings,
    rateMedia,
    showToast
  } = useWatchlist();

  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const inWatchlist = isInWatchlist(media.id);
  const progress = getProgress(media.id);
  const userRating = ratings[media.id];

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      if (media.trailerUrl) {
        setIsVideoPlaying(true);
      }
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
    setIsVideoPlaying(false);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Sign in Required', 'Please sign in to start streaming', 'info');
      navigate('/login');
      return;
    }
    navigate(`/watch/${media.id}`);
  };

  const handleCardClick = () => {
    openModal(media);
  };

  return (
    <div
      className="relative flex-shrink-0 group select-none transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top 10 Rank Number Layout */}
      {rank !== undefined ? (
        <div className="flex items-center">
          <span className="font-display text-8xl sm:text-9xl font-black text-stroke-netflix text-[#050505] select-none -mr-4 sm:-mr-6 z-0 drop-shadow-md">
            {rank}
          </span>
          <div
            id={`card-${media.id}`}
            onClick={handleCardClick}
            className="relative z-10 w-36 sm:w-44 md:w-52 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 cursor-pointer shadow-lg border border-zinc-800/80 transition-transform duration-300 group-hover:scale-105 group-hover:border-zinc-600"
          >
            <img
              src={media.posterUrl}
              alt={media.title}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      ) : (
        /* Standard 16:9 Movie Card */
        <div
          id={`card-${media.id}`}
          onClick={handleCardClick}
          className="relative w-44 sm:w-56 md:w-64 lg:w-72 aspect-[16/9] rounded-lg overflow-hidden bg-zinc-900 cursor-pointer shadow-lg border border-zinc-800/80 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black group-hover:border-zinc-700"
        >
          {/* Main Backdrop Poster */}
          <img
            src={media.backdropUrl}
            alt={media.title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isVideoPlaying ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Teaser Video snippet on hover */}
          {media.trailerUrl && isVideoPlaying && (
            <video
              src={media.trailerUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Subtle permanent title overlay for non-hovered state */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-transparent to-transparent flex flex-col justify-end p-3 transition-opacity duration-300 group-hover:opacity-0">
            <p className="text-xs sm:text-sm font-bold text-white truncate drop-shadow">{media.title}</p>
            <div className="flex items-center gap-2 text-[10px] text-zinc-300 mt-0.5">
              <span className="text-green-400 font-bold">{media.matchPercentage}% Match</span>
              <span className="text-zinc-400">{media.releaseYear}</span>
              <span className="px-1 py-0.2 rounded border border-zinc-700 text-[9px] text-zinc-300">
                {media.maturityRating}
              </span>
            </div>
          </div>

          {/* Viewing Progress Bar */}
          {showProgress && progress && progress.percent > 0 && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-800">
              <div
                className="h-full bg-[#E50914] transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          )}

          {/* Expanded Hover Action Overlay */}
          {isHovered && (
            <div
              className="absolute inset-0 bg-[#0c0c0c]/98 border border-zinc-800 p-3 flex flex-col justify-between z-30 transition-all duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div>
                <p className="text-xs sm:text-sm font-bold text-white truncate">{media.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-zinc-300 mt-1">
                  <span className="text-green-400 font-bold">{media.matchPercentage}% Match</span>
                  <span className="px-1 py-0.2 border border-zinc-700 rounded text-[9px] text-zinc-300">
                    {media.maturityRating}
                  </span>
                  <span className="text-zinc-400">{media.type === 'movie' ? `${media.duration}m` : `${media.totalSeasons}S`}</span>
                  <span className="px-1 py-0.2 bg-zinc-800 border border-zinc-700 rounded text-[9px] font-bold text-zinc-300">
                    {media.quality}
                  </span>
                </div>
              </div>

              {/* Genre chips */}
              <div className="text-[10px] text-zinc-400 flex flex-wrap gap-1">
                {media.genres.slice(0, 2).map((g, i) => (
                  <span key={g}>
                    {g}
                    {i < Math.min(media.genres.length, 2) - 1 ? ' •' : ''}
                  </span>
                ))}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-1.5">
                  {/* Play Button */}
                  <button
                    id={`card-play-${media.id}`}
                    onClick={handlePlayClick}
                    className="p-2 rounded-full bg-white hover:bg-zinc-200 text-black shadow-md transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Play ${media.title}`}
                    title="Play"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                  </button>

                  {/* Add to Watchlist */}
                  <button
                    id={`card-watchlist-${media.id}`}
                    onClick={() => toggleWatchlist(media)}
                    className={`p-2 rounded-full border transition-transform hover:scale-110 active:scale-95 ${
                      inWatchlist
                        ? 'bg-[#E50914] border-[#E50914] text-white shadow-md'
                        : 'border-zinc-700 text-white hover:border-white bg-black/60'
                    }`}
                    aria-label={inWatchlist ? 'Remove from My List' : 'Add to My List'}
                    title={inWatchlist ? 'In My List' : 'Add to My List'}
                  >
                    {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>

                  {/* Like Button */}
                  <button
                    id={`card-like-${media.id}`}
                    onClick={() => rateMedia(media.id, userRating === 'loved' ? 'liked' : 'loved')}
                    className={`p-2 rounded-full border transition-transform hover:scale-110 active:scale-95 ${
                      userRating === 'loved'
                        ? 'bg-[#E50914] border-[#E50914] text-white'
                        : userRating === 'liked'
                        ? 'border-white text-green-400 bg-black/60'
                        : 'border-zinc-700 text-zinc-400 hover:border-white bg-black/60'
                    }`}
                    aria-label="Rate this title"
                    title={userRating ? `Rated: ${userRating}` : 'Like this title'}
                  >
                    {userRating === 'loved' ? (
                      <Heart className="w-3.5 h-3.5 fill-white text-white" />
                    ) : (
                      <ThumbsUp className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* More Details Chevron */}
                <button
                  id={`card-details-${media.id}`}
                  onClick={handleCardClick}
                  className="p-2 rounded-full border border-zinc-700 hover:border-white text-zinc-400 hover:text-white bg-black/60 transition-transform hover:scale-110"
                  aria-label="More details"
                  title="More Details"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

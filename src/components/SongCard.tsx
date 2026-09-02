import React, { useState } from 'react';
import { YouTubeTrack } from '../types';
import { useMusic } from '../context/MusicContext';
import { Play, Pause, Plus, Check, Heart, Disc3, Eye } from 'lucide-react';

interface SongCardProps {
  track: YouTubeTrack;
  rank?: number;
  featured?: boolean;
  onPlayOverride?: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ track, rank, featured }) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    addToQueue,
    queue,
    toggleFavorite,
    isFavorite
  } = useMusic();

  const [isHovered, setIsHovered] = useState(false);

  const trackId = track.videoId || track.id;
  const currentId = currentTrack?.videoId || currentTrack?.id;
  const isCurrentTrack = currentId === trackId;
  const isPlayingThis = isCurrentTrack && isPlaying;
  const inQueue = queue.some(t => (t.videoId || t.id) === trackId);
  const fav = isFavorite(trackId);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleQueueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(trackId);
  };

  return (
    <div
      id={`song-card-${trackId}`}
      onClick={handlePlayClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex-shrink-0 cursor-pointer rounded-xl bg-zinc-900/90 border transition-all duration-300 select-none overflow-hidden ${
        isCurrentTrack
          ? 'border-[#E50914] ring-1 ring-[#E50914]/50 shadow-xl shadow-red-950/30'
          : 'border-zinc-800/80 hover:border-zinc-600 hover:shadow-2xl hover:shadow-black'
      } ${featured ? 'w-64 sm:w-80 md:w-96' : 'w-48 sm:w-56 md:w-64'}`}
    >
      {/* Thumbnail Aspect 16:9 */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <img
          src={track.thumbnailUrl || track.thumbnail}
          alt={track.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-108' : 'scale-100'
          }`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Top Rank Badge */}
        {rank !== undefined && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-xs font-black text-white border border-zinc-700/80 shadow">
            #{rank}
          </span>
        )}

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-semibold text-zinc-300 backdrop-blur-sm">
          {track.duration || '3:30'}
        </span>

        {/* Center Hover Play Button */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 ${
            isHovered || isPlayingThis ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={handlePlayClick}
            className="p-3 rounded-full bg-white hover:bg-zinc-200 text-black shadow-2xl transition-transform hover:scale-110 active:scale-95"
            aria-label={isPlayingThis ? 'Pause' : 'Play'}
          >
            {isPlayingThis ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>
        </div>

        {/* Audio Equalizer Active Waves Indicator */}
        {isPlayingThis && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full border border-red-500/50">
            <Disc3 className="w-3.5 h-3.5 text-[#E50914] animate-spin" />
            <span className="text-[9px] font-bold text-red-400 uppercase">Playing</span>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-1.5">
          <h4
            className={`text-xs sm:text-sm font-bold truncate transition-colors ${
              isCurrentTrack ? 'text-[#E50914]' : 'text-white group-hover:text-red-400'
            }`}
            title={track.title}
          >
            {track.title}
          </h4>
        </div>

        <p className="text-[11px] sm:text-xs text-zinc-400 truncate" title={track.artist}>
          {track.artist}
        </p>

        {/* Bottom stats & Quick Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1 font-mono truncate">
            <Eye className="w-3 h-3 text-zinc-500" />
            {track.viewCount || '1.2M views'}
          </span>

          <div className="flex items-center gap-1">
            {/* Add to Queue */}
            <button
              onClick={handleQueueClick}
              className={`p-1 rounded transition-colors ${
                inQueue ? 'text-green-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title={inQueue ? 'In Queue' : 'Add to Queue'}
              aria-label="Add to Queue"
            >
              {inQueue ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              className={`p-1 rounded transition-colors ${
                fav ? 'text-[#E50914]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title={fav ? 'Favorited' : 'Like'}
              aria-label="Favorite"
            >
              <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-[#E50914]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

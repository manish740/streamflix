import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { MOCK_MEDIA } from '../data/mockData';
import { MovieCard } from '../components/MovieCard';
import {
  Play,
  Plus,
  Check,
  ThumbsUp,
  Heart,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  ArrowLeft,
  Volume2
} from 'lucide-react';

export const ContentDetailsPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist, ratings, rateMedia, showToast } = useWatchlist();

  const handleBack = () => {
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

  const media = MOCK_MEDIA.find(m => m.id === contentId || m.slug === contentId);

  const similarItems = useMemo(() => {
    if (!media) return [];
    return (media.similarIds || [])
      .map(id => MOCK_MEDIA.find(m => m.id === id))
      .filter((m): m is typeof MOCK_MEDIA[0] => Boolean(m));
  }, [media]);

  if (!media) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Title Not Found</h2>
        <p className="text-zinc-400 text-sm max-w-md mb-6">
          The requested title is not currently available in our catalog.
        </p>
        <button
          onClick={handleBack}
          className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] font-bold text-xs"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const isSaved = isInWatchlist(media.id);
  const currentRating = ratings[media.id];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
        <img
          src={media.backdropUrl}
          alt={media.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />

        {/* Back navigation */}
        <div className="absolute top-20 left-4 sm:left-12 z-20">
          <button
            id="content-details-back-btn"
            onClick={handleBack}
            aria-label="Go back"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md transition-all border border-zinc-700 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Content Overlay Header */}
        <div className="absolute bottom-6 left-4 sm:left-12 max-w-2xl z-20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E50914]">
            <Sparkles className="w-4 h-4" />
            <span>StreamFlix Original {media.type === 'tv' ? 'Series' : 'Film'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {media.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
            <span className="text-green-400 font-bold">{media.matchPercentage}% Match</span>
            <span>{media.releaseYear}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold">
              {media.maturityRating}
            </span>
            <span>{media.type === 'movie' ? `${media.duration}m` : `${media.totalSeasons} Seasons`}</span>
            <span className="px-1.5 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] font-bold border border-[#E50914]/40">
              {media.quality}
            </span>
          </div>

          {/* Action CTA buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/watch/${media.id}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play Now</span>
            </button>

            <button
              onClick={() => toggleWatchlist(media.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all backdrop-blur-md ${
                isSaved
                  ? 'bg-[#E50914] border-[#E50914] text-white'
                  : 'bg-zinc-900/80 border-zinc-700 text-white hover:border-white'
              }`}
            >
              {isSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{isSaved ? 'In Watchlist' : 'Add to List'}</span>
            </button>

            {/* Like / Loved rating */}
            <button
              onClick={() => {
                rateMedia(media.id, currentRating === 'loved' ? 'liked' : 'loved');
                showToast('Rating Recorded', 'Thank you for your feedback!', 'success');
              }}
              className={`p-3 rounded-xl border transition-all ${
                currentRating === 'loved'
                  ? 'bg-red-950/80 border-red-600 text-red-400'
                  : 'bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title="Rate this title"
            >
              <Heart className={`w-5 h-5 ${currentRating === 'loved' ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="px-4 sm:px-12 max-w-7xl mx-auto mt-6 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Synopsis & Seasons */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">About {media.title}</h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">{media.synopsis}</p>
            </div>

            {/* Seasons & Episodes if TV show */}
            {media.type === 'tv' && media.seasons && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-xl font-bold text-white">Episodes</h3>
                {media.seasons.map(season => (
                  <div key={season.id} className="space-y-3">
                    <h4 className="text-sm font-bold text-[#E50914]">
                      Season {season.seasonNumber}: {season.title}
                    </h4>
                    <div className="space-y-3">
                      {season.episodes.map(ep => (
                        <div
                          key={ep.id}
                          onClick={() => navigate(`/watch/${media.id}?ep=${ep.id}`)}
                          className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 cursor-pointer transition-all group"
                        >
                          <div className="relative w-full sm:w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                            <img
                              src={ep.thumbnailUrl}
                              alt={ep.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-8 h-8 fill-white text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-bold text-white">
                                  {ep.episodeNumber}. {ep.title}
                                </h5>
                                <span className="text-xs text-zinc-500 font-mono">{ep.duration}m</span>
                              </div>
                              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{ep.synopsis}</p>
                            </div>
                            <span className="text-[11px] text-[#E50914] font-semibold pt-2">
                              Click to stream this episode →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Cast, Crew, Tags & Audio metadata */}
          <div className="space-y-6 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80">
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Cast & Creators
              </h3>
              {media.director && (
                <p className="text-xs text-zinc-300 mb-1">
                  <span className="text-zinc-500">Director:</span> {media.director}
                </p>
              )}
              {media.creator && (
                <p className="text-xs text-zinc-300 mb-1">
                  <span className="text-zinc-500">Creator:</span> {media.creator}
                </p>
              )}
              <p className="text-xs text-zinc-300">
                <span className="text-zinc-500">Cast:</span> {media.cast.join(', ')}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Genres & Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {media.genres.map(g => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
                  >
                    {g}
                  </span>
                ))}
                {media.tags.map(t => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Audio & Subtitles
              </h3>
              <p className="text-xs text-zinc-400 mb-1">
                Audio: {media.audioLanguages.join(', ')}
              </p>
              <p className="text-xs text-zinc-400">
                Subtitles: {media.subtitles.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Similar Recommended Titles */}
        {similarItems.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-zinc-800">
            <h3 className="text-xl font-bold text-white">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarItems.map(item => (
                <MovieCard key={item.id} media={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

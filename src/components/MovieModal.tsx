import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { Episode, MediaItem } from '../types';
import { MOCK_MEDIA } from '../data/mockData';
import {
  X,
  Play,
  Plus,
  Check,
  ThumbsUp,
  Volume2,
  VolumeX,
  Heart,
  Calendar,
  Clock,
  Sparkles,
  Share2,
  ExternalLink
} from 'lucide-react';

export const MovieModal: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    selectedModalMedia,
    closeModal,
    toggleWatchlist,
    isInWatchlist,
    ratings,
    rateMedia,
    openModal,
    showToast
  } = useWatchlist();

  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'similar'>('overview');
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const media = selectedModalMedia;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  useEffect(() => {
    setActiveTab(media?.type === 'tv' && media?.seasons?.length ? 'episodes' : 'overview');
    setSelectedSeasonNumber(1);
    setIsMuted(true);
    setReviewText('');
  }, [media]);

  if (!media) return null;

  const inWatchlist = isInWatchlist(media.id);
  const userRating = ratings[media.id];

  const currentSeason = media.seasons?.find(s => s.seasonNumber === selectedSeasonNumber) || media.seasons?.[0];

  const similarTitles = (media.similarIds || [])
    .map(id => MOCK_MEDIA.find(m => m.id === id))
    .filter((m): m is MediaItem => Boolean(m));

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/content/${media.id}`;
    navigator.clipboard?.writeText(url);
    showToast('Link copied to clipboard', media.title, 'info');
  };

  const handlePlay = (episode?: Episode) => {
    closeModal();
    if (!isAuthenticated) {
      showToast('Sign in Required', 'Please sign in to start streaming', 'info');
      navigate('/login');
      return;
    }
    if (episode) {
      navigate(`/watch/${media.id}?ep=${episode.id}`);
    } else {
      navigate(`/watch/${media.id}`);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setIsSubmittingReview(true);
    setTimeout(() => {
      rateMedia(media.id, userRating || 'loved');
      showToast('Review Submitted', 'Thank you for sharing your thoughts!', 'favorite');
      setReviewText('');
      setIsSubmittingReview(false);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-start justify-center p-2 sm:p-4 md:p-6 lg:p-10 animate-fade-in"
      onClick={closeModal}
    >
      <div
        ref={modalContainerRef}
        className="relative w-full max-w-4xl bg-[#0c0c0c] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="modal-close-btn"
          onClick={closeModal}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-[#0c0c0c]/80 hover:bg-zinc-800 text-white border border-zinc-700 transition-all hover:scale-110"
          aria-label="Close details modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Video/Backdrop Banner */}
        <div className="relative aspect-video sm:aspect-[21/9] w-full bg-black overflow-hidden">
          <img
            src={media.backdropUrl}
            alt={media.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {media.trailerUrl && (
            <video
              ref={videoRef}
              src={media.trailerUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/40 to-transparent" />

          {/* Action Overlay inside Banner */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-20">
            <div className="space-y-2">
              <h2 className="font-display text-3xl sm:text-5xl text-white font-bold uppercase drop-shadow-lg">
                {media.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="modal-play-btn"
                  onClick={() => handlePlay()}
                  className="px-6 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-sm flex items-center gap-2 transition-transform hover:scale-105 shadow-xl"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Play
                </button>

                <button
                  id="modal-watchlist-btn"
                  onClick={() => toggleWatchlist(media)}
                  className={`p-2.5 rounded-full border transition-all ${
                    inWatchlist
                      ? 'bg-[#E50914] border-[#E50914] text-white shadow-md'
                      : 'bg-black/60 border-zinc-700 text-white hover:border-white hover:bg-black/80'
                  }`}
                  aria-label={inWatchlist ? 'Remove from My List' : 'Add to My List'}
                >
                  {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>

                <button
                  id="modal-rate-btn"
                  onClick={() => rateMedia(media.id, userRating === 'loved' ? 'liked' : 'loved')}
                  className={`p-2.5 rounded-full border transition-all ${
                    userRating === 'loved'
                      ? 'bg-[#E50914] border-[#E50914] text-white'
                      : userRating === 'liked'
                      ? 'border-white text-green-400 bg-black/60'
                      : 'bg-black/60 border-zinc-700 text-zinc-400 hover:border-white'
                  }`}
                  aria-label="Rate this title"
                >
                  {userRating === 'loved' ? (
                    <Heart className="w-4 h-4 fill-white text-white" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                </button>

                <button
                  id="modal-share-btn"
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-black/60 border border-zinc-700 text-zinc-300 hover:border-white hover:text-white transition-all"
                  aria-label="Share title"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    closeModal();
                    navigate(`/content/${media.id}`);
                  }}
                  className="p-2.5 rounded-full bg-black/60 border border-zinc-700 text-zinc-300 hover:border-white hover:text-white transition-all"
                  aria-label="Full Page View"
                  title="Full Details Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sound Toggle */}
            {media.trailerUrl && (
              <button
                id="modal-sound-btn"
                onClick={toggleSound}
                className="p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-zinc-700 transition-all"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Modal Tab Navigation */}
        <div className="flex border-b border-zinc-800 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overview
          </button>

          {media.type === 'tv' && media.seasons && (
            <button
              onClick={() => setActiveTab('episodes')}
              className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'episodes'
                  ? 'border-[#E50914] text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Episodes ({media.seasons.reduce((acc, s) => acc + s.episodes.length, 0)})
            </button>
          )}

          <button
            onClick={() => setActiveTab('similar')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'similar'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            More Like This
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300">
                  <span className="font-bold text-green-400">{media.matchPercentage}% Match</span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {media.releaseYear}
                  </span>
                  <span className="px-1.5 py-0.5 rounded border border-zinc-700 text-xs font-semibold text-zinc-300">
                    {media.maturityRating}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Clock className="w-3.5 h-3.5" />
                    {media.type === 'movie' ? `${media.duration} mins` : `${media.totalSeasons} Seasons`}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300">
                    {media.quality}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                  {media.synopsis}
                </p>

                {/* Rating & Review Section */}
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Audience Rating
                    </span>
                    <span className="text-sm font-extrabold text-yellow-400">
                      ★ {media.ratingScore} / 10
                    </span>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-2">
                    <textarea
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="Write your quick impression or review..."
                      className="w-full bg-[#0c0c0c] text-xs text-white p-2.5 rounded-lg border border-zinc-700 focus:border-[#E50914] focus:outline-none resize-none h-16"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingReview || !reviewText.trim()}
                        className="px-3.5 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] disabled:bg-zinc-800 text-white text-xs font-semibold transition-colors"
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Cast, Genres, Crew */}
              <div className="space-y-3 text-xs text-zinc-400">
                <div>
                  <span className="text-zinc-500 font-semibold block mb-0.5">Cast:</span>
                  <p className="text-zinc-200">{media.cast.join(', ')}</p>
                </div>

                <div>
                  <span className="text-zinc-500 font-semibold block mb-0.5">
                    {media.director ? 'Director:' : 'Creator:'}
                  </span>
                  <p className="text-zinc-200">{media.director || media.creator || 'N/A'}</p>
                </div>

                <div>
                  <span className="text-zinc-500 font-semibold block mb-0.5">Genres:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {media.genres.map(g => (
                      <span key={g} className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-700">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-500 font-semibold block mb-0.5">Audio:</span>
                  <p className="text-zinc-300">{media.audioLanguages.join(', ')}</p>
                </div>

                <div>
                  <span className="text-zinc-500 font-semibold block mb-0.5">Subtitles:</span>
                  <p className="text-zinc-300">{media.subtitles.join(', ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EPISODES (TV SERIES) */}
          {activeTab === 'episodes' && media.seasons && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Episodes</h3>
                {media.seasons.length > 1 && (
                  <select
                    value={selectedSeasonNumber}
                    onChange={e => setSelectedSeasonNumber(Number(e.target.value))}
                    className="bg-zinc-800 text-sm text-white px-3 py-1.5 rounded-lg border border-zinc-700 focus:border-[#E50914] focus:outline-none"
                  >
                    {media.seasons.map(s => (
                      <option key={s.id} value={s.seasonNumber}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="divide-y divide-zinc-800 space-y-1">
                {currentSeason?.episodes.map((ep: Episode) => (
                  <div
                    key={ep.id}
                    onClick={() => handlePlay(ep)}
                    className="py-4 px-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-zinc-900/80 rounded-xl cursor-pointer transition-colors group"
                  >
                    <span className="text-xl font-bold text-zinc-500 w-6 text-center shrink-0">
                      {ep.episodeNumber}
                    </span>

                    <div className="relative w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                      <img
                        src={ep.thumbnailUrl}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#E50914] transition-colors">
                          {ep.title}
                        </h4>
                        <span className="text-xs text-zinc-400 font-medium">{ep.duration}m</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {ep.synopsis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MORE LIKE THIS */}
          {activeTab === 'similar' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {similarTitles.length > 0 ? (
                similarTitles.map(sim => (
                  <div
                    key={sim.id}
                    onClick={() => openModal(sim)}
                    className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-all"
                  >
                    <div className="relative aspect-video w-full">
                      <img
                        src={sim.backdropUrl}
                        alt={sim.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                        {sim.maturityRating}
                      </span>
                    </div>

                    <div className="p-3 space-y-1.5">
                      <p className="text-xs font-bold text-white truncate">{sim.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="text-green-400 font-bold">{sim.matchPercentage}% Match</span>
                        <span>{sim.releaseYear}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-tight">
                        {sim.synopsis}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-zinc-500 text-sm">
                  No similar titles found at the moment.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

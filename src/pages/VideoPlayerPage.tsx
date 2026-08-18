import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useWatchlist } from '../context/WatchlistContext';
import { CURATED_MUSIC_TRACKS, YouTubeService } from '../services/youtubeService';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { YouTubeTrack } from '../types';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  BookmarkCheck,
  ListPlus,
  Tv,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Play,
  Send,
  Heart,
  MoreVertical,
  Music2,
  Video,
  Eye,
  Calendar,
  Check,
  Radio,
  Plus
} from 'lucide-react';

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  timeAgo: string;
  text: string;
  likes: number;
  isLiked?: boolean;
}

export const VideoPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const videoIdParam = searchParams.get('videoId');

  const {
    currentTrack,
    isPlaying,
    activePlayer,
    currentTime,
    duration,
    queue,
    setActivePlayer,
    switchToAudio,
    stopCurrentPlayer,
    videoPlayerRef,
    syncProgress,
    handleTrackEnded,
    handlePlayerPlay,
    handlePlayerPause,
    playTrack,
    playTrackById,
    addToQueue,
    nextTrack,
    toggleFavorite,
    isFavorite,
    randomSameArtistAutoplay,
    toggleRandomSameArtistAutoplay
  } = useMusic();

  const { isInWatchlist, addToWatchlist, removeFromWatchlist, showToast } = useWatchlist();

  // Local states
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(48200);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [hasDisliked, setHasDisliked] = useState<boolean>(false);

  // Recommendations
  const [recommendedTracks, setRecommendedTracks] = useState<YouTubeTrack[]>([]);

  // Comments state
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c1',
      author: 'Aria Sterling',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      timeAgo: '3 hours ago',
      text: 'The visuals in this 4K music video are absolutely breathtaking! StreamFlix audio clarity is on another level 🔥',
      likes: 142,
      isLiked: false
    },
    {
      id: 'c2',
      author: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      timeAgo: '1 day ago',
      text: 'Been having this on repeat all week. The direction and lighting at 2:15 are pure cinematic art.',
      likes: 89,
      isLiked: false
    },
    {
      id: 'c3',
      author: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      timeAgo: '2 days ago',
      text: 'Such a masterpiece visual and audio production. The best music video release of the month by far!',
      likes: 54,
      isLiked: false
    }
  ]);

  // Set activePlayer to video on mount and clean up on unmount
  useEffect(() => {
    setActivePlayer('video');
    return () => {
      try {
        videoPlayerRef.current?.pause();
        videoPlayerRef.current?.stop?.();
      } catch {
        // ignore
      }
    };
  }, [setActivePlayer, videoPlayerRef]);

  // Synchronize with URL videoId param
  useEffect(() => {
    if (videoIdParam && (!currentTrack || currentTrack.id !== videoIdParam)) {
      playTrackById(videoIdParam);
    } else if (!currentTrack && !videoIdParam && CURATED_MUSIC_TRACKS.length > 0) {
      playTrack(CURATED_MUSIC_TRACKS[0]);
    } else if (currentTrack && videoIdParam !== currentTrack.id) {
      setSearchParams({ videoId: currentTrack.id }, { replace: true });
    }
  }, [videoIdParam, currentTrack, playTrackById, playTrack, setSearchParams]);

  // Load recommendations
  useEffect(() => {
    const currentId = currentTrack?.id || videoIdParam || '4NRXx6U8ABQ';
    const recs = CURATED_MUSIC_TRACKS.filter(t => t.id !== currentId).slice(0, 10);
    setRecommendedTracks(recs);
  }, [currentTrack, videoIdParam]);

  const activeTrack = currentTrack || CURATED_MUSIC_TRACKS[0];
  const activeVideoId = activeTrack?.id || '4NRXx6U8ABQ';
  const isFav = activeTrack ? isFavorite(activeTrack.id) : false;

  // Convert track to MediaItem format for Watchlist
  const mediaItemData = activeTrack
    ? {
        id: `music-${activeTrack.id}`,
        title: activeTrack.title,
        slug: activeTrack.id,
        type: 'movie' as const,
        synopsis: activeTrack.description || `Official music video for ${activeTrack.title} by ${activeTrack.artist}.`,
        releaseYear: 2024,
        maturityRating: 'PG-13' as const,
        quality: '4K Ultra HD' as const,
        ratingScore: 9.8,
        matchPercentage: 98,
        posterUrl: activeTrack.thumbnailUrl,
        backdropUrl: activeTrack.thumbnailUrl,
        genres: [activeTrack.genre || 'Music Video', 'Pop'],
        directors: [activeTrack.artist],
        cast: [activeTrack.artist],
        duration: activeTrack.duration || '3:30',
        videoUrl: `https://www.youtube.com/watch?v=${activeTrack.id}`,
        featured: false,
        trending: true
      }
    : null;

  const inWatchlist = mediaItemData ? isInWatchlist(mediaItemData.id) : false;

  const handleBack = () => {
    setActivePlayer('audio');
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/music');
    }
  };

  const handleSwitchToAudio = () => {
    switchToAudio(navigate);
  };

  const handleSelectRecommendation = (track: YouTubeTrack) => {
    playTrack(track);
    setSearchParams({ videoId: track.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setHasLiked(true);
      if (hasDisliked) setHasDisliked(false);
      setLikeCount(prev => prev + 1);
      showToast('Liked Video', 'Added to your liked videos.', 'success');
    }
  };

  const handleToggleDislike = () => {
    if (hasDisliked) {
      setHasDisliked(false);
    } else {
      setHasDisliked(true);
      if (hasLiked) {
        setHasLiked(false);
        setLikeCount(prev => prev - 1);
      }
    }
  };

  const handleToggleSubscribe = () => {
    setIsSubscribed(prev => {
      const next = !prev;
      if (next) {
        showToast('Subscribed', `Subscribed to ${activeTrack?.artist || 'Artist'}.`, 'success');
      }
      return next;
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      const url = `${window.location.origin}/music/video?videoId=${activeVideoId}`;
      navigator.clipboard.writeText(url);
      showToast('Link Copied', 'Video URL copied to clipboard.', 'success');
    }
  };

  const handleToggleWatchlist = () => {
    if (!mediaItemData) return;
    if (inWatchlist) {
      removeFromWatchlist(mediaItemData.id);
      showToast('Removed from My List', activeTrack?.title || '', 'info');
    } else {
      addToWatchlist(mediaItemData);
      showToast('Saved to My List', activeTrack?.title || '', 'success');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      author: 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      timeAgo: 'Just now',
      text: newCommentText.trim(),
      likes: 1,
      isLiked: true
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    showToast('Comment Posted', 'Your comment has been published.', 'success');
  };

  const handleToggleCommentLike = (commentId: string) => {
    setComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          const nextLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextLiked,
            likes: nextLiked ? c.likes + 1 : c.likes - 1
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white pt-16 sm:pt-20 pb-28 selection:bg-[#E50914] selection:text-white font-sans">
      {/* Top Header Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06]">
        {/* Left: Back to Music Button */}
        <div className="flex items-center gap-3">
          <button
            id="video-back-btn"
            onClick={handleBack}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-all active:scale-95"
            aria-label="Back to Music"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Music</span>
          </button>

          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs font-mono text-zinc-400">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>4K Ultra HD Cinema Video</span>
          </div>
        </div>

        {/* Center: Shared Audio / Video Mode Switcher */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-full border border-white/15 shadow-inner">
          <button
            id="video-mode-switch-audio"
            onClick={handleSwitchToAudio}
            className="px-3.5 sm:px-4 py-1 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-all"
            title="Switch to Audio Player Mode"
          >
            <Music2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
            <span>Audio</span>
          </button>

          <button
            id="video-mode-switch-video"
            className="px-3.5 sm:px-4 py-1 rounded-full text-xs font-bold bg-[#E50914] text-white shadow-md flex items-center gap-1.5 transition-all cursor-default"
            aria-current="page"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>
        </div>

        {/* Right: Switch to Audio button & Theater Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            id="video-switch-audio-btn"
            onClick={handleSwitchToAudio}
            className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            title="Switch to Audio Mode"
          >
            <Music2 className="w-4 h-4 text-red-400" />
            <span>Switch to Audio</span>
          </button>

          <button
            onClick={() => setIsTheaterMode(prev => !prev)}
            className={`hidden lg:flex p-2 rounded-full border transition-all text-xs font-semibold items-center gap-1.5 ${
              isTheaterMode
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Layout (Two Columns on Desktop / Stacked on Mobile) */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 transition-all duration-300 ${
          isTheaterMode ? 'max-w-none px-2 sm:px-6' : ''
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Dedicated Video Player, Metadata, Controls, & Comments */}
          <div className={isTheaterMode ? 'lg:col-span-3 space-y-6' : 'lg:col-span-2 space-y-6'}>
            {/* Embedded YouTube Player Container (16:9 Cinema Aspect Ratio) */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-[0_15px_40px_rgba(0,0,0,0.9)] border border-white/[0.1] ring-1 ring-white/5">
              <YouTubePlayer
                ref={videoPlayerRef}
                videoId={activeVideoId}
                autoplay={isPlaying}
                startTime={currentTime}
                controls={true}
                className="w-full h-full"
                onPlay={handlePlayerPlay}
                onPause={handlePlayerPause}
                onEnded={handleTrackEnded}
                onProgress={syncProgress}
              />
            </div>

            {/* Video Title */}
            <div className="space-y-3">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {activeTrack?.title || 'StreamFlix Music Video'}
              </h1>

              {/* Channel / Artist Row & Interactive Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-white/[0.08] pb-5">
                {/* Artist / Channel Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-red-500/50 bg-zinc-900 shadow-md">
                    <img
                      src={activeTrack?.thumbnailUrl}
                      alt={activeTrack?.artist}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm sm:text-base font-bold text-white truncate hover:text-[#E50914] cursor-pointer transition-colors">
                        {activeTrack?.artist || 'StreamFlix Artist'}
                      </h2>
                      <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">4.82M subscribers</p>
                  </div>

                  {/* Subscribe Button */}
                  <button
                    id="video-subscribe-btn"
                    onClick={handleToggleSubscribe}
                    className={`ml-2 sm:ml-4 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
                      isSubscribed
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                        : 'bg-white hover:bg-zinc-200 text-black shadow-white/10'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>

                {/* Video Action Buttons (Like/Dislike, Share, Add to Queue, My List) */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {/* Like / Dislike Pill */}
                  <div className="flex items-center rounded-full bg-white/[0.06] border border-white/10 overflow-hidden shadow-sm">
                    <button
                      id="video-like-btn"
                      onClick={handleToggleLike}
                      className={`px-3.5 py-2 flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors ${
                        hasLiked ? 'text-[#E50914] bg-red-600/20' : 'text-zinc-300 hover:text-white'
                      }`}
                      title="I like this"
                    >
                      <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-[#E50914]' : ''}`} />
                      <span>{likeCount.toLocaleString()}</span>
                    </button>
                    <div className="w-[1px] h-4 bg-zinc-700" />
                    <button
                      id="video-dislike-btn"
                      onClick={handleToggleDislike}
                      className={`px-3 py-2 text-zinc-300 hover:text-white transition-colors ${
                        hasDisliked ? 'text-red-400 bg-red-600/20' : ''
                      }`}
                      title="I dislike this"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Share Button */}
                  <button
                    id="video-share-btn"
                    onClick={handleShare}
                    className="px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    title="Share Video"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  {/* Add to Queue Button */}
                  <button
                    id="video-add-queue-btn"
                    onClick={() => {
                      if (activeTrack) {
                        addToQueue(activeTrack);
                        showToast('Added to Queue', activeTrack.title, 'success');
                      }
                    }}
                    className="px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    title="Add to Queue"
                  >
                    <ListPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add to Queue</span>
                  </button>

                  {/* Save to My List */}
                  <button
                    id="video-watchlist-btn"
                    onClick={handleToggleWatchlist}
                    className={`p-2 sm:px-3.5 sm:py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                      inWatchlist
                        ? 'bg-red-600/20 text-[#E50914] border-red-500/40'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border-white/10'
                    }`}
                    title={inWatchlist ? 'In My List' : 'Save to My List'}
                  >
                    {inWatchlist ? (
                      <BookmarkCheck className="w-4 h-4 text-[#E50914]" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                      {inWatchlist ? 'Saved' : 'Save'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Expandable Video Description Card */}
            <div
              onClick={() => setIsDescriptionExpanded(prev => !prev)}
              className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-white/[0.06] cursor-pointer transition-all duration-300 space-y-2"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold text-white">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-zinc-400" />
                  {activeTrack?.viewCount || '1.8M views'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Premiered {activeTrack?.publishedAt || 'Recently'}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] font-mono text-zinc-300">
                  {activeTrack?.genre || 'Official Music'}
                </span>
              </div>

              <p
                className={`text-xs sm:text-sm text-zinc-300 leading-relaxed ${
                  isDescriptionExpanded ? '' : 'line-clamp-2'
                }`}
              >
                {activeTrack?.description ||
                  `StreamFlix official presentation of "${activeTrack?.title}" performed by ${activeTrack?.artist}. Experience high-fidelity audio, master visuals, and cinema-grade playback.`}
              </p>

              <button
                className="text-xs font-bold text-white hover:text-red-400 transition-colors pt-1 block"
                aria-label="Toggle description"
              >
                {isDescriptionExpanded ? 'Show less' : '...more'}
              </button>
            </div>

            {/* Comments Section */}
            <div className="pt-4 space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#E50914]" />
                  <h3 className="font-bold text-lg text-white">
                    {comments.length} Comments
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-mono">StreamFlix Community</span>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  U
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    placeholder="Add a friendly comment about this music video..."
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  {newCommentText.trim() && (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCommentText('')}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Comment</span>
                      </button>
                    </div>
                  )}
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.id} className="flex items-start gap-3 group">
                    <img
                      src={c.avatar}
                      alt={c.author}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-zinc-700"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{c.author}</span>
                        <span className="text-[11px] text-zinc-500">{c.timeAgo}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{c.text}</p>
                      <div className="flex items-center gap-3 pt-1 text-xs text-zinc-400">
                        <button
                          onClick={() => handleToggleCommentLike(c.id)}
                          className={`flex items-center gap-1 hover:text-white transition-colors ${
                            c.isLiked ? 'text-[#E50914]' : ''
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${c.isLiked ? 'fill-[#E50914]' : ''}`} />
                          <span>{c.likes}</span>
                        </button>
                        <button className="hover:text-white transition-colors">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Up Next Panel (Recommendations + Autoplay) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Up Next Header with Autoplay Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/80 border border-white/[0.06] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E50914]" />
                <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                  Up Next
                </h3>
              </div>

              {/* Autoplay Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400">Autoplay</span>
                <button
                  id="video-autoplay-toggle"
                  onClick={toggleRandomSameArtistAutoplay}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    randomSameArtistAutoplay ? 'bg-[#E50914]' : 'bg-zinc-700'
                  }`}
                  aria-label="Toggle Autoplay"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      randomSameArtistAutoplay ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-2.5 max-h-[850px] overflow-y-auto pr-1">
              {recommendedTracks.map((rec, index) => {
                const isSelected = rec.id === activeVideoId;
                return (
                  <div
                    key={`rec-${rec.id}-${index}`}
                    onClick={() => handleSelectRecommendation(rec)}
                    className={`group relative flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#E50914]/20 border border-red-500/50'
                        : 'bg-zinc-900/40 hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden shrink-0 bg-black border border-zinc-800">
                      <img
                        src={rec.thumbnailUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-zinc-300 backdrop-blur-sm">
                        {rec.duration || '3:30'}
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </div>
                    </div>

                    {/* Title & Channel */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4
                        className={`text-xs sm:text-sm font-bold line-clamp-2 leading-tight transition-colors ${
                          isSelected ? 'text-[#E50914]' : 'text-white group-hover:text-red-400'
                        }`}
                        title={rec.title}
                      >
                        {rec.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">{rec.artist}</p>
                      <p className="text-[10px] font-mono text-zinc-500">
                        {rec.viewCount || '1.4M views'}
                      </p>
                    </div>

                    {/* Quick Add to Queue */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        addToQueue(rec);
                        showToast('Added to Queue', rec.title, 'success');
                      }}
                      className="p-1 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Add to queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;

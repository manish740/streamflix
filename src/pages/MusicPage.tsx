import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { useWatchlist } from '../context/WatchlistContext';
import { YouTubeService, CURATED_MUSIC_TRACKS } from '../services/youtubeService';
import { YouTubeTrack } from '../types';
import { SongCard } from '../components/SongCard';
import {
  Search,
  Sparkles,
  TrendingUp,
  History,
  Play,
  Plus,
  Flame,
  Music,
  Headphones,
  Video,
  Radio,
  ListMusic,
  RefreshCw,
  X,
  Disc3,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

export const MusicPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    playTrack,
    currentTrack,
    isPlaying,
    recentlyPlayed,
    clearRecentlyPlayed,
    toggleQueue,
    addToQueue,
    queue
  } = useMusic();

  const { showToast } = useWatchlist();

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeTrack[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState<number | undefined>(undefined);

  // Discovery Row States
  const [trendingTracks, setTrendingTracks] = useState<YouTubeTrack[]>(CURATED_MUSIC_TRACKS.slice(0, 10));
  const [popularTracks, setPopularTracks] = useState<YouTubeTrack[]>(
    CURATED_MUSIC_TRACKS.filter(t => t.category === 'popular' || t.category === 'trending')
  );
  const [soundtracks, setSoundtracks] = useState<YouTubeTrack[]>(
    CURATED_MUSIC_TRACKS.filter(t => t.category === 'soundtrack' || t.genre?.includes('Cinematic'))
  );
  const [electronicTracks, setElectronicTracks] = useState<YouTubeTrack[]>(
    CURATED_MUSIC_TRACKS.filter(t => t.category === 'electronic' || t.category === 'lofi')
  );
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const genres = ['All', 'Karan Aujla', 'AP Dhillon', 'Arijit Singh', 'Diljit Dosanjh', 'Punjabi', 'Bollywood', 'Trending', 'Pop', 'Cinematic', 'Lo-Fi'];

  // Spotlight Track
  const spotlightTrack = trendingTracks[0] || CURATED_MUSIC_TRACKS[0];

  // Fetch initial trending data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingInitial(true);
      try {
        const trending = await YouTubeService.getTrendingMusicVideos();
        if (isMounted && trending.length > 0) {
          setTrendingTracks(trending.slice(0, 10));
        }
      } catch {
        // Handled by service fallback
      } finally {
        if (isMounted) setIsLoadingInitial(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time search handler with debounce, reset, and request cancellation
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setNextPageToken(undefined);
      setIsSearching(false);
      setIsLoadingMore(false);
      return;
    }

    setIsSearching(true);
    setNextPageToken(undefined);

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await YouTubeService.searchYouTubeVideosWithPagination(
          query,
          undefined,
          50,
          controller.signal
        );

        // Deduplicate within the first page
        const seen = new Set<string>();
        const uniqueTracks = res.tracks.filter(t => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });

        setSearchResults(uniqueTracks);
        setNextPageToken(res.nextPageToken);
        setTotalResults(res.totalResults);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('YouTube search error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

  // Load More function (fetches next page with nextPageToken and appends without replacing)
  const handleLoadMore = useCallback(async () => {
    if (!nextPageToken || isLoadingMore || isSearching || !searchQuery.trim()) return;

    setIsLoadingMore(true);
    try {
      const res = await YouTubeService.searchYouTubeVideosWithPagination(
        searchQuery.trim(),
        nextPageToken,
        50
      );

      setSearchResults(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const uniqueNewTracks = res.tracks.filter(t => !existingIds.has(t.id));
        return [...prev, ...uniqueNewTracks];
      });

      setNextPageToken(res.nextPageToken);
      if (res.totalResults) {
        setTotalResults(res.totalResults);
      }
    } catch (err) {
      console.error('Failed to load next page of YouTube results:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, isLoadingMore, isSearching, searchQuery]);

  // Automated infinite scrolling via IntersectionObserver
  useEffect(() => {
    if (!nextPageToken || isLoadingMore || isSearching) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '300px' }
    );

    const target = sentinelRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [nextPageToken, isLoadingMore, isSearching, handleLoadMore]);

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    if (genre === 'All') {
      setSearchQuery('');
    } else {
      setSearchQuery(genre);
    }
  };

  const handlePlaySpotlight = () => {
    if (spotlightTrack) {
      playTrack(spotlightTrack, trendingTracks);
      showToast('Now Playing', spotlightTrack.title, 'info');
    }
  };

  const handleAddToQueueSpotlight = () => {
    if (spotlightTrack) {
      addToQueue(spotlightTrack);
      showToast('Added to Queue', spotlightTrack.title, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20 sm:pt-24 pb-32 selection:bg-[#E50914] selection:text-white">
      {/* Top-Left Aligned Live Discovery Header & Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6 pt-4 sm:pt-6">
        {/* Top-Left Live Discovery Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            {/* Red Live / Broadcast Indicator */}
            <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.9)]"></span>
            </span>
            <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-red-500 shrink-0 stroke-[2]" />
            <h1 className="font-inter text-2xl sm:text-[28px] lg:text-[32px] font-semibold text-slate-100 tracking-tight">
              Live Discovery
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              id="music-queue-toggle-btn"
              onClick={toggleQueue}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-sm font-semibold flex items-center gap-2 transition-colors text-zinc-300 hover:text-white backdrop-blur-md"
            >
              <ListMusic className="w-4 h-4 text-[#E50914]" />
              <span>Queue ({queue.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar Input with Real-time feedback */}
        <div className="relative max-w-4xl">
          <div className="search-glass-container rounded-full px-5 py-3.5 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4 shadow-2xl relative">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white/65 shrink-0 stroke-[1.75]" />
            <input
              id="youtube-music-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists, Punjabi, Bollywood, or soundtracks..."
              className="search-glass-input w-full text-base sm:text-lg font-medium text-white/90 placeholder-white/50 tracking-[0.015em] antialiased"
            />
            {isSearching && (
              <RefreshCw className="w-5 h-5 text-white/70 animate-spin shrink-0" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Clear search"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            )}
          </div>

          {/* Genre / Mood Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => handleGenreSelect(genre)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedGenre === genre && (!searchQuery || searchQuery.toLowerCase() === genre.toLowerCase())
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH RESULTS VIEW */}
        {searchQuery.trim() && (
          <section className="space-y-6 pt-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#E50914]" />
                Results for &quot;{searchQuery}&quot;
              </h2>
              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                <span>
                  Showing {searchResults.length} {searchResults.length === 1 ? 'video' : 'videos'}
                </span>
                {totalResults && totalResults > searchResults.length && (
                  <span className="text-zinc-500">of {totalResults}+</span>
                )}
              </div>
            </div>

            {/* Initial Searching Skeletons */}
            {isSearching && searchResults.length === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="bg-zinc-900/60 rounded-xl overflow-hidden animate-pulse border border-zinc-800/40 p-3 space-y-3"
                  >
                    <div className="aspect-video bg-zinc-800 rounded-lg" />
                    <div className="h-4 bg-zinc-800 rounded w-3/4" />
                    <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Responsive Results Grid */}
            {searchResults.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {searchResults.map((track, idx) => (
                    <SongCard key={`${track.id}-${idx}`} track={track} />
                  ))}
                </div>

                {/* Loading More Indicator */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-6 gap-3 text-sm text-zinc-400 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
                    <RefreshCw className="w-5 h-5 text-[#E50914] animate-spin" />
                    <span>Loading more results...</span>
                  </div>
                )}

                {/* Load More Button & Pagination Controls */}
                {nextPageToken && !isLoadingMore && (
                  <div className="flex flex-col items-center justify-center pt-2 pb-6 gap-2">
                    <button
                      id="youtube-load-more-btn"
                      onClick={handleLoadMore}
                      className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-semibold text-white transition-all shadow-lg hover:shadow-red-900/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ChevronDown className="w-4 h-4 text-[#E50914]" />
                      <span>Load More Results (Next 50)</span>
                    </button>
                    <span className="text-xs text-zinc-500">
                      Scroll down to automatically load more
                    </span>
                  </div>
                )}

                {/* End of Results Indicator */}
                {!nextPageToken && !isLoadingMore && !isSearching && searchResults.length > 0 && (
                  <div className="flex items-center justify-center py-8 text-center text-xs font-mono text-zinc-500 gap-2 border-t border-zinc-900 mt-8">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500/70" />
                    <span>You&apos;ve reached the end of the results.</span>
                  </div>
                )}

                {/* Sentinel element for infinite scroll observer */}
                <div ref={sentinelRef} className="h-10 w-full pointer-events-none" />
              </div>
            ) : (
              !isSearching && (
                <div className="py-16 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 p-6">
                  <Headphones className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
                  <p className="text-sm font-semibold text-zinc-300">No tracks found for this query</p>
                  <p className="text-xs text-zinc-500 mt-1">Try searching for an artist name, song title, or genre.</p>
                </div>
              )
            )}
          </section>
        )}

        {/* DEFAULT DISCOVERY VIEW (When not actively searching) */}
        {!searchQuery.trim() && (
          <div className="space-y-12">
            {/* SPOTLIGHT HERO BANNER */}
            {spotlightTrack && (
              <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-zinc-800 shadow-2xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                {/* Backdrop ambient blur */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-2xl scale-125 pointer-events-none"
                  style={{ backgroundImage: `url(${spotlightTrack.thumbnailUrl})` }}
                />

                {/* Left Artwork */}
                <div className="relative w-full sm:w-80 aspect-video sm:aspect-square rounded-xl overflow-hidden shadow-2xl shrink-0 border border-zinc-700 group">
                  <img
                    src={spotlightTrack.thumbnailUrl}
                    alt={spotlightTrack.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-mono">{spotlightTrack.duration}</span>
                    <span className="px-2 py-0.5 rounded bg-black/80 font-bold text-red-500 border border-red-900/50">
                      #1 Trending
                    </span>
                  </div>
                </div>

                {/* Right Info & Play Action */}
                <div className="relative z-10 space-y-4 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      Spotlight Track
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {spotlightTrack.viewCount}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-white leading-none">
                    {spotlightTrack.title}
                  </h2>

                  <p className="text-base sm:text-lg text-zinc-300 font-medium">
                    {spotlightTrack.artist}
                  </p>

                  <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                    {spotlightTrack.description ||
                      'Stream the official music video with rich playback, queue support, and synchronized lyrics.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      id="music-play-spotlight-audio-btn"
                      onClick={() => {
                        if (spotlightTrack) {
                          playTrack(spotlightTrack, trendingTracks);
                          navigate(`/music/audio?videoId=${spotlightTrack.id}`);
                        }
                      }}
                      className="px-5 py-3 rounded-full bg-[#E50914] hover:bg-[#b80710] text-white font-bold flex items-center gap-2 text-sm transition-all shadow-xl shadow-red-900/40 hover:scale-105 active:scale-95"
                    >
                      <Headphones className="w-4 h-4" />
                      <span>Listen Audio</span>
                    </button>
                    <button
                      id="music-play-spotlight-video-btn"
                      onClick={() => {
                        if (spotlightTrack) {
                          playTrack(spotlightTrack, trendingTracks);
                          navigate(`/music/video?videoId=${spotlightTrack.id}`);
                        }
                      }}
                      className="px-5 py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-bold flex items-center gap-2 text-sm transition-all shadow-xl shadow-white/10 hover:scale-105 active:scale-95"
                    >
                      <Video className="w-4 h-4" />
                      <span>Watch Video</span>
                    </button>
                    <button
                      id="music-queue-spotlight-btn"
                      onClick={handleAddToQueueSpotlight}
                      className="px-4 py-3 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white font-semibold flex items-center gap-2 text-sm transition-all border border-zinc-700 hover:border-zinc-500"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Queue</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* RECENTLY PLAYED ROW (If Any) */}
            {recentlyPlayed.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-red-500" />
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                      Recently Played
                    </h3>
                  </div>
                  <button
                    onClick={clearRecentlyPlayed}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Clear History
                  </button>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {recentlyPlayed.map((track, idx) => (
                    <SongCard key={`recent-${track.id}-${idx}`} track={track} />
                  ))}
                </div>
              </section>
            )}

            {/* TRENDING MUSIC VIDEOS ROW */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#E50914]" />
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                    Trending Music Videos
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-mono">Updated hourly</span>
              </div>

              <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
                {trendingTracks.map((track, idx) => (
                  <SongCard key={track.id} track={track} rank={idx + 1} />
                ))}
              </div>
            </section>

            {/* POPULAR HITS & CHART TOPPERS */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Popular Songs & Global Hits
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {popularTracks.map(track => (
                  <SongCard key={track.id} track={track} />
                ))}
              </div>
            </section>

            {/* CINEMATIC SOUNDTRACKS ROW */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Soundtracks & Scores
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {soundtracks.map(track => (
                  <SongCard key={track.id} track={track} />
                ))}
              </div>
            </section>

            {/* ELECTRONIC & LO-FI ROW */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-purple-400" />
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Electronic & Lo-Fi Beats
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {electronicTracks.map(track => (
                  <SongCard key={track.id} track={track} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
export default MusicPage;

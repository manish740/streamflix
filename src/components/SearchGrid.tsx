import React, { useState, useMemo } from 'react';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';
import { MOCK_GENRES } from '../data/mockData';
import { EmptyState } from './LoadingSkeleton';
import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';

interface SearchGridProps {
  query: string;
  allMedia: MediaItem[];
  onQueryChange?: (newQuery: string) => void;
  onClearQuery: () => void;
}

export const SearchGrid: React.FC<SearchGridProps> = ({
  query,
  allMedia,
  onQueryChange,
  onClearQuery
}) => {
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'match' | 'year' | 'rating' | 'title'>('match');

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allMedia
      .filter(item => {
        // Query match
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.synopsis.toLowerCase().includes(q) ||
          item.cast.some(c => c.toLowerCase().includes(q)) ||
          (item.director || item.creator || '').toLowerCase().includes(q) ||
          item.genres.some(g => g.toLowerCase().includes(q)) ||
          item.tags.some(t => t.toLowerCase().includes(q));

        // Type match
        const matchesType = selectedType === 'all' || item.type === selectedType;

        // Genre match
        const matchesGenre = selectedGenre === 'All' || item.genres.includes(selectedGenre);

        return matchesQuery && matchesType && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'year') return b.releaseYear - a.releaseYear;
        if (sortBy === 'rating') return b.ratingScore - a.ratingScore;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return b.matchPercentage - a.matchPercentage;
      });
  }, [allMedia, query, selectedType, selectedGenre, sortBy]);

  return (
    <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto min-h-[70vh]">
      {/* Premium Cinematic Glassmorphic Search Bar */}
      <div className="mb-8 max-w-[960px] mx-auto w-full">
        <div className="search-glass-container rounded-full px-5 py-3.5 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4 shadow-2xl relative">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white/65 shrink-0 stroke-[1.75]" />
          <input
            id="streamflix-main-search-input"
            type="text"
            value={query}
            onChange={e => onQueryChange?.(e.target.value)}
            placeholder="Search movies, shows, songs, genres, cast..."
            className="search-glass-input w-full text-base sm:text-lg font-medium text-white/90 placeholder-white/50 tracking-[0.015em] antialiased"
            autoFocus
          />
          {query && (
            <button
              id="search-clear-btn"
              onClick={onClearQuery}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Clear search input"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          )}
        </div>
      </div>

      {/* Search Header and Meta */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-inter">
              {query ? (
                <span>
                  Results for <span className="text-white font-extrabold">&ldquo;{query}&rdquo;</span>
                </span>
              ) : (
                'Explore All Titles'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-inter">
              Found {filteredResults.length} {filteredResults.length === 1 ? 'title' : 'titles'} in the catalog
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            <select
              id="search-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-zinc-900/80 text-xs text-white px-3 py-1.5 rounded-lg border border-zinc-800 focus:border-white/30 focus:outline-none cursor-pointer"
            >
              <option value="match">Sort by: Recommended (Match %)</option>
              <option value="rating">Sort by: Critic Rating</option>
              <option value="year">Sort by: Release Year</option>
              <option value="title">Sort by: Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {/* Type toggles */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-lg border border-white/10 mr-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedType === 'all' ? 'bg-[#E50914] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('movie')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedType === 'movie' ? 'bg-[#E50914] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setSelectedType('tv')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedType === 'tv' ? 'bg-[#E50914] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              TV Shows
            </button>
          </div>

          {/* Genre chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {MOCK_GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedGenre === genre
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {filteredResults.map(item => (
            <div key={item.id} className="w-full">
              <MovieCard media={item} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Matching Titles Found"
          description={`We couldn't find any movies or TV series matching "${query}". Try searching for another keyword, director, or actor.`}
          actionText="Clear Search & View Trending"
          onAction={onClearQuery}
        />
      )}
    </div>
  );
};

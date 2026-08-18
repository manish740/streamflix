import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_MEDIA, MOCK_GENRES } from '../data/mockData';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';
import { MovieCard } from '../components/MovieCard';
import { Film, SlidersHorizontal, Grid, List } from 'lucide-react';

export const MoviesPage: React.FC = () => {
  const { activeProfile } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'year' | 'title'>('match');
  const [viewMode, setViewMode] = useState<'rows' | 'grid'>('rows');

  const movies = useMemo(() => {
    let list = MOCK_MEDIA.filter(m => m.type === 'movie');
    if (activeProfile?.isKids) {
      list = list.filter(item =>
        ['G', 'PG', 'TV-G', 'TV-PG'].includes(item.maturityRating)
      );
    }
    return list;
  }, [activeProfile?.isKids]);

  const featuredMovie = useMemo(() => {
    return movies.find(m => m.featured) || movies[0] || MOCK_MEDIA[0];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    let list = [...movies];
    if (selectedGenre !== 'All') {
      list = list.filter(m => m.genres.includes(selectedGenre));
    }
    return list.sort((a, b) => {
      if (sortBy === 'rating') return b.ratingScore - a.ratingScore;
      if (sortBy === 'year') return b.releaseYear - a.releaseYear;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.matchPercentage - a.matchPercentage;
    });
  }, [movies, selectedGenre, sortBy]);

  const sciFiMovies = useMemo(() => movies.filter(m => m.genres.includes('Sci-Fi')), [movies]);
  const actionMovies = useMemo(() => movies.filter(m => m.genres.includes('Action')), [movies]);
  const dramaMovies = useMemo(() => movies.filter(m => m.genres.includes('Drama')), [movies]);
  const thrillerMovies = useMemo(
    () => movies.filter(m => m.genres.some(g => g.includes('Thriller') || g.includes('Crime'))),
    [movies]
  );
  const animeMovies = useMemo(() => movies.filter(m => m.genres.includes('Anime')), [movies]);

  return (
    <div className="space-y-0 pb-16">
      {/* Featured Movie Hero Banner */}
      <HeroBanner media={featuredMovie} />

      {/* Subheader & Controls Bar */}
      <div className="-mt-16 sm:-mt-24 md:-mt-32 relative z-30 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-6">
        <div className="bg-[#0c0c0c]/90 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800 text-[#E50914] flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Feature Films & Movies</h1>
              <p className="text-xs text-zinc-400">
                Explore blockbuster cinema, 4K Ultra HD masterpieces, and indie favorites
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Genre dropdown */}
            <select
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              className="bg-zinc-900 text-xs text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-[#E50914] focus:outline-none"
            >
              <option value="All">All Genres</option>
              {MOCK_GENRES.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-zinc-900 text-xs text-white px-3 py-2 rounded-lg border border-zinc-700 focus:border-[#E50914] focus:outline-none"
            >
              <option value="match">Sort: Recommended</option>
              <option value="rating">Sort: Critic Score</option>
              <option value="year">Sort: Year (Newest)</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setViewMode('rows')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'rows' ? 'bg-[#E50914] text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Curated Rows"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-[#E50914] text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid Catalog"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View: Grid or Rows */}
      {viewMode === 'grid' || selectedGenre !== 'All' ? (
        <div className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-semibold text-zinc-400">
            Showing {filteredMovies.length} movies in &ldquo;{selectedGenre}&rdquo;
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMovies.map(movie => (
              <MovieCard key={movie.id} media={movie} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8 pb-10">
          <MovieRow
            id="movies-top-rated"
            title="Critically Acclaimed Movies"
            subtitle="Top rated masterpieces in 4K"
            items={[...movies].sort((a, b) => b.ratingScore - a.ratingScore)}
          />

          {sciFiMovies.length > 0 && (
            <MovieRow
              id="movies-scifi"
              title="Sci-Fi & Cosmic Worlds"
              subtitle="Mind-bending adventures"
              items={sciFiMovies}
            />
          )}

          {actionMovies.length > 0 && (
            <MovieRow
              id="movies-action"
              title="High-Octane Action Movies"
              subtitle="Explosive fights and racing thrillers"
              items={actionMovies}
            />
          )}

          {thrillerMovies.length > 0 && (
            <MovieRow
              id="movies-thrillers"
              title="Psychological Crime & Thrillers"
              items={thrillerMovies}
            />
          )}

          {dramaMovies.length > 0 && (
            <MovieRow
              id="movies-dramas"
              title="Award-Winning Dramas"
              items={dramaMovies}
            />
          )}

          {animeMovies.length > 0 && (
            <MovieRow
              id="movies-anime"
              title="Anime Movies & Features"
              items={animeMovies}
            />
          )}
        </div>
      )}
    </div>
  );
};

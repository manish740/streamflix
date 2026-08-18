import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_MEDIA, MOCK_GENRES } from '../data/mockData';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';
import { MovieCard } from '../components/MovieCard';
import { Tv, Grid, List } from 'lucide-react';

export const TvShowsPage: React.FC = () => {
  const { activeProfile } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'year' | 'title'>('match');
  const [viewMode, setViewMode] = useState<'rows' | 'grid'>('rows');

  const tvShows = useMemo(() => {
    let list = MOCK_MEDIA.filter(m => m.type === 'tv');
    if (activeProfile?.isKids) {
      list = list.filter(item =>
        ['G', 'PG', 'TV-G', 'TV-Y', 'TV-Y7', 'TV-PG'].includes(item.maturityRating)
      );
    }
    return list;
  }, [activeProfile?.isKids]);

  const featuredShow = useMemo(() => {
    return tvShows.find(m => m.featured) || tvShows[0] || MOCK_MEDIA[1];
  }, [tvShows]);

  const filteredShows = useMemo(() => {
    let list = [...tvShows];
    if (selectedGenre !== 'All') {
      list = list.filter(m => m.genres.includes(selectedGenre));
    }
    return list.sort((a, b) => {
      if (sortBy === 'rating') return b.ratingScore - a.ratingScore;
      if (sortBy === 'year') return b.releaseYear - a.releaseYear;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.matchPercentage - a.matchPercentage;
    });
  }, [tvShows, selectedGenre, sortBy]);

  const sciFiShows = useMemo(() => tvShows.filter(m => m.genres.includes('Sci-Fi')), [tvShows]);
  const dramaShows = useMemo(() => tvShows.filter(m => m.genres.includes('Drama')), [tvShows]);
  const crimeShows = useMemo(
    () => tvShows.filter(m => m.genres.some(g => g.includes('Crime') || g.includes('Thriller'))),
    [tvShows]
  );
  const animeShows = useMemo(() => tvShows.filter(m => m.genres.includes('Anime')), [tvShows]);
  const docuseries = useMemo(() => tvShows.filter(m => m.genres.includes('Docuseries')), [tvShows]);

  return (
    <div className="space-y-0 pb-16">
      {/* Featured Show Hero Banner */}
      <HeroBanner media={featuredShow} />

      {/* Subheader & Controls Bar */}
      <div className="-mt-16 sm:-mt-24 md:-mt-32 relative z-30 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto mb-6">
        <div className="bg-[#0c0c0c]/90 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800 text-[#E50914] flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">TV Shows & Series</h1>
              <p className="text-xs text-zinc-400">
                Multi-season drama series, award-winning docuseries, and original episodic sagas
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
            Showing {filteredShows.length} TV series in &ldquo;{selectedGenre}&rdquo;
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredShows.map(show => (
              <MovieCard key={show.id} media={show} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8 pb-10">
          <MovieRow
            id="tv-top-rated"
            title="Binge-Worthy Series"
            subtitle="Top rated TV shows right now"
            items={[...tvShows].sort((a, b) => b.ratingScore - a.ratingScore)}
          />

          {sciFiShows.length > 0 && (
            <MovieRow
              id="tv-scifi"
              title="Sci-Fi & Cyberpunk Series"
              items={sciFiShows}
            />
          )}

          {crimeShows.length > 0 && (
            <MovieRow
              id="tv-crime"
              title="Psychological Crime Mysteries"
              items={crimeShows}
            />
          )}

          {dramaShows.length > 0 && (
            <MovieRow
              id="tv-dramas"
              title="Gripping Drama Series"
              items={dramaShows}
            />
          )}

          {animeShows.length > 0 && (
            <MovieRow
              id="tv-anime"
              title="Anime Series"
              items={animeShows}
            />
          )}

          {docuseries.length > 0 && (
            <MovieRow
              id="tv-docuseries"
              title="Documentaries & Real World Stories"
              items={docuseries}
            />
          )}
        </div>
      )}
    </div>
  );
};

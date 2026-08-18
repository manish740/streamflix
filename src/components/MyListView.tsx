import React, { useState, useMemo } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { MOCK_MEDIA } from '../data/mockData';
import { MovieCard } from './MovieCard';
import { EmptyState } from './LoadingSkeleton';
import { Bookmark, Sparkles, Filter } from 'lucide-react';

interface MyListViewProps {
  onExplore: () => void;
}

export const MyListView: React.FC<MyListViewProps> = ({ onExplore }) => {
  const { watchlist } = useWatchlist();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const watchlistItems = useMemo(() => {
    return watchlist
      .map(id => MOCK_MEDIA.find(m => m.id === id))
      .filter((item): item is typeof MOCK_MEDIA[0] => {
        if (!item) return false;
        if (filterType === 'all') return true;
        return item.type === filterType;
      });
  }, [watchlist, filterType]);

  return (
    <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-[#E50914] fill-[#E50914]" />
            My Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'} saved to your library
          </p>
        </div>

        {/* Filter Tabs */}
        {watchlist.length > 0 && (
          <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterType === 'all' ? 'bg-[#E50914] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({watchlist.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterType === 'movie' ? 'bg-[#E50914] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterType === 'tv' ? 'bg-[#E50914] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              TV Shows
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {watchlistItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {watchlistItems.map(item => (
            <div key={item.id} className="w-full">
              <MovieCard media={item} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="w-8 h-8 text-[#E50914]" />}
          title="Your Watchlist is Empty"
          description="Explore our library and click the '+' button on any movie or TV series card to save titles for later."
          actionText="Browse Popular Titles"
          onAction={onExplore}
        />
      )}
    </div>
  );
};

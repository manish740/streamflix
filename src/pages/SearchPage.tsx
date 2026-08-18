import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_MEDIA } from '../data/mockData';
import { SearchGrid } from '../components/SearchGrid';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { activeProfile } = useAuth();

  const accessibleMedia = useMemo(() => {
    if (activeProfile?.isKids) {
      return MOCK_MEDIA.filter(item =>
        ['G', 'PG', 'TV-G', 'TV-Y', 'TV-PG'].includes(item.maturityRating)
      );
    }
    return MOCK_MEDIA;
  }, [activeProfile?.isKids]);

  const handleQueryChange = (newQuery: string) => {
    if (newQuery.trim()) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SearchGrid
        query={query}
        allMedia={accessibleMedia}
        onQueryChange={handleQueryChange}
        onClearQuery={handleClear}
      />
    </div>
  );
};

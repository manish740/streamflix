import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_MEDIA } from '../data/mockData';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';
import { Sparkles, Flame, TrendingUp, Award } from 'lucide-react';

export const NewPopularPage: React.FC = () => {
  const { activeProfile } = useAuth();

  const accessibleMedia = useMemo(() => {
    if (activeProfile?.isKids) {
      return MOCK_MEDIA.filter(item =>
        ['G', 'PG', 'TV-G', 'TV-Y', 'TV-PG'].includes(item.maturityRating)
      );
    }
    return MOCK_MEDIA;
  }, [activeProfile?.isKids]);

  const top10 = useMemo(
    () => [...accessibleMedia].sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99)).slice(0, 10),
    [accessibleMedia]
  );

  const brandNew2025_2026 = useMemo(
    () => accessibleMedia.filter(m => m.releaseYear >= 2025),
    [accessibleMedia]
  );

  const topCriticScores = useMemo(
    () => [...accessibleMedia].sort((a, b) => b.ratingScore - a.ratingScore).slice(0, 8),
    [accessibleMedia]
  );

  const featured = top10[0] || accessibleMedia[0];

  return (
    <div className="space-y-0 pb-16">
      <HeroBanner media={featured} />

      <div className="-mt-16 sm:-mt-24 md:-mt-32 relative z-30 space-y-6 sm:space-y-8 pb-10">
        {/* Top 10 in StreamFlix */}
        <MovieRow
          id="newpop-top10"
          title="Top 10 in StreamFlix Today"
          subtitle="The definitive leaderboard of the most watched releases right now"
          items={top10}
          isTop10={true}
        />

        {/* Brand New Releases */}
        {brandNew2025_2026.length > 0 && (
          <MovieRow
            id="newpop-new-releases"
            title="Brand New Releases (2025 - 2026)"
            subtitle="Fresh additions just added to the streaming vault"
            items={brandNew2025_2026}
          />
        )}

        {/* Highest Match / Recommended for you */}
        <MovieRow
          id="newpop-highest-match"
          title="Highest Match for Your Taste"
          subtitle="Algorithmically tuned based on your profile watch history"
          items={[...accessibleMedia].sort((a, b) => b.matchPercentage - a.matchPercentage)}
        />

        {/* Top Rated by Critics */}
        <MovieRow
          id="newpop-critics"
          title="Critic Choice & Award Winners"
          subtitle="9.0+ IMDb and Golden Globe nominees"
          items={topCriticScores}
        />
      </div>
    </div>
  );
};

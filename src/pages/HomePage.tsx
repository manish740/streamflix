import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { MediaItem } from '../types';
import { MOCK_MEDIA } from '../data/mockData';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';

export const HomePage: React.FC = () => {
  const { activeProfile } = useAuth();
  const { progressList } = useWatchlist();

  // Filter media based on Kids Mode if enabled
  const accessibleMedia = useMemo(() => {
    if (activeProfile?.isKids) {
      return MOCK_MEDIA.filter(item =>
        ['G', 'PG', 'TV-G', 'TV-Y', 'TV-Y7', 'TV-PG'].includes(item.maturityRating)
      );
    }
    return MOCK_MEDIA;
  }, [activeProfile?.isKids]);

  // Featured Media for Hero Banner (e.g. Neon Odyssey or first accessible item)
  const featuredMedia = useMemo(() => {
    return accessibleMedia.find(m => m.featured) || accessibleMedia[0] || MOCK_MEDIA[0];
  }, [accessibleMedia]);

  // Continue watching list (media that has progress)
  const continueWatchingItems = useMemo(() => {
    const idsWithProgress = Object.keys(progressList).filter(
      id => progressList[id]?.percent > 0 && progressList[id]?.percent < 98
    );
    return idsWithProgress
      .map(id => accessibleMedia.find(m => m.id === id))
      .filter((m): m is MediaItem => Boolean(m));
  }, [progressList, accessibleMedia]);

  // Content Rows
  const trendingItems = useMemo(
    () => [...accessibleMedia].sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99)),
    [accessibleMedia]
  );

  const popularMovies = useMemo(
    () => accessibleMedia.filter(m => m.type === 'movie'),
    [accessibleMedia]
  );

  const popularShows = useMemo(
    () => accessibleMedia.filter(m => m.type === 'tv'),
    [accessibleMedia]
  );

  const sciFiItems = useMemo(
    () => accessibleMedia.filter(m => m.genres.some(g => g.includes('Sci-Fi'))),
    [accessibleMedia]
  );

  const dramaItems = useMemo(
    () => accessibleMedia.filter(m => m.genres.some(g => g.includes('Drama'))),
    [accessibleMedia]
  );

  const actionItems = useMemo(
    () => accessibleMedia.filter(m => m.genres.some(g => g.includes('Action'))),
    [accessibleMedia]
  );

  const crimeThrillerItems = useMemo(
    () =>
      accessibleMedia.filter(m =>
        m.genres.some(g => g.includes('Crime') || g.includes('Thriller'))
      ),
    [accessibleMedia]
  );

  const animeAndAnimation = useMemo(
    () => accessibleMedia.filter(m => m.genres.some(g => g.includes('Anime'))),
    [accessibleMedia]
  );

  const documentaries = useMemo(
    () => accessibleMedia.filter(m => m.genres.some(g => g.includes('Docuseries'))),
    [accessibleMedia]
  );

  return (
    <div className="space-y-0 pb-12">
      {/* Cinematic Hero Banner */}
      <HeroBanner media={featuredMedia} />

      {/* Content Rows Section with Negative Top Margin for cinematic layered overlap */}
      <div className="-mt-16 sm:-mt-24 md:-mt-32 relative z-30 space-y-4 sm:space-y-8 pb-10">
        {/* 1. Continue Watching */}
        {continueWatchingItems.length > 0 && (
          <MovieRow
            id="row-continue-watching"
            title={`Continue Watching for ${activeProfile.name}`}
            subtitle="Resume right where you left off"
            items={continueWatchingItems}
            showProgress={true}
          />
        )}

        {/* 2. Trending Now */}
        <MovieRow
          id="row-trending-now"
          title="Trending Now"
          subtitle="Top streamed titles across all regions today"
          items={trendingItems}
        />

        {/* 3. Top 10 in StreamFlix Today */}
        <MovieRow
          id="row-top-10"
          title="Top 10 Today"
          subtitle="Most popular movies and series right now"
          items={trendingItems.slice(0, 10)}
          isTop10={true}
        />

        {/* 4. Blockbuster Movies */}
        {popularMovies.length > 0 && (
          <MovieRow
            id="row-popular-movies"
            title="Blockbuster Movies"
            subtitle="Hollywood hits and original cinema in 4K Ultra HD"
            items={popularMovies}
          />
        )}

        {/* 5. Popular TV Shows */}
        {popularShows.length > 0 && (
          <MovieRow
            id="row-popular-tv"
            title="Binge-Worthy TV Shows"
            subtitle="Multi-season thrillers, comedies, and dramas"
            items={popularShows}
          />
        )}

        {/* 6. Sci-Fi & Cyberpunk */}
        {sciFiItems.length > 0 && (
          <MovieRow
            id="row-scifi"
            title="Sci-Fi & Cyberpunk Universes"
            subtitle="Futuristic tech, AI worlds, and cosmic journeys"
            items={sciFiItems}
          />
        )}

        {/* 7. Action & Adrenaline */}
        {actionItems.length > 0 && (
          <MovieRow
            id="row-action"
            title="Action & High-Octane Thrills"
            subtitle="Explosive stunts and adrenaline surges"
            items={actionItems}
          />
        )}

        {/* 8. Award-Winning Dramas */}
        {dramaItems.length > 0 && (
          <MovieRow
            id="row-dramas"
            title="Critically Acclaimed Dramas"
            subtitle="Emotionally gripping storytelling"
            items={dramaItems}
          />
        )}

        {/* 9. Crime & Psychological Thrillers */}
        {crimeThrillerItems.length > 0 && (
          <MovieRow
            id="row-crime-thrillers"
            title="Psychological Thrillers & Crime Mysteries"
            subtitle="Unravel gripping mysteries and plot twists"
            items={crimeThrillerItems}
          />
        )}

        {/* 10. Anime & Animation */}
        {animeAndAnimation.length > 0 && (
          <MovieRow
            id="row-anime"
            title="Anime & Animated Sagas"
            subtitle="Visual masterpieces and epic battles"
            items={animeAndAnimation}
          />
        )}

        {/* 11. Nature & Docuseries */}
        {documentaries.length > 0 && (
          <MovieRow
            id="row-docuseries"
            title="Documentaries & Nature in 4K"
            subtitle="Fascinating real-world discoveries"
            items={documentaries}
          />
        )}
      </div>
    </div>
  );
};

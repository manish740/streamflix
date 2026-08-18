import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MediaItem, Episode, ViewingProgress, WatchHistoryItem, ToastMessage } from '../types';
import { MOCK_MEDIA } from '../data/mockData';

interface PlayingTarget {
  media: MediaItem;
  episode?: Episode;
  startTime?: number;
}

interface WatchlistContextType {
  watchlist: string[];
  toggleWatchlist: (media: MediaItem | string) => void;
  isInWatchlist: (mediaId: string) => boolean;
  progressList: Record<string, ViewingProgress>;
  saveProgress: (mediaId: string, currentTime: number, duration: number, mediaType?: 'movie' | 'tv', episode?: Episode) => void;
  recordHistory: (media: MediaItem, episodeId?: string, episodeTitle?: string, progressPercent?: number) => void;
  getProgress: (mediaId: string) => ViewingProgress | undefined;
  watchHistory: WatchHistoryItem[];
  clearHistory: () => void;
  ratings: Record<string, 'liked' | 'disliked' | 'loved'>;
  rateMedia: (mediaId: string, score: 'liked' | 'disliked' | 'loved') => void;
  selectedModalMedia: MediaItem | null;
  openModal: (media: MediaItem) => void;
  closeModal: () => void;
  playingTarget: PlayingTarget | null;
  playMedia: (media: MediaItem, episode?: Episode, startTime?: number) => void;
  stopPlaying: () => void;
  playNextEpisode: () => void;
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'favorite' | 'removed') => void;
  removeToast: (id: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('streamflix_watchlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['m1', 'tv1', 'm2', 'tv4'];
      }
    }
    return ['m1', 'tv1', 'm2', 'tv4'];
  });

  const [progressList, setProgressList] = useState<Record<string, ViewingProgress>>(() => {
    const saved = localStorage.getItem('streamflix_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          m1: {
            mediaId: 'm1',
            mediaType: 'movie',
            currentTime: 3580,
            duration: 8520,
            percent: 42,
            updatedAt: new Date().toISOString()
          },
          tv1: {
            mediaId: 'tv1',
            mediaType: 'tv',
            episodeId: 'ep101',
            seasonNumber: 1,
            episodeNumber: 1,
            currentTime: 2520,
            duration: 3240,
            percent: 78,
            updatedAt: new Date().toISOString()
          }
        };
      }
    }
    return {
      m1: {
        mediaId: 'm1',
        mediaType: 'movie',
        currentTime: 3580,
        duration: 8520,
        percent: 42,
        updatedAt: new Date().toISOString()
      },
      tv1: {
        mediaId: 'tv1',
        mediaType: 'tv',
        episodeId: 'ep101',
        seasonNumber: 1,
        episodeNumber: 1,
        currentTime: 2520,
        duration: 3240,
        percent: 78,
        updatedAt: new Date().toISOString()
      }
    };
  });

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    const saved = localStorage.getItem('streamflix_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'h-1',
        mediaId: 'm1',
        media: MOCK_MEDIA.find(m => m.id === 'm1')!,
        watchedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        progressPercent: 42
      },
      {
        id: 'h-2',
        mediaId: 'tv1',
        media: MOCK_MEDIA.find(m => m.id === 'tv1')!,
        episodeId: 'ep101',
        episodeTitle: 'Signal in the Static',
        watchedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        progressPercent: 78
      }
    ];
  });

  const [ratings, setRatings] = useState<Record<string, 'liked' | 'disliked' | 'loved'>>(() => {
    const saved = localStorage.getItem('streamflix_ratings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { m1: 'loved', tv1: 'liked' };
      }
    }
    return { m1: 'loved', tv1: 'liked' };
  });

  const [selectedModalMedia, setSelectedModalMedia] = useState<MediaItem | null>(null);
  const [playingTarget, setPlayingTarget] = useState<PlayingTarget | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    localStorage.setItem('streamflix_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('streamflix_progress', JSON.stringify(progressList));
  }, [progressList]);

  useEffect(() => {
    localStorage.setItem('streamflix_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    localStorage.setItem('streamflix_ratings', JSON.stringify(ratings));
  }, [ratings]);

  const showToast = useCallback((title: string, message?: string, type: 'success' | 'info' | 'favorite' | 'removed' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts(prev => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleWatchlist = (mediaOrId: MediaItem | string) => {
    const mediaId = typeof mediaOrId === 'string' ? mediaOrId : mediaOrId.id;
    const media = typeof mediaOrId === 'string' ? MOCK_MEDIA.find(m => m.id === mediaOrId) : mediaOrId;
    const title = media?.title || 'Title';

    setWatchlist(prev => {
      const exists = prev.includes(mediaId);
      if (exists) {
        showToast(`Removed from My List`, title, 'removed');
        // Backend API sync attempt
        fetch(`/api/watchlist/${mediaId}`, { method: 'DELETE' }).catch(() => {});
        return prev.filter(id => id !== mediaId);
      } else {
        showToast(`Added to My List`, title, 'favorite');
        // Backend API sync attempt
        fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaId })
        }).catch(() => {});
        return [...prev, mediaId];
      }
    });
  };

  const isInWatchlist = (mediaId: string) => watchlist.includes(mediaId);

  const recordHistory = (
    media: MediaItem,
    episodeId?: string,
    episodeTitle?: string,
    progressPercent?: number
  ) => {
    setWatchHistory(prev => {
      const filtered = prev.filter(h => h.mediaId !== media.id);
      const percent = progressPercent ?? progressList[media.id]?.percent ?? 0;
      const newHist: WatchHistoryItem = {
        id: `hist-${Date.now()}`,
        mediaId: media.id,
        media,
        episodeId,
        episodeTitle,
        watchedAt: new Date().toISOString(),
        progressPercent: percent
      };
      return [newHist, ...filtered].slice(0, 30);
    });
  };

  const saveProgress = (
    mediaId: string,
    currentTime: number,
    duration: number,
    mediaType: 'movie' | 'tv' = 'movie',
    episode?: Episode
  ) => {
    if (!duration || duration <= 0) return;
    const percent = Math.min(100, Math.round((currentTime / duration) * 100));

    const item: ViewingProgress = {
      mediaId,
      mediaType,
      episodeId: episode?.id,
      seasonNumber: episode?.seasonNumber,
      episodeNumber: episode?.episodeNumber,
      currentTime,
      duration,
      percent,
      updatedAt: new Date().toISOString()
    };

    setProgressList(prev => ({
      ...prev,
      [mediaId]: item
    }));

    // Update history
    const media = MOCK_MEDIA.find(m => m.id === mediaId);
    if (media) {
      setWatchHistory(prev => {
        const filtered = prev.filter(h => h.mediaId !== mediaId);
        const newHist: WatchHistoryItem = {
          id: `hist-${Date.now()}`,
          mediaId,
          media,
          episodeId: episode?.id,
          episodeTitle: episode?.title,
          watchedAt: new Date().toISOString(),
          progressPercent: percent
        };
        return [newHist, ...filtered].slice(0, 30);
      });
    }

    // Backend sync
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaId,
        mediaType,
        episodeId: episode?.id,
        currentTime,
        duration,
        percent
      })
    }).catch(() => {});
  };

  const getProgress = (mediaId: string) => progressList[mediaId];

  const clearHistory = () => {
    setWatchHistory([]);
    fetch('/api/history', { method: 'DELETE' }).catch(() => {});
    showToast('Watch History Cleared', 'Your viewing history has been reset', 'info');
  };

  const rateMedia = (mediaId: string, score: 'liked' | 'disliked' | 'loved') => {
    setRatings(prev => {
      const current = prev[mediaId];
      if (current === score) {
        const next = { ...prev };
        delete next[mediaId];
        showToast('Rating removed');
        return next;
      }
      const label = score === 'loved' ? 'Double Thumbs Up!' : score === 'liked' ? 'Thumbs Up' : 'Not for me';
      showToast(label, 'Feedback recorded', 'favorite');
      fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, score })
      }).catch(() => {});
      return { ...prev, [mediaId]: score };
    });
  };

  const openModal = (media: MediaItem) => {
    setSelectedModalMedia(media);
  };

  const closeModal = () => {
    setSelectedModalMedia(null);
  };

  const playMedia = (media: MediaItem, episode?: Episode, startTime?: number) => {
    setSelectedModalMedia(null);
    const existingProgress = progressList[media.id];
    const resumeTime = startTime !== undefined ? startTime : (existingProgress?.currentTime || 0);

    setPlayingTarget({
      media,
      episode: episode || (media.seasons && media.seasons[0]?.episodes[0]),
      startTime: resumeTime
    });
  };

  const stopPlaying = () => {
    setPlayingTarget(null);
  };

  const playNextEpisode = () => {
    if (!playingTarget || !playingTarget.media.seasons || !playingTarget.episode) return;
    const seasons = playingTarget.media.seasons;
    const currentEp = playingTarget.episode;

    const currentSeason = seasons.find(s => s.seasonNumber === currentEp.seasonNumber);
    if (!currentSeason) return;

    const currentEpIndex = currentSeason.episodes.findIndex(e => e.id === currentEp.id);
    if (currentEpIndex >= 0 && currentEpIndex < currentSeason.episodes.length - 1) {
      const nextEp = currentSeason.episodes[currentEpIndex + 1];
      playMedia(playingTarget.media, nextEp, 0);
      showToast(`Playing Next: S${nextEp.seasonNumber} E${nextEp.episodeNumber}`, nextEp.title, 'info');
    } else {
      // Check next season
      const nextSeason = seasons.find(s => s.seasonNumber === currentEp.seasonNumber + 1);
      if (nextSeason && nextSeason.episodes.length > 0) {
        const nextEp = nextSeason.episodes[0];
        playMedia(playingTarget.media, nextEp, 0);
        showToast(`Playing Season ${nextSeason.seasonNumber}: Episode 1`, nextEp.title, 'info');
      } else {
        showToast('You have reached the end of the series!', '', 'success');
      }
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        progressList,
        saveProgress,
        recordHistory,
        getProgress,
        watchHistory,
        clearHistory,
        ratings,
        rateMedia,
        selectedModalMedia,
        openModal,
        closeModal,
        playingTarget,
        playMedia,
        stopPlaying,
        playNextEpisode,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

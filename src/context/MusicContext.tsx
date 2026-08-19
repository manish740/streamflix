import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { YouTubeTrack } from '../types';
import { CURATED_MUSIC_TRACKS } from '../services/youtubeService';
import { useAuth } from './AuthContext';
import { YouTubePlayerRef } from '../components/YouTubePlayer';

interface MusicContextType {
  currentTrack: YouTubeTrack | null;
  isPlaying: boolean;
  queue: YouTubeTrack[];
  currentQueueIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isMiniPlayerVisible: boolean;
  isExpandedModalOpen: boolean;
  isQueueOpen: boolean;
  recentlyPlayed: YouTubeTrack[];
  favorites: string[];

  // Player controls
  playTrack: (track: YouTubeTrack, newQueue?: YouTubeTrack[]) => void;
  togglePlay: () => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  addToQueue: (track: YouTubeTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;

  // View state controls
  closeMiniPlayer: () => void;
  showMiniPlayer: () => void;
  openExpandedPlayer: () => void;
  closeExpandedPlayer: () => void;
  toggleQueue: () => void;
  setIsQueueOpen: (open: boolean) => void;

  // Favorites & History
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  clearRecentlyPlayed: () => void;

  // Player ref linking
  playerRef: React.RefObject<YouTubePlayerRef | null>;
  syncProgress: (curr: number, dur: number) => void;
  handleTrackEnded: () => void;
  handlePlayerPlay: () => void;
  handlePlayerPause: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeProfile } = useAuth();
  const playerRef = useRef<YouTubePlayerRef | null>(null);

  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [queue, setQueue] = useState<YouTubeTrack[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState<boolean>(false);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  // Profile-specific recently played storage key
  const profileId = activeProfile?.id || 'default';
  const recentStorageKey = `streamflix_music_recent_${profileId}`;
  const favsStorageKey = `streamflix_music_favs_${profileId}`;

  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeTrack[]>(() => {
    try {
      const saved = localStorage.getItem(recentStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    // Default initial recently played for discovery
    return CURATED_MUSIC_TRACKS.slice(0, 5);
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(favsStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return ['4NRXx6U8ABQ', 'UDVtMYqUAyw'];
  });

  // Re-sync storage when profile changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`streamflix_music_recent_${profileId}`);
      if (saved) {
        setRecentlyPlayed(JSON.parse(saved));
      } else {
        setRecentlyPlayed(CURATED_MUSIC_TRACKS.slice(0, 5));
      }

      const favs = localStorage.getItem(`streamflix_music_favs_${profileId}`);
      if (favs) {
        setFavorites(JSON.parse(favs));
      } else {
        setFavorites(['4NRXx6U8ABQ', 'UDVtMYqUAyw']);
      }
    } catch {
      // Ignore
    }
  }, [profileId]);

  // Persist recent items
  useEffect(() => {
    try {
      localStorage.setItem(recentStorageKey, JSON.stringify(recentlyPlayed));
    } catch {
      // Ignore
    }
  }, [recentlyPlayed, recentStorageKey]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem(favsStorageKey, JSON.stringify(favorites));
    } catch {
      // Ignore
    }
  }, [favorites, favsStorageKey]);

  // Record playback to profile recently played history
  const recordToHistory = useCallback((track: YouTubeTrack) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 30);
    });
  }, []);

  // Play a specific track
  const playTrack = useCallback(
    (track: YouTubeTrack, newQueue?: YouTubeTrack[]) => {
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsMiniPlayerVisible(true);
      setCurrentTime(0);
      setDuration(track.durationSec || 210);

      recordToHistory(track);

      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        const idx = newQueue.findIndex(t => t.id === track.id);
        setCurrentQueueIndex(idx >= 0 ? idx : 0);
      } else {
        // If track is in current queue, update index; otherwise add as next
        setQueue(prev => {
          const idx = prev.findIndex(t => t.id === track.id);
          if (idx >= 0) {
            setCurrentQueueIndex(idx);
            return prev;
          }
          const updated = [...prev, track];
          setCurrentQueueIndex(updated.length - 1);
          return updated;
        });
      }

      // Command player if mounted
      if (playerRef.current) {
        playerRef.current.play();
      }
    },
    [recordToHistory]
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0]);
      } else if (recentlyPlayed.length > 0) {
        playTrack(recentlyPlayed[0]);
      }
      return;
    }

    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [currentTrack, isPlaying, queue, recentlyPlayed, playTrack]);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    if (playerRef.current) {
      playerRef.current.pause();
    }
  }, []);

  const resumeTrack = useCallback(() => {
    setIsPlaying(true);
    if (playerRef.current) {
      playerRef.current.play();
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = (currentQueueIndex + 1) % queue.length;
    setCurrentQueueIndex(nextIndex);
    const track = queue[nextIndex];
    if (track) {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(track.durationSec || 210);
      recordToHistory(track);
    }
  }, [queue, currentQueueIndex, recordToHistory]);

  const previousTrack = useCallback(() => {
    if (queue.length === 0) return;
    // If past 4 seconds, restart current track
    if (currentTime > 4) {
      seekTo(0);
      return;
    }
    const prevIndex = (currentQueueIndex - 1 + queue.length) % queue.length;
    setCurrentQueueIndex(prevIndex);
    const track = queue[prevIndex];
    if (track) {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(track.durationSec || 210);
      recordToHistory(track);
    }
  }, [queue, currentQueueIndex, currentTime, recordToHistory]);

  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (playerRef.current) {
      playerRef.current.seekTo(seconds);
    }
  }, []);

  const setVolume = useCallback((level: number) => {
    const clamped = Math.max(0, Math.min(100, level));
    setVolumeState(clamped);
    if (clamped > 0) {
      setIsMuted(false);
    }
    if (playerRef.current) {
      playerRef.current.setVolume(clamped);
      if (clamped === 0) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (playerRef.current) {
        if (next) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume || 80);
        }
      }
      return next;
    });
  }, [volume]);

  const addToQueue = useCallback((track: YouTubeTrack) => {
    setQueue(prev => {
      // Check if already in queue
      if (prev.some(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue(prev => {
        const next = prev.filter((_, i) => i !== index);
        if (index === currentQueueIndex && next.length > 0) {
          const newIdx = Math.min(index, next.length - 1);
          setCurrentQueueIndex(newIdx);
          setCurrentTrack(next[newIdx]);
        }
        return next;
      });
    },
    [currentQueueIndex]
  );

  const clearQueue = useCallback(() => {
    setQueue(currentTrack ? [currentTrack] : []);
    setCurrentQueueIndex(0);
  }, [currentTrack]);

  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    setQueue(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const closeMiniPlayer = useCallback(() => {
    setIsMiniPlayerVisible(false);
    pauseTrack();
  }, [pauseTrack]);

  const showMiniPlayer = useCallback(() => {
    if (currentTrack) {
      setIsMiniPlayerVisible(true);
    }
  }, [currentTrack]);

  const openExpandedPlayer = useCallback(() => {
    setIsExpandedModalOpen(true);
  }, []);

  const closeExpandedPlayer = useCallback(() => {
    setIsExpandedModalOpen(false);
  }, []);

  const toggleQueue = useCallback(() => {
    setIsQueueOpen(prev => !prev);
  }, []);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites(prev => {
      if (prev.includes(trackId)) {
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  }, []);

  const isFavorite = useCallback(
    (trackId: string) => favorites.includes(trackId),
    [favorites]
  );

  const clearRecentlyPlayed = useCallback(() => {
    setRecentlyPlayed([]);
  }, []);

  const syncProgress = useCallback((curr: number, dur: number) => {
    setCurrentTime(curr);
    if (dur > 0) {
      setDuration(dur);
    }
  }, []);

  const handleTrackEnded = useCallback(() => {
    if (queue.length > 0) {
      nextTrack();
    } else {
      setIsPlaying(false);
    }
  }, [queue, nextTrack]);

  const handlePlayerPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePlayerPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        currentQueueIndex,
        currentTime,
        duration,
        volume,
        isMuted,
        isMiniPlayerVisible,
        isExpandedModalOpen,
        isQueueOpen,
        recentlyPlayed,
        favorites,
        playTrack,
        togglePlay,
        pauseTrack,
        resumeTrack,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleMute,
        addToQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        closeMiniPlayer,
        showMiniPlayer,
        openExpandedPlayer,
        closeExpandedPlayer,
        toggleQueue,
        setIsQueueOpen,
        toggleFavorite,
        isFavorite,
        clearRecentlyPlayed,
        playerRef,
        syncProgress,
        handleTrackEnded,
        handlePlayerPlay,
        handlePlayerPause
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

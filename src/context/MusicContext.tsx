import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { YouTubeTrack } from '../types';
import { CURATED_MUSIC_TRACKS, YouTubeService } from '../services/youtubeService';
import { useAuth } from './AuthContext';
import { YouTubePlayerRef } from '../components/YouTubePlayer';

export type RepeatMode = 'off' | 'all' | 'one';
export type ActivePlayerType = 'audio' | 'video' | null;

interface MusicContextType {
  currentTrack: YouTubeTrack | null;
  isPlaying: boolean;
  activePlayer: ActivePlayerType;
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

  // Extended controls
  playbackSpeed: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  randomSameArtistAutoplay: boolean;
  isSearchingSameArtist: boolean;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleRandomSameArtistAutoplay: () => void;
  setRandomSameArtistAutoplay: (enabled: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  playRandomSameArtistSong: () => Promise<YouTubeTrack | null>;

  // Mode switching & exclusivity
  setActivePlayer: (player: ActivePlayerType) => void;
  switchToVideo: (navigateFn?: (url: string) => void) => Promise<void>;
  switchToAudio: (navigateFn?: (url: string) => void) => Promise<void>;
  stopCurrentPlayer: () => void;

  // Player controls
  playTrack: (track: YouTubeTrack, newQueue?: YouTubeTrack[]) => void;
  playQueueItem: (track: YouTubeTrack, index?: number) => void;
  playTrackById: (trackId: string, customQueue?: YouTubeTrack[]) => Promise<YouTubeTrack | null>;
  togglePlay: () => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  playNext: () => Promise<boolean>;
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
  audioPlayerRef: React.RefObject<YouTubePlayerRef | null>;
  videoPlayerRef: React.RefObject<YouTubePlayerRef | null>;
  syncProgress: (curr: number, dur: number) => void;
  handleTrackEnded: () => void;
  handlePlayerPlay: () => void;
  handlePlayerPause: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeProfile } = useAuth();
  const audioPlayerRef = useRef<YouTubePlayerRef | null>(null);
  const videoPlayerRef = useRef<YouTubePlayerRef | null>(null);
  // Alias playerRef to audioPlayerRef for backwards compatibility
  const playerRef = audioPlayerRef;

  const [activePlayer, setActivePlayerState] = useState<ActivePlayerType>('audio');
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(() => CURATED_MUSIC_TRACKS[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [queue, setQueue] = useState<YouTubeTrack[]>(() => CURATED_MUSIC_TRACKS.slice(1, 10));
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() => CURATED_MUSIC_TRACKS[0]?.durationSec || 210);
  const [volume, setVolumeState] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState<boolean>(false);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  // Playback modifiers
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [randomSameArtistAutoplay, setRandomSameArtistAutoplayState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('streamflix_same_artist_autoplay');
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });
  const [isSearchingSameArtist, setIsSearchingSameArtist] = useState<boolean>(false);

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

  // Active player setter with mutual exclusion
  const setActivePlayer = useCallback((player: ActivePlayerType) => {
    setActivePlayerState(player);
    if (player === 'video') {
      try {
        audioPlayerRef.current?.pause();
        audioPlayerRef.current?.stop?.();
      } catch {
        // ignore
      }
    } else if (player === 'audio') {
      try {
        videoPlayerRef.current?.pause();
        videoPlayerRef.current?.stop?.();
      } catch {
        // ignore
      }
    } else {
      try {
        audioPlayerRef.current?.pause();
        audioPlayerRef.current?.stop?.();
        videoPlayerRef.current?.pause();
        videoPlayerRef.current?.stop?.();
      } catch {
        // ignore
      }
    }
  }, []);

  // Stop current player cleanly
  const stopCurrentPlayer = useCallback(() => {
    setIsPlaying(false);
    try {
      audioPlayerRef.current?.pause();
      audioPlayerRef.current?.stop?.();
    } catch {
      // ignore
    }
    try {
      videoPlayerRef.current?.pause();
      videoPlayerRef.current?.stop?.();
    } catch {
      // ignore
    }
  }, []);

  // Seamless transition: Audio -> Video
  const switchToVideo = useCallback(async (customNavigate?: (url: string) => void) => {
    // 1. Immediately pause and stop audio playback so it produces NO background sound
    let pos = currentTime;
    if (audioPlayerRef.current) {
      try {
        const t = audioPlayerRef.current.getCurrentTime();
        if (t > 0) pos = t;
        audioPlayerRef.current.pause();
        audioPlayerRef.current.stop?.();
      } catch {
        // ignore
      }
    }

    // 2. Set activePresentation to 'video' and keep position
    setActivePlayerState('video');
    setCurrentTime(pos);

    // 3. Navigate to Video Player with same videoId
    const targetVideoId = currentTrack?.id || '4NRXx6U8ABQ';
    const targetUrl = `/music/video?videoId=${targetVideoId}`;
    if (customNavigate) {
      customNavigate(targetUrl);
    }
  }, [currentTime, currentTrack]);

  // Seamless transition: Video -> Audio
  const switchToAudio = useCallback(async (customNavigate?: (url: string) => void) => {
    // 1. Immediately pause and stop video playback so it produces NO background sound
    let pos = currentTime;
    if (videoPlayerRef.current) {
      try {
        const t = videoPlayerRef.current.getCurrentTime();
        if (t > 0) pos = t;
        videoPlayerRef.current.pause();
        videoPlayerRef.current.stop?.();
      } catch {
        // ignore
      }
    }

    // 2. Set activePresentation to 'audio' and keep position
    setActivePlayerState('audio');
    setCurrentTime(pos);

    // 3. Navigate to Audio Player with same videoId
    const targetVideoId = currentTrack?.id || '4NRXx6U8ABQ';
    const targetUrl = `/music/audio?videoId=${targetVideoId}`;
    if (customNavigate) {
      customNavigate(targetUrl);
    }
  }, [currentTime, currentTrack]);

  // Play a specific track (replaces current track and optionally updates queue)
  const playTrack = useCallback(
    (track: YouTubeTrack, newQueue?: YouTubeTrack[]) => {
      if (!track || !track.id) return;

      // 1. Cleanly stop any existing playback
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.stop?.();
        } catch {
          // ignore
        }
      }
      if (videoPlayerRef.current) {
        try {
          videoPlayerRef.current.pause();
          videoPlayerRef.current.stop?.();
        } catch {
          // ignore
        }
      }

      // 2. Set current track as single source of truth
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsMiniPlayerVisible(true);
      setCurrentTime(0);
      setDuration(track.durationSec || 210);
      recordToHistory(track);

      // 3. Update queue: remove played track from queue
      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue.filter(t => t.id !== track.id));
        setCurrentQueueIndex(0);
      } else {
        setQueue(prev => prev.filter(t => t.id !== track.id));
        setCurrentQueueIndex(0);
      }

      // 4. Directly command the active player instance
      if (activePlayer === 'video' && videoPlayerRef.current) {
        try {
          videoPlayerRef.current.loadVideoById(track.id, 0);
          videoPlayerRef.current.play();
        } catch {
          // ignore
        }
      } else if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.loadVideoById(track.id, 0);
          audioPlayerRef.current.play();
        } catch {
          // ignore
        }
      }
    },
    [recordToHistory, activePlayer]
  );

  // Play an item directly clicked from the queue
  const playQueueItem = useCallback(
    (track: YouTubeTrack, _index?: number) => {
      if (!track || !track.id) return;
      playTrack(track);
    },
    [playTrack]
  );

  // Play track by ID (useful for direct URL navigation / query parameters)
  const playTrackById = useCallback(
    async (trackId: string, customQueue?: YouTubeTrack[]): Promise<YouTubeTrack | null> => {
      if (!trackId) return null;

      // 1. Check if it's current track already
      if (currentTrack && currentTrack.id === trackId) {
        if (!isPlaying) {
          setIsPlaying(true);
          if (activePlayer === 'video') {
            videoPlayerRef.current?.play();
          } else {
            audioPlayerRef.current?.play();
          }
        }
        return currentTrack;
      }

      // 2. Check queue or recently played or curated list
      let matched =
        queue.find(t => t.id === trackId) ||
        recentlyPlayed.find(t => t.id === trackId) ||
        CURATED_MUSIC_TRACKS.find(t => t.id === trackId);

      if (!matched) {
        try {
          const details = await YouTubeService.getVideoDetails([trackId]);
          if (details.length > 0) {
            matched = details[0];
          }
        } catch {
          // fallback synthesis
          matched = {
            id: trackId,
            title: `Stream Track (${trackId})`,
            artist: 'StreamFlix Artist',
            thumbnailUrl: `https://img.youtube.com/vi/${trackId}/hqdefault.jpg`,
            duration: '3:30',
            durationSec: 210,
            viewCount: '1.5M views'
          };
        }
      }

      if (matched) {
        playTrack(matched, customQueue);
        return matched;
      }
      return null;
    },
    [currentTrack, isPlaying, queue, recentlyPlayed, playTrack, activePlayer]
  );

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
      } catch {
        // ignore
      }
    }
    if (videoPlayerRef.current) {
      try {
        videoPlayerRef.current.pause();
      } catch {
        // ignore
      }
    }
  }, []);

  const resumeTrack = useCallback(() => {
    setIsPlaying(true);
    if (activePlayer === 'video') {
      try {
        audioPlayerRef.current?.pause();
      } catch {
        // ignore
      }
      if (videoPlayerRef.current) {
        videoPlayerRef.current.play();
      }
    } else {
      try {
        videoPlayerRef.current?.pause();
      } catch {
        // ignore
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.play();
      }
    }
  }, [activePlayer]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0]);
      } else if (recentlyPlayed.length > 0) {
        playTrack(recentlyPlayed[0]);
      } else if (CURATED_MUSIC_TRACKS.length > 0) {
        playTrack(CURATED_MUSIC_TRACKS[0]);
      }
      return;
    }

    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [currentTrack, isPlaying, queue, recentlyPlayed, playTrack, pauseTrack, resumeTrack]);

  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (activePlayer === 'video') {
      videoPlayerRef.current?.seekTo(seconds);
    } else {
      audioPlayerRef.current?.seekTo(seconds);
    }
  }, [activePlayer]);

  // Find and play a random song from the same artist
  const playRandomSameArtistSong = useCallback(async (): Promise<YouTubeTrack | null> => {
    if (!currentTrack) {
      if (CURATED_MUSIC_TRACKS.length > 0) {
        const randomTrack = CURATED_MUSIC_TRACKS[Math.floor(Math.random() * CURATED_MUSIC_TRACKS.length)];
        playTrack(randomTrack);
        return randomTrack;
      }
      return null;
    }

    setIsSearchingSameArtist(true);
    try {
      const randomSong = await YouTubeService.getRandomSongFromSameArtist(
        currentTrack.artist,
        currentTrack.id,
        currentTrack.title
      );

      if (randomSong) {
        playTrack(randomSong);
        return randomSong;
      }
      return null;
    } catch (err) {
      console.warn('Could not find random same-artist song:', err);
      return null;
    } finally {
      setIsSearchingSameArtist(false);
    }
  }, [currentTrack, playTrack]);

  // Central function for playing next queued track or finding autoplay recommendation
  const playNext = useCallback(async (): Promise<boolean> => {
    // 1. If repeat one is active: loop current track
    if (repeatMode === 'one' && currentTrack) {
      seekTo(0);
      resumeTrack();
      return true;
    }

    // 2. If queue has upcoming items
    if (queue.length > 0) {
      let nextTrackToPlay: YouTubeTrack;
      let nextIdx = 0;
      if (isShuffled && queue.length > 1) {
        nextIdx = Math.floor(Math.random() * queue.length);
        nextTrackToPlay = queue[nextIdx];
      } else {
        nextTrackToPlay = queue[0];
      }

      playTrack(nextTrackToPlay);
      return true;
    }

    // 3. Queue is empty: check Autoplay Same Artist
    if (randomSameArtistAutoplay && currentTrack) {
      const nextSong = await playRandomSameArtistSong();
      if (nextSong) return true;
    }

    // 4. Repeat all: loop with next curated track
    if (repeatMode === 'all' && CURATED_MUSIC_TRACKS.length > 0) {
      const remainingCurated = CURATED_MUSIC_TRACKS.filter(t => t.id !== currentTrack?.id);
      const nextCurated =
        remainingCurated.length > 0
          ? remainingCurated[Math.floor(Math.random() * remainingCurated.length)]
          : CURATED_MUSIC_TRACKS[0];
      playTrack(nextCurated);
      return true;
    }

    // 5. Cleanly stop playback when queue is exhausted
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.stop?.();
      } catch {
        // ignore
      }
    }
    if (videoPlayerRef.current) {
      try {
        videoPlayerRef.current.pause();
        videoPlayerRef.current.stop?.();
      } catch {
        // ignore
      }
    }
    return false;
  }, [
    repeatMode,
    currentTrack,
    queue,
    isShuffled,
    recordToHistory,
    activePlayer,
    randomSameArtistAutoplay,
    playRandomSameArtistSong,
    playTrack,
    seekTo,
    resumeTrack
  ]);

  const nextTrack = useCallback(() => {
    playNext();
  }, [playNext]);

  const previousTrack = useCallback(() => {
    // If past 4 seconds, restart current track
    if (currentTime > 4) {
      seekTo(0);
      return;
    }

    // If we have history, go to previously played track and place currentTrack back into upcoming queue
    if (recentlyPlayed.length > 1) {
      const prevTrack = recentlyPlayed[1];
      if (prevTrack) {
        if (currentTrack) {
          setQueue(prev => [currentTrack, ...prev.filter(t => t.id !== currentTrack.id)]);
        }
        playTrack(prevTrack);
        return;
      }
    }

    seekTo(0);
  }, [currentTime, recentlyPlayed, currentTrack, playTrack, seekTo]);

  const setVolume = useCallback((level: number) => {
    const clamped = Math.max(0, Math.min(100, level));
    setVolumeState(clamped);
    if (clamped > 0) {
      setIsMuted(false);
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setVolume(clamped);
      if (clamped === 0) {
        audioPlayerRef.current.mute();
      } else {
        audioPlayerRef.current.unMute();
      }
    }
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setVolume(clamped);
      if (clamped === 0) {
        videoPlayerRef.current.mute();
      } else {
        videoPlayerRef.current.unMute();
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioPlayerRef.current) {
        if (next) {
          audioPlayerRef.current.mute();
        } else {
          audioPlayerRef.current.unMute();
          audioPlayerRef.current.setVolume(volume || 80);
        }
      }
      if (videoPlayerRef.current) {
        if (next) {
          videoPlayerRef.current.mute();
        } else {
          videoPlayerRef.current.unMute();
          videoPlayerRef.current.setVolume(volume || 80);
        }
      }
      return next;
    });
  }, [volume]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setPlaybackRate(speed);
    }
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setPlaybackRate(speed);
    }
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  const addToQueue = useCallback((track: YouTubeTrack) => {
    setQueue(prev => {
      if (prev.some(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentQueueIndex(0);
  }, []);

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

  const setRandomSameArtistAutoplay = useCallback((enabled: boolean) => {
    setRandomSameArtistAutoplayState(enabled);
    try {
      localStorage.setItem('streamflix_same_artist_autoplay', String(enabled));
    } catch {
      // Ignore
    }
  }, []);

  const toggleRandomSameArtistAutoplay = useCallback(() => {
    setRandomSameArtistAutoplayState(prev => {
      const next = !prev;
      try {
        localStorage.setItem('streamflix_same_artist_autoplay', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const syncProgress = useCallback((curr: number, dur: number) => {
    setCurrentTime(curr);
    if (dur > 0) {
      setDuration(dur);
    }
  }, []);

  const handleTrackEnded = useCallback(async () => {
    await playNext();
  }, [playNext]);

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
        activePlayer,
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
        playbackSpeed,
        repeatMode,
        isShuffled,
        randomSameArtistAutoplay,
        isSearchingSameArtist,
        toggleRepeat,
        toggleShuffle,
        toggleRandomSameArtistAutoplay,
        setRandomSameArtistAutoplay,
        setPlaybackSpeed,
        playRandomSameArtistSong,
        setActivePlayer,
        switchToVideo,
        switchToAudio,
        stopCurrentPlayer,
        playTrack,
        playQueueItem,
        playTrackById,
        togglePlay,
        pauseTrack,
        resumeTrack,
        playNext,
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
        audioPlayerRef,
        videoPlayerRef,
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


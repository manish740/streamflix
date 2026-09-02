import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { YouTubeTrack, ActivePlayerMode, PlayTrackOptions, PlaybackState } from '../types';
import { CURATED_MUSIC_TRACKS } from '../services/youtubeService';
import { useAuth } from './AuthContext';
import { YouTubePlayerRef } from '../components/YouTubePlayer';

export type { ActivePlayerMode, PlayTrackOptions, PlaybackState };
export type RepeatMode = 'off' | 'one' | 'all';
export type PlaybackMode = 'audio' | 'video';

interface MusicContextType {
  currentTrack: YouTubeTrack | null;
  activePlayer: ActivePlayerMode;
  isPlaying: boolean;
  isUserInitiated: boolean;
  isPlayerReady: boolean;
  autoplayBlocked: boolean;
  playbackError: string | null;
  queue: YouTubeTrack[];
  currentQueueIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  autoplay: boolean;
  repeatMode: RepeatMode;
  playbackMode: PlaybackMode;
  isMiniPlayerVisible: boolean;
  isExpandedModalOpen: boolean;
  isQueueOpen: boolean;
  recentlyPlayed: YouTubeTrack[];
  favorites: string[];

  // Central Player & Lifecycle controls
  playTrack: (track: YouTubeTrack, optionsOrQueue?: PlayTrackOptions | YouTubeTrack[]) => Promise<void>;
  switchMode: (newMode: 'audio' | 'video') => void;
  retryPlayback: () => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  nextTrack: () => Promise<void>; // Alias for playNext
  previousTrack: () => Promise<void>; // Alias for playPrevious
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => Promise<void>;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;

  // Queue manipulation
  addToQueue: (track: YouTubeTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;

  // Settings & Modes
  toggleAutoplay: () => void;
  toggleRepeat: () => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  togglePlaybackMode: () => void;

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

  // Player ref linking & events
  playerRef: React.RefObject<YouTubePlayerRef | null>;
  syncProgress: (curr: number, dur: number) => void;
  handleTrackEnded: () => void;
  handlePlayerPlay: () => void;
  handlePlayerPause: () => void;
  handlePlayerReady: (player: any) => void;
  handleAutoplayBlocked: () => void;
  handlePlaybackError: (code: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeProfile } = useAuth();
  const playerRef = useRef<YouTubePlayerRef | null>(null);

  // Core Playback State
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [activePlayer, setActivePlayerState] = useState<ActivePlayerMode>('audio');
  const [queue, setQueue] = useState<YouTubeTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isUserInitiated, setIsUserInitiated] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Autoplay & Repeat & Mode
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [playbackMode, setPlaybackModeState] = useState<PlaybackMode>('audio');

  // UI Visibility States
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState<boolean>(false);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  // Synchronized Refs to eliminate stale state in async callbacks & event handlers
  const currentTrackRef = useRef<YouTubeTrack | null>(null);
  const activePlayerRef = useRef<ActivePlayerMode>('audio');
  const queueRef = useRef<YouTubeTrack[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const isUserInitiatedRef = useRef<boolean>(false);
  const isPlayerReadyRef = useRef<boolean>(false);
  const autoplayBlockedRef = useRef<boolean>(false);
  const currentTimeRef = useRef<number>(0);
  const savedPositionRef = useRef<number>(0);
  const autoplayRef = useRef<boolean>(true);
  const repeatModeRef = useRef<RepeatMode>('off');
  const playbackModeRef = useRef<PlaybackMode>('audio');
  const advancingRef = useRef<boolean>(false); // Prevent multiple playNext() calls

  // Keep refs in sync with state
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    activePlayerRef.current = activePlayer;
  }, [activePlayer]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isUserInitiatedRef.current = isUserInitiated;
  }, [isUserInitiated]);

  useEffect(() => {
    isPlayerReadyRef.current = isPlayerReady;
  }, [isPlayerReady]);

  useEffect(() => {
    autoplayBlockedRef.current = autoplayBlocked;
  }, [autoplayBlocked]);

  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  // Periodic mobile playback diagnostic logger (requirement #19)
  useEffect(() => {
    if (!currentTrack) return;
    const logInterval = setInterval(() => {
      const vId = currentTrackRef.current?.videoId || currentTrackRef.current?.id;
      if (!vId) return;
      console.log('[MOBILE PLAYER]', {
        videoId: vId,
        activePlayer: activePlayerRef.current,
        isPlaying: isPlayingRef.current,
        playerReady: isPlayerReadyRef.current,
        playerState: playerRef.current?.getPlayerState?.() ?? (isPlayingRef.current ? 1 : 2),
        currentTime: currentTimeRef.current
      });
    }, 4000);
    return () => clearInterval(logInterval);
  }, [currentTrack]);

  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  // Profile-specific storage keys
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

  const recentlyPlayedRef = useRef<YouTubeTrack[]>(recentlyPlayed);
  useEffect(() => {
    recentlyPlayedRef.current = recentlyPlayed;
  }, [recentlyPlayed]);

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
      const savedRecent = localStorage.getItem(`streamflix_music_recent_${profileId}`);
      if (savedRecent) {
        const parsed = JSON.parse(savedRecent);
        setRecentlyPlayed(parsed);
        recentlyPlayedRef.current = parsed;
      } else {
        setRecentlyPlayed(CURATED_MUSIC_TRACKS.slice(0, 5));
        recentlyPlayedRef.current = CURATED_MUSIC_TRACKS.slice(0, 5);
      }

      const savedFavs = localStorage.getItem(`streamflix_music_favs_${profileId}`);
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      } else {
        setFavorites(['4NRXx6U8ABQ', 'UDVtMYqUAyw']);
      }
    } catch {
      // Ignore
    }
  }, [profileId]);

  // Persist history & favorites
  useEffect(() => {
    try {
      localStorage.setItem(recentStorageKey, JSON.stringify(recentlyPlayed));
    } catch {
      // Ignore
    }
  }, [recentlyPlayed, recentStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(favsStorageKey, JSON.stringify(favorites));
    } catch {
      // Ignore
    }
  }, [favorites, favsStorageKey]);

  // Record playback to profile recently played history
  const recordToHistory = useCallback((track: YouTubeTrack) => {
    const trackId = track.videoId || track.id;
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => (t.videoId || t.id) !== trackId);
      const updated = [track, ...filtered].slice(0, 30);
      recentlyPlayedRef.current = updated;
      return updated;
    });
  }, []);

  // Helper: Stop active player safely
  const stopActivePlayer = useCallback(async () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    } catch (err) {
      console.warn('Could not stop active player:', err);
    }
  }, []);

  // ==========================================
  // Central playTrack function
  // 1. Stop active player.
  // 2. Set selected track & mode.
  // 3. Set currentTime = startSeconds.
  // 4. Set active player.
  // 5. Load new videoId.
  // 6. Wait for player ready.
  // 7. Start playback.
  // ==========================================
  const playTrack = useCallback(
    async (track: YouTubeTrack, optionsOrQueue?: PlayTrackOptions | YouTubeTrack[]) => {
      let options: PlayTrackOptions = {};
      if (Array.isArray(optionsOrQueue)) {
        options = { newQueue: optionsOrQueue };
      } else if (optionsOrQueue) {
        options = optionsOrQueue;
      }

      const trackId = track.videoId || track.id;
      if (!trackId) return;

      const userInitiated = options.userInitiated ?? true;
      const startSec = options.startSeconds || 0;
      const requestedMode = options.mode || playbackModeRef.current || 'audio';
      const shouldAutoplay = options.autoplay !== false;

      console.log('PLAY REQUESTED', {
        trackId,
        title: track.title,
        mode: requestedMode,
        startSec,
        userInitiated,
        shouldAutoplay
      });

      // 1. Stop active player safely
      await stopActivePlayer();

      // 2. Set the selected track and active mode
      setCurrentTrack(track);
      currentTrackRef.current = track;
      setActivePlayerState(requestedMode);
      activePlayerRef.current = requestedMode;
      setPlaybackModeState(requestedMode);
      playbackModeRef.current = requestedMode;

      // 3. Reset position & flags
      setCurrentTime(startSec);
      currentTimeRef.current = startSec;
      setDuration(track.durationSec || 210);
      setIsUserInitiated(userInitiated);
      isUserInitiatedRef.current = userInitiated;
      setAutoplayBlocked(false);
      autoplayBlockedRef.current = false;
      setPlaybackError(null);

      // Record to profile history
      recordToHistory(track);

      // Set playing and visible
      setIsPlaying(shouldAutoplay);
      isPlayingRef.current = shouldAutoplay;
      setIsMiniPlayerVisible(true);

      // Handle queue update
      if (options.newQueue && options.newQueue.length > 0) {
        const trackIdx = options.newQueue.findIndex(t => (t.videoId || t.id) === trackId);
        let upcoming: YouTubeTrack[];
        if (trackIdx >= 0) {
          upcoming = options.newQueue.slice(trackIdx + 1);
        } else {
          upcoming = options.newQueue.filter(t => (t.videoId || t.id) !== trackId);
        }
        setQueue(upcoming);
        queueRef.current = upcoming;
      } else {
        setQueue(prev => {
          const filtered = prev.filter(t => (t.videoId || t.id) !== trackId);
          queueRef.current = filtered;
          return filtered;
        });
      }

      // 4, 5, 6, 7: Command player to load new videoId and play
      if (playerRef.current) {
        playerRef.current.loadVideo(trackId, shouldAutoplay, startSec);
      }
    },
    [stopActivePlayer, recordToHistory]
  );

  // Switch between audio and video modes while preserving position
  const switchMode = useCallback((newMode: 'audio' | 'video') => {
    const current = currentTrackRef.current;
    const currentPos = currentTimeRef.current;
    const trackId = current?.videoId || current?.id;

    console.log(`[MOBILE PLAYER] Switch mode: ${activePlayerRef.current} -> ${newMode} at ${currentPos}s`);

    // 1. Pause current player
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsPlaying(false);
    isPlayingRef.current = false;

    // 2. Save current position
    savedPositionRef.current = currentPos;

    // 3. Update active player and playback mode
    setActivePlayerState(newMode);
    activePlayerRef.current = newMode;
    setPlaybackModeState(newMode);
    playbackModeRef.current = newMode;
    setAutoplayBlocked(false);
    autoplayBlockedRef.current = false;
    setPlaybackError(null);

    // 4. Seek to saved position & load with autoplay
    if (trackId && playerRef.current) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      playerRef.current.loadVideo(trackId, true, currentPos);
    }
  }, []);

  // Explicit user-initiated retry playback (for "Tap to Play" or resume after block)
  const retryPlayback = useCallback(() => {
    console.log('PLAY REQUESTED (manual retry gesture)');
    setIsUserInitiated(true);
    isUserInitiatedRef.current = true;
    setAutoplayBlocked(false);
    autoplayBlockedRef.current = false;
    setPlaybackError(null);
    setIsPlaying(true);
    isPlayingRef.current = true;

    if (playerRef.current) {
      playerRef.current.play();
    }
  }, []);

  // ==========================================
  // Section 2 & 7: Central playNext() function
  // Single source of truth for advancing the queue.
  // ==========================================
  const playNext = useCallback(async () => {
    const current = currentTrackRef.current;
    const currentQ = queueRef.current;

    console.log('Current track ended:', current);
    console.log('Queue:', currentQ);

    // Section 16: Repeat ONE mode - replay current track from second 0
    if (repeatModeRef.current === 'one' && current) {
      const currentId = current.videoId || current.id;
      console.log('Repeat ONE active. Replaying:', current.title);
      await stopActivePlayer();
      setCurrentTime(0);
      setIsPlaying(true);
      isPlayingRef.current = true;
      if (playerRef.current) {
        playerRef.current.seekTo(0);
        playerRef.current.play();
      }
      return;
    }

    // Section 1: When current song finishes, next queued song becomes current
    if (currentQ.length > 0) {
      const nextTrack = currentQ[0];
      const remainingQueue = currentQ.slice(1);

      console.log('Playing next:', nextTrack);

      // Section 15: Do not reload the current song unless repeat is explicitly enabled
      const currentId = current?.videoId || current?.id;
      const nextId = nextTrack.videoId || nextTrack.id;
      if (currentId && nextId === currentId && repeatModeRef.current === 'off') {
        if (remainingQueue.length > 0) {
          queueRef.current = remainingQueue;
          setQueue(remainingQueue);
          // Recursively advance to following item
          return playNext();
        }
      }

      // 1. Stop active player
      await stopActivePlayer();

      // 2. Advance queue
      setQueue(remainingQueue);
      queueRef.current = remainingQueue;

      // 3. Set next track
      setCurrentTrack(nextTrack);
      currentTrackRef.current = nextTrack;
      setCurrentTime(0);
      setDuration(nextTrack.durationSec || 210);
      setIsPlaying(true);
      isPlayingRef.current = true;
      recordToHistory(nextTrack);

      // 4. Command player to load next videoId and play automatically
      if (playerRef.current) {
        playerRef.current.loadVideo(nextId, true);
      }
      return;
    }

    // Queue is empty: check Repeat ALL
    if (repeatModeRef.current === 'all' && recentlyPlayedRef.current.length > 0) {
      const currentId = current?.videoId || current?.id;
      const candidate =
        recentlyPlayedRef.current.find(t => (t.videoId || t.id) !== currentId) ||
        recentlyPlayedRef.current[0];
      if (candidate) {
        console.log('Repeat ALL active. Looping to:', candidate.title);
        await playTrack(candidate);
        return;
      }
    }

    // Section 14: Respect existing autoplay setting when queue is empty
    if (autoplayRef.current) {
      console.log('Queue empty & Autoplay ON. Finding recommended track...');
      const currentId = current?.videoId || current?.id;
      const sameCategoryOrArtist = CURATED_MUSIC_TRACKS.filter(
        t =>
          t.id !== currentId &&
          (t.artist === current?.artist ||
            t.genre === current?.genre ||
            t.category === current?.category)
      );
      const pool =
        sameCategoryOrArtist.length > 0
          ? sameCategoryOrArtist
          : CURATED_MUSIC_TRACKS.filter(t => t.id !== currentId);

      if (pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        const recommendedTrack = pool[randomIndex];
        console.log('Autoplay recommending:', recommendedTrack.title);
        await playTrack(recommendedTrack);
        return;
      }
    }

    // Autoplay OFF and queue empty: stop playback
    console.log('Queue empty and Autoplay is OFF. Playback stopped.');
    await stopActivePlayer();
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [stopActivePlayer, playTrack, recordToHistory]);

  // ==========================================
  // Section 11: Prevent multiple playNext() calls with guard
  // ==========================================
  const handleTrackEnded = useCallback(async () => {
    if (advancingRef.current) {
      console.log('Track ended event suppressed by advancingRef guard');
      return;
    }

    advancingRef.current = true;
    try {
      await playNext();
    } catch (err) {
      console.error('Error during playNext:', err);
    } finally {
      // Release guard after brief debounce to ensure player transition settled
      setTimeout(() => {
        advancingRef.current = false;
      }, 600);
    }
  }, [playNext]);

  // Previous track handler
  const playPrevious = useCallback(async () => {
    // If past 4 seconds, restart current track
    if (currentTime > 4 && currentTrack) {
      setCurrentTime(0);
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
      return;
    }

    // Try recent history
    const currentId = currentTrack?.videoId || currentTrack?.id;
    const recent = recentlyPlayedRef.current;
    const prev = recent.find(t => (t.videoId || t.id) !== currentId);
    if (prev) {
      await playTrack(prev);
    } else if (currentTrack) {
      setCurrentTime(0);
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
    }
  }, [currentTime, currentTrack, playTrack]);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (playerRef.current) {
      playerRef.current.pause();
    }
  }, []);

  const resumeTrack = useCallback(() => {
    setIsPlaying(true);
    isPlayingRef.current = true;
    if (playerRef.current) {
      playerRef.current.play();
    }
  }, []);

  const stopTrack = useCallback(async () => {
    await stopActivePlayer();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentTime(0);
  }, [stopActivePlayer]);

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

  // Queue manipulation
  const addToQueue = useCallback((track: YouTubeTrack) => {
    setQueue(prev => {
      // Append track to queue
      const updated = [...prev, track];
      queueRef.current = updated;
      return updated;
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      const updated = prev.filter((_, i) => i !== index);
      queueRef.current = updated;
      return updated;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    queueRef.current = [];
  }, []);

  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    setQueue(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      queueRef.current = result;
      return result;
    });
  }, []);

  // Settings & Modes
  const toggleAutoplay = useCallback(() => {
    setAutoplay(prev => {
      const next = !prev;
      autoplayRef.current = next;
      return next;
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      const modes: RepeatMode[] = ['off', 'one', 'all'];
      const nextIdx = (modes.indexOf(prev) + 1) % modes.length;
      const next = modes[nextIdx];
      repeatModeRef.current = next;
      return next;
    });
  }, []);

  const setPlaybackMode = useCallback((mode: PlaybackMode) => {
    setPlaybackModeState(mode);
    playbackModeRef.current = mode;
  }, []);

  const togglePlaybackMode = useCallback(() => {
    setPlaybackModeState(prev => {
      const next = prev === 'audio' ? 'video' : 'audio';
      playbackModeRef.current = next;
      return next;
    });
  }, []);

  // View state controls
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
    recentlyPlayedRef.current = [];
  }, []);

  const syncProgress = useCallback((curr: number, dur: number) => {
    setCurrentTime(curr);
    currentTimeRef.current = curr;
    if (dur > 0) {
      setDuration(dur);
    }
  }, []);

  const handlePlayerPlay = useCallback(() => {
    setIsPlaying(true);
    isPlayingRef.current = true;
    setAutoplayBlocked(false);
    autoplayBlockedRef.current = false;
    setPlaybackError(null);
  }, []);

  const handlePlayerPause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, []);

  const handlePlayerReady = useCallback((_player: any) => {
    setIsPlayerReady(true);
    isPlayerReadyRef.current = true;
  }, []);

  const handleAutoplayBlocked = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setAutoplayBlocked(true);
    autoplayBlockedRef.current = true;
  }, []);

  const handlePlaybackError = useCallback((code: number) => {
    console.warn('Playback error code:', code);
    setIsPlaying(false);
    isPlayingRef.current = false;
    if ([100, 101, 150].includes(code)) {
      setPlaybackError('This track is unavailable or restricted by YouTube.');
    } else {
      setPlaybackError('Playback error. Tap to retry.');
    }
  }, []);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        activePlayer,
        isPlaying,
        isUserInitiated,
        isPlayerReady,
        autoplayBlocked,
        playbackError,
        queue,
        currentQueueIndex: 0,
        currentTime,
        duration,
        volume,
        isMuted,
        autoplay,
        repeatMode,
        playbackMode,
        isMiniPlayerVisible,
        isExpandedModalOpen,
        isQueueOpen,
        recentlyPlayed,
        favorites,
        playTrack,
        switchMode,
        retryPlayback,
        playNext,
        playPrevious,
        nextTrack: playNext,
        previousTrack: playPrevious,
        pauseTrack,
        resumeTrack,
        stopTrack,
        togglePlay,
        seekTo,
        setVolume,
        toggleMute,
        addToQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        toggleAutoplay,
        toggleRepeat,
        setPlaybackMode,
        togglePlaybackMode,
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
        handlePlayerPause,
        handlePlayerReady,
        handleAutoplayBlocked,
        handlePlaybackError
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

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

// Declarations for YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: YTPlayerEvent) => void;
            onStateChange?: (event: YTPlayerStateChangeEvent) => void;
            onError?: (event: YTPlayerErrorEvent) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
}

export interface YTPlayerEvent {
  target: YTPlayer;
}

export interface YTPlayerStateChangeEvent {
  target: YTPlayer;
  data: number; // 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
}

export interface YTPlayerErrorEvent {
  target: YTPlayer;
  data: number;
}

export interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  playlist?: string[];
  controls?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  onError?: (error: number) => void;
  onReady?: (player: YTPlayer) => void;
}

export interface YouTubePlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayer: () => YTPlayer | null;
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  (
    {
      videoId,
      autoplay = true,
      playlist,
      controls = true,
      className = '',
      onPlay,
      onPause,
      onEnded,
      onProgress,
      onError,
      onReady
    },
    ref
  ) => {
    const containerId = useRef(`yt-player-${Math.random().toString(36).substring(2, 9)}`);
    const playerInstanceRef = useRef<YTPlayer | null>(null);
    const [isApiReady, setIsApiReady] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      play: () => playerInstanceRef.current?.playVideo(),
      pause: () => playerInstanceRef.current?.pauseVideo(),
      seekTo: (seconds: number) => playerInstanceRef.current?.seekTo(seconds, true),
      setVolume: (vol: number) => playerInstanceRef.current?.setVolume(vol),
      mute: () => playerInstanceRef.current?.mute(),
      unMute: () => playerInstanceRef.current?.unMute(),
      getCurrentTime: () => playerInstanceRef.current?.getCurrentTime() || 0,
      getDuration: () => playerInstanceRef.current?.getDuration() || 0,
      getPlayer: () => playerInstanceRef.current
    }));

    // Step 1: Ensure YouTube IFrame API is loaded
    useEffect(() => {
      if (window.YT && window.YT.Player) {
        setIsApiReady(true);
        return;
      }

      // Check if script tag is already injected
      const existingScript = document.getElementById('yt-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        setIsApiReady(true);
      };
    }, []);

    // Clear progress interval helper
    const clearProgressInterval = useCallback(() => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, []);

    // Start tracking currentTime & duration
    const startProgressInterval = useCallback(() => {
      clearProgressInterval();
      progressIntervalRef.current = setInterval(() => {
        if (playerInstanceRef.current) {
          try {
            const current = playerInstanceRef.current.getCurrentTime() || 0;
            const dur = playerInstanceRef.current.getDuration() || 0;
            if (onProgress) {
              onProgress(current, dur);
            }
          } catch {
            // Player may be unmounted or buffering
          }
        }
      }, 500);
    }, [clearProgressInterval, onProgress]);

    // Step 2: Initialize or update YouTube Player instance
    useEffect(() => {
      if (!isApiReady || !videoId) return;

      const element = document.getElementById(containerId.current);
      if (!element) return;

      // If player already exists, just load or cue the new video ID
      if (playerInstanceRef.current) {
        try {
          if (autoplay) {
            playerInstanceRef.current.loadVideoById(videoId, 0);
          } else {
            playerInstanceRef.current.cueVideoById(videoId, 0);
          }
          return;
        } catch {
          // If update failed, recreate player
          try {
            playerInstanceRef.current.destroy();
          } catch {
            // Ignore
          }
          playerInstanceRef.current = null;
        }
      }

      setIsLoading(true);

      const player = new window.YT.Player(containerId.current, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: controls ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          playlist: playlist && playlist.length > 0 ? playlist.join(',') : undefined
        },
        events: {
          onReady: (event: YTPlayerEvent) => {
            playerInstanceRef.current = event.target;
            setIsLoading(false);
            if (autoplay) {
              try {
                event.target.playVideo();
              } catch {
                // Autoplay may need user interaction on mobile
              }
            }
            if (onReady) {
              onReady(event.target);
            }
          },
          onStateChange: (event: YTPlayerStateChangeEvent) => {
            const state = event.data;
            if (window.YT && window.YT.PlayerState) {
              if (state === window.YT.PlayerState.PLAYING) {
                startProgressInterval();
                if (onPlay) onPlay();
              } else if (state === window.YT.PlayerState.PAUSED) {
                clearProgressInterval();
                if (onPause) onPause();
              } else if (state === window.YT.PlayerState.ENDED) {
                clearProgressInterval();
                if (onEnded) onEnded();
              }
            }
          },
          onError: (event: YTPlayerErrorEvent) => {
            setIsLoading(false);
            clearProgressInterval();
            if (onError) onError(event.data);
          }
        }
      });

      playerInstanceRef.current = player;

      return () => {
        clearProgressInterval();
      };
    }, [
      isApiReady,
      videoId,
      autoplay,
      controls,
      playlist,
      onPlay,
      onPause,
      onEnded,
      onError,
      onReady,
      startProgressInterval,
      clearProgressInterval
    ]);

    // Clean up on component unmount
    useEffect(() => {
      return () => {
        clearProgressInterval();
        if (playerInstanceRef.current) {
          try {
            playerInstanceRef.current.destroy();
          } catch {
            // Ignore
          }
          playerInstanceRef.current = null;
        }
      };
    }, [clearProgressInterval]);

    return (
      <div className={`relative overflow-hidden bg-black rounded-xl ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center z-10">
            <div className="w-10 h-10 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs text-zinc-400 font-mono tracking-wider">
              Loading YouTube Media...
            </span>
          </div>
        )}
        <div id={containerId.current} className="w-full h-full aspect-video" />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

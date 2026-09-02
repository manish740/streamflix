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
  data: number; // 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued, -1 = unstarted
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
  onAutoplayBlocked?: () => void;
}

export interface YouTubePlayerRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayer: () => YTPlayer | null;
  getPlayerState: () => number;
  loadVideo: (videoId: string, shouldAutoplay?: boolean, startSeconds?: number) => void;
  isReady: () => boolean;
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
      onReady,
      onAutoplayBlocked
    },
    ref
  ) => {
    // id="v9x8j2" container ref
    const playerContainerRef = useRef<HTMLDivElement | null>(null);
    // Player ref storing active YT.Player instance
    // id="lq9q8f"
    const playerRef = useRef<YTPlayer | null>(null);
    // id="v7j3k9"
    const initializingRef = useRef(false);
    const mountedRef = useRef(true);

    const isPlayerReadyRef = useRef<boolean>(false);
    const currentVideoIdRef = useRef<string>(videoId);
    const pendingLoadRef = useRef<{ videoId: string; autoplay: boolean; startSeconds?: number } | null>(null);

    const [isApiReady, setIsApiReady] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Keep fresh references to all callback props to prevent stale closures
    const onPlayRef = useRef(onPlay);
    const onPauseRef = useRef(onPause);
    const onEndedRef = useRef(onEnded);
    const onProgressRef = useRef(onProgress);
    const onErrorRef = useRef(onError);
    const onReadyRef = useRef(onReady);
    const onAutoplayBlockedRef = useRef(onAutoplayBlocked);
    const autoplayRef = useRef(autoplay);

    useEffect(() => {
      onPlayRef.current = onPlay;
      onPauseRef.current = onPause;
      onEndedRef.current = onEnded;
      onProgressRef.current = onProgress;
      onErrorRef.current = onError;
      onReadyRef.current = onReady;
      onAutoplayBlockedRef.current = onAutoplayBlocked;
      autoplayRef.current = autoplay;
    });

    // Clear progress tracking interval
    const clearProgressInterval = useCallback(() => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, []);

    // Start progress tracking interval
    const startProgressInterval = useCallback(() => {
      clearProgressInterval();
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          try {
            const current = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || 0;
            if (onProgressRef.current) {
              onProgressRef.current(current, dur);
            }
          } catch {
            // Player may be buffering or transitioning
          }
        }
      }, 500);
    }, [clearProgressInterval]);

    // Central loadVideo method
    const loadVideo = useCallback((newVideoId: string, shouldAutoplay = true, startSeconds = 0) => {
      if (!newVideoId) return;
      // id="h8j4m2"
      console.log("CURRENT VIDEO:", newVideoId);
      currentVideoIdRef.current = newVideoId;

      if (playerRef.current && isPlayerReadyRef.current) {
        try {
          setIsLoading(true);
          console.log('PLAY REQUESTED', { videoId: newVideoId, shouldAutoplay, startSeconds });
          if (shouldAutoplay) {
            playerRef.current.loadVideoById(newVideoId, startSeconds);
            playerRef.current.seekTo(startSeconds, true);
            playerRef.current.playVideo();

            // Mobile autoplay detection: if not playing or buffering after delay, notify blocked
            setTimeout(() => {
              if (playerRef.current) {
                try {
                  const state = playerRef.current.getPlayerState?.();
                  if (state === 2 || state === 5 || state === -1) {
                    console.log('PLAY BLOCKED');
                    setIsLoading(false);
                    onAutoplayBlockedRef.current?.();
                  }
                } catch {
                  // Ignore
                }
              }
            }, 1200);
          } else {
            playerRef.current.cueVideoById(newVideoId, startSeconds);
          }
        } catch (err) {
          console.warn('loadVideoById caught error:', err);
        }
      } else {
        pendingLoadRef.current = { videoId: newVideoId, autoplay: shouldAutoplay, startSeconds };
      }
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      play: () => {
        if (playerRef.current) {
          try {
            console.log('PLAY REQUESTED');
            playerRef.current.playVideo();
          } catch (err) {
            console.warn('playVideo failed:', err);
          }
        }
      },
      pause: () => {
        if (playerRef.current) {
          try {
            playerRef.current.pauseVideo();
          } catch (err) {
            console.warn('pauseVideo failed:', err);
          }
        }
      },
      stop: () => {
        if (playerRef.current) {
          try {
            playerRef.current.stopVideo();
          } catch (err) {
            console.warn('stopVideo failed:', err);
          }
        }
      },
      seekTo: (seconds: number) => {
        if (playerRef.current) {
          try {
            playerRef.current.seekTo(seconds, true);
          } catch (err) {
            console.warn('seekTo failed:', err);
          }
        }
      },
      setVolume: (vol: number) => {
        if (playerRef.current) {
          try {
            playerRef.current.setVolume(vol);
          } catch (err) {
            console.warn('setVolume failed:', err);
          }
        }
      },
      mute: () => {
        if (playerRef.current) {
          try {
            playerRef.current.mute();
          } catch (err) {
            console.warn('mute failed:', err);
          }
        }
      },
      unMute: () => {
        if (playerRef.current) {
          try {
            playerRef.current.unMute();
          } catch (err) {
            console.warn('unMute failed:', err);
          }
        }
      },
      getCurrentTime: () => {
        try {
          return playerRef.current?.getCurrentTime() || 0;
        } catch {
          return 0;
        }
      },
      getDuration: () => {
        try {
          return playerRef.current?.getDuration() || 0;
        } catch {
          return 0;
        }
      },
      getPlayerState: () => {
        try {
          return playerRef.current?.getPlayerState?.() ?? -1;
        } catch {
          return -1;
        }
      },
      getPlayer: () => playerRef.current,
      loadVideo,
      isReady: () => isPlayerReadyRef.current
    }));

    // Step 1: Ensure YouTube IFrame API is loaded safely
    useEffect(() => {
      const checkReady = () => {
        if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
          setIsApiReady(true);
          return true;
        }
        return false;
      };

      if (checkReady()) return;

      const existingScript = document.getElementById('yt-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.onerror = () => {
          console.warn('Failed to load YouTube IFrame API script');
        };
        // Safely append to document.head, avoiding insertBefore on dynamic script tags
        document.head.appendChild(tag);
      }

      const pollTimer = setInterval(() => {
        if (checkReady()) {
          clearInterval(pollTimer);
        }
      }, 100);

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function' && prevCallback !== window.onYouTubeIframeAPIReady) {
          try {
            prevCallback();
          } catch {
            // Ignore previous callback failure
          }
        }
        setIsApiReady(true);
      };

      return () => {
        clearInterval(pollTimer);
      };
    }, []);

    // Step 2: Initialize YouTube Player ONCE when API is ready and container is mounted
    useEffect(() => {
      if (!isApiReady) return;
      if (!playerContainerRef.current) return;
      if (!mountedRef.current) return;
      // id="f3m8tq"
      if (playerRef.current) {
        return;
      }
      if (initializingRef.current) return;

      const container = playerContainerRef.current;
      initializingRef.current = true;
      // id="h8j4m2"
      console.log("PLAYER INIT");

      // Prepare an isolated placeholder slot inside container that YouTube replaces
      let slot = container.querySelector('.yt-player-slot') as HTMLElement | null;
      if (!slot) {
        container.innerHTML = '';
        slot = document.createElement('div');
        slot.className = 'yt-player-slot w-full h-full';
        container.appendChild(slot);
      }

      const safeOrigin =
        typeof window !== 'undefined' &&
        window.location?.origin &&
        window.location.origin !== 'null'
          ? window.location.origin
          : undefined;

      const initVideoId = currentVideoIdRef.current || videoId || '';

      try {
        const player = new window.YT.Player(slot, {
          videoId: initVideoId || undefined,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            controls: controls ? 1 : 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: safeOrigin,
            playlist: playlist && playlist.length > 0 ? playlist.join(',') : undefined
          },
          events: {
            onReady: (event: YTPlayerEvent) => {
              if (!mountedRef.current) {
                try {
                  event.target.destroy();
                } catch {}
                return;
              }
              // id="h8j4m2"
              console.log("PLAYER READY");
              playerRef.current = event.target;
              isPlayerReadyRef.current = true;
              initializingRef.current = false;
              setIsLoading(false);

              // id="h8j4m2"
              console.log("PLAYER INSTANCE:", playerRef.current);
              console.log("CURRENT VIDEO:", currentVideoIdRef.current);

              if (pendingLoadRef.current) {
                const { videoId: pId, autoplay: pAutoplay, startSeconds: pStart } = pendingLoadRef.current;
                pendingLoadRef.current = null;
                currentVideoIdRef.current = pId;
                try {
                  if (pAutoplay) {
                    console.log('PLAY REQUESTED', { videoId: pId, startSeconds: pStart });
                    event.target.loadVideoById(pId, pStart || 0);
                    event.target.seekTo(pStart || 0, true);
                    event.target.playVideo();

                    // Check if mobile blocked autoplay
                    setTimeout(() => {
                      try {
                        const st = event.target.getPlayerState?.();
                        if (st === 2 || st === 5 || st === -1) {
                          console.log('PLAY BLOCKED');
                          onAutoplayBlockedRef.current?.();
                        }
                      } catch {
                        // Ignore
                      }
                    }, 1200);
                  } else {
                    event.target.cueVideoById(pId, pStart || 0);
                  }
                } catch (e) {
                  console.warn('Failed executing pending load:', e);
                }
              } else if (autoplayRef.current && initVideoId) {
                try {
                  console.log('PLAY REQUESTED', { videoId: initVideoId });
                  event.target.seekTo(0, true);
                  event.target.playVideo();
                  setTimeout(() => {
                    try {
                      const st = event.target.getPlayerState?.();
                      if (st === 2 || st === 5 || st === -1) {
                        console.log('PLAY BLOCKED');
                        onAutoplayBlockedRef.current?.();
                      }
                    } catch {
                      // Ignore
                    }
                  }, 1200);
                } catch (e) {
                  console.warn('Autoplay failed on player onReady:', e);
                  console.log('PLAY BLOCKED');
                  onAutoplayBlockedRef.current?.();
                }
              }

              if (onReadyRef.current) {
                try {
                  onReadyRef.current(event.target);
                } catch (e) {
                  console.warn('Error in onReady callback:', e);
                }
              }
            },
            onStateChange: (event: YTPlayerStateChangeEvent) => {
              if (!mountedRef.current) return;
              const state = event.data;
              console.log('PLAYER STATE', state);

              // 1 = PLAYING
              if (state === 1 || (window.YT?.PlayerState && state === window.YT.PlayerState.PLAYING)) {
                console.log('PLAY STARTED');
                setIsLoading(false);
                startProgressInterval();
                if (onPlayRef.current) {
                  try {
                    onPlayRef.current();
                  } catch (e) {
                    console.warn('Error in onPlay callback:', e);
                  }
                }
              }
              // 2 = PAUSED
              else if (state === 2 || (window.YT?.PlayerState && state === window.YT.PlayerState.PAUSED)) {
                console.log('PLAY PAUSED');
                clearProgressInterval();
                if (onPauseRef.current) {
                  try {
                    onPauseRef.current();
                  } catch (e) {
                    console.warn('Error in onPause callback:', e);
                  }
                }
              }
              // 0 = ENDED
              else if (state === 0 || (window.YT?.PlayerState && state === window.YT.PlayerState.ENDED)) {
                console.log('PLAYER ENDED');
                clearProgressInterval();
                if (onEndedRef.current) {
                  try {
                    onEndedRef.current();
                  } catch (e) {
                    console.warn('Error in onEnded callback:', e);
                  }
                }
              }
              // 5 = CUED
              else if (state === 5 || (window.YT?.PlayerState && state === window.YT.PlayerState.CUED)) {
                setIsLoading(false);
                if (autoplayRef.current) {
                  try {
                    event.target.seekTo(0, true);
                    event.target.playVideo();
                  } catch {
                    console.log('PLAY BLOCKED');
                    onAutoplayBlockedRef.current?.();
                  }
                }
              }
            },
            onError: (event: YTPlayerErrorEvent) => {
              if (!mountedRef.current) return;
              console.warn('YouTube Player error code:', event.data);
              setIsLoading(false);
              clearProgressInterval();
              if (onErrorRef.current) {
                try {
                  onErrorRef.current(event.data);
                } catch (e) {
                  console.warn('Error in onError callback:', e);
                }
              }

              // Auto-advance if video is blocked/unavailable (100 = not found, 101/150 = cannot embed)
              if ([100, 101, 150].includes(event.data) && onEndedRef.current) {
                console.log('Video unavailable/blocked on YouTube. Advancing to next track in queue...');
                try {
                  onEndedRef.current();
                } catch (e) {
                  console.warn('Error advancing track after playback error:', e);
                }
              }
            }
          }
        });
      } catch (err) {
        console.warn('Failed to construct YouTube player:', err);
        initializingRef.current = false;
        setIsLoading(false);
      }
    }, [isApiReady, controls, playlist, startProgressInterval, clearProgressInterval]);

    // Step 3: Handle track changes on existing player instance
    useEffect(() => {
      if (!videoId) return;
      if (videoId === currentVideoIdRef.current) return;

      // id="h8j4m2"
      console.log("CURRENT VIDEO:", videoId);
      currentVideoIdRef.current = videoId;

      if (playerRef.current && isPlayerReadyRef.current) {
        try {
          setIsLoading(true);
          console.log('PLAY REQUESTED', { videoId, autoplay });
          if (autoplay) {
            playerRef.current.loadVideoById(videoId, 0);
            playerRef.current.seekTo(0, true);
            playerRef.current.playVideo();
          } else {
            playerRef.current.cueVideoById(videoId, 0);
          }
        } catch (err) {
          console.warn('loadVideoById caught error:', err);
        }
      } else {
        pendingLoadRef.current = { videoId, autoplay, startSeconds: 0 };
      }
    }, [videoId, autoplay]);

    // Clean up on component unmount
    useEffect(() => {
      return () => {
        mountedRef.current = false;
        clearProgressInterval();
        // id="h8j4m2"
        console.log("PLAYER DESTROY");
        // id="r1p8v7"
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (error) {
            console.warn("Player cleanup failed", error);
          }
          playerRef.current = null;
        }
        initializingRef.current = false;
        isPlayerReadyRef.current = false;
      };
    }, [clearProgressInterval]);

    return (
      <div className={`relative overflow-hidden bg-black rounded-xl ${className}`}>
        {/* Dedicated YouTube Player container: React owns the element, YouTube creates iframe inside it */}
        <div
          id="v9x8j2"
          ref={playerContainerRef}
          className="w-full h-full aspect-video"
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center z-10 pointer-events-none">
            <div className="w-10 h-10 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs text-zinc-400 font-mono tracking-wider">
              Loading YouTube Media...
            </span>
          </div>
        )}
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

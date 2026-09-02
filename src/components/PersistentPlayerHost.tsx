import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { YouTubePlayer } from './YouTubePlayer';

export const PersistentPlayerHost: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isExpandedModalOpen,
    playerRef,
    syncProgress,
    handleTrackEnded,
    handlePlayerPlay,
    handlePlayerPause
  } = useMusic();

  const location = useLocation();
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    isModal: boolean;
  } | null>(null);

  // Track position of active video anchor in the DOM
  useEffect(() => {
    let rafId: number;

    const updatePosition = () => {
      let newTarget: {
        top: number;
        left: number;
        width: number;
        height: number;
        isModal: boolean;
      } | null = null;

      // Prioritize expanded modal video anchor if modal is open
      const modalAnchor = isExpandedModalOpen
        ? document.getElementById('expanded-video-anchor')
        : null;

      if (modalAnchor) {
        const rect = modalAnchor.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          newTarget = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            isModal: true
          };
        }
      }

      if (!newTarget) {
        // Check for in-page video anchor (e.g. on /music/video or video mode)
        const pageAnchor = document.getElementById('music-video-anchor');
        if (pageAnchor) {
          const rect = pageAnchor.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            newTarget = {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              isModal: false
            };
          }
        }
      }

      setTargetRect(prev => {
        if (!prev && !newTarget) return null;
        if (
          prev &&
          newTarget &&
          Math.abs(prev.top - newTarget.top) < 0.5 &&
          Math.abs(prev.left - newTarget.left) < 0.5 &&
          Math.abs(prev.width - newTarget.width) < 0.5 &&
          Math.abs(prev.height - newTarget.height) < 0.5 &&
          prev.isModal === newTarget.isModal
        ) {
          return prev;
        }
        return newTarget;
      });
    };

    const handleScrollOrResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });

    const observer = new MutationObserver(mutations => {
      const shouldUpdate = mutations.some(m => {
        return (m.target as HTMLElement)?.id !== 'persistent-player-host';
      });
      if (shouldUpdate) {
        handleScrollOrResize();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      observer.disconnect();
    };
  }, [location.pathname, isExpandedModalOpen]);

  if (!currentTrack) return null;

  const trackId = currentTrack.videoId || currentTrack.id;

  const containerStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        zIndex: targetRect.isModal ? 60 : 30,
        pointerEvents: 'auto',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        transition: 'none'
      }
    : {
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -10,
        overflow: 'hidden'
      };

  return (
    <div id="persistent-player-host" style={containerStyle}>
      <YouTubePlayer
        ref={playerRef}
        videoId={trackId}
        autoplay={isPlaying}
        controls={true}
        className="w-full h-full"
        onPlay={handlePlayerPlay}
        onPause={handlePlayerPause}
        onEnded={handleTrackEnded}
        onProgress={syncProgress}
      />
    </div>
  );
};

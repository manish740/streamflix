import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MovieModal } from './MovieModal';
import { ToastContainer } from './Toast';
import { MusicMiniPlayer } from './MusicMiniPlayer';
import { ExpandedMusicPlayer } from './ExpandedMusicPlayer';
import { QueueDrawer } from './QueueDrawer';
import { PersistentPlayerHost } from './PersistentPlayerHost';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between selection:bg-[#E50914] selection:text-white relative overflow-x-hidden font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Primary Outlet */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Persistent Single YouTube Player Host */}
      <PersistentPlayerHost />

      {/* Persistent YouTube Music Floating Mini-Player & Overlays */}
      <MusicMiniPlayer />
      <ExpandedMusicPlayer />
      <QueueDrawer />

      {/* Global Interactive Overlays */}
      <MovieModal />
      <ToastContainer />
      <Footer />
    </div>
  );
};

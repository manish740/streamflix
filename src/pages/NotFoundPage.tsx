import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      id="not-found-page"
      className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none font-sans"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Content */}
      <div className="max-w-lg w-full text-center space-y-6 animate-fade-in">
        {/* Big 404 Number */}
        <div className="relative">
          <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white/90 via-zinc-400 to-zinc-700 tracking-tighter">
            404
          </h1>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#E50914] text-white text-xs font-black uppercase tracking-widest rounded shadow-lg shadow-red-900/50">
            Error
          </span>
        </div>

        {/* Message */}
        <div className="space-y-2 pt-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Lost your way?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Sorry, we can&apos;t find that page. You&apos;ll find loads to explore on the home page.
          </p>
        </div>

        {/* Action button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            id="not-found-home-btn"
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>StreamFlix Home</span>
          </Link>
          <Link
            to="/movies"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm transition-all"
          >
            <Film className="w-4 h-4" />
            <span>Browse Movies</span>
          </Link>
        </div>

        {/* Error Code Tag */}
        <p className="text-[11px] text-zinc-600 font-mono pt-6">
          Error Code: <span className="text-zinc-400">NSES-404-NOT_FOUND</span>
        </p>
      </div>
    </div>
  );
};

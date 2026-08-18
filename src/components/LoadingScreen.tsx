import React from 'react';

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading StreamFlix...' }) => {
  return (
    <div
      id="streamflix-global-loading-screen"
      className="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center select-none"
    >
      <div className="flex flex-col items-center space-y-6 animate-pulse">
        {/* Glowing StreamFlix Logo Icon */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E50914] flex items-center justify-center font-display text-4xl sm:text-5xl text-white font-black tracking-wider shadow-2xl shadow-red-700/60 ring-4 ring-[#E50914]/20 animate-bounce">
            S
          </div>
          <div className="absolute -inset-2 bg-red-600/30 rounded-3xl blur-xl -z-10 animate-pulse" />
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl text-[#E50914] font-black tracking-widest uppercase">
            STREAMFLIX
          </h1>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
            <span className="text-xs sm:text-sm text-zinc-400 font-medium tracking-wide">
              {message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

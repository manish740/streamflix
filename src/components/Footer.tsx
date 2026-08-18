import React from 'react';
import { Globe, Github, Film } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050505] border-t border-zinc-800 text-zinc-400 text-xs py-12 px-4 sm:px-8 md:px-12 mt-16 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Brand & Portfolio Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#E50914] text-white flex items-center justify-center font-display text-lg font-bold shadow-md shadow-red-900/30">
              S
            </div>
            <span className="font-display text-xl text-[#E50914] font-bold tracking-wider">
              STREAMFLIX
            </span>
            <span className="ml-2 text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
              Production Portfolio Demo
            </span>
          </div>

          <p className="text-zinc-500 text-[11px]">
            Designed & Engineered with React, TypeScript, Tailwind CSS, and Express REST API.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-zinc-400">
          <div className="space-y-2.5">
            <p className="text-zinc-200 font-semibold text-xs">Audio & Subtitles</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Media Center</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Privacy & Terms</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Contact Us</p>
          </div>

          <div className="space-y-2.5">
            <p className="text-zinc-200 font-semibold text-xs">Help Center</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Investor Relations</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Jobs & Careers</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Legal Notices</p>
          </div>

          <div className="space-y-2.5">
            <p className="text-zinc-200 font-semibold text-xs">Account Settings</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Ways to Watch</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Corporate Information</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Speed Test</p>
          </div>

          <div className="space-y-2.5">
            <p className="text-zinc-200 font-semibold text-xs">StreamFlix Originals</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">4K Ultra HD & Dolby Atmos</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Cookie Preferences</p>
            <p className="hover:underline cursor-pointer hover:text-white transition-colors">Ad Choices</p>
          </div>
        </div>

        {/* Language selector & Disclaimer */}
        <div className="space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 text-xs">
            <Globe className="w-3.5 h-3.5" />
            <span>English (United States)</span>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed max-w-2xl">
            StreamFlix is a demonstration project created for developer portfolio presentation. All movie descriptions, titles, and video trailers are open-source and royalty-free samples (Blender Foundation, Big Buck Bunny, Tears of Steel, Sintel, Elephant&apos;s Dream, Cosmos Laundromat). No copyrighted Netflix assets or trademarks are used.
          </p>

          <p className="text-[11px] text-zinc-600">
            © {new Date().getFullYear()} StreamFlix, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useRef, useState } from 'react';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieRowProps {
  id?: string;
  title: string;
  subtitle?: string;
  items: MediaItem[];
  isTop10?: boolean;
  showProgress?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  id,
  title,
  subtitle,
  items,
  isTop10 = false,
  showProgress = false
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!items || items.length === 0) return null;

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const slide = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div id={id} className="relative group/row my-6 sm:my-8 lg:my-10 select-none">
      {/* Row Header */}
      <div className="flex items-baseline justify-between px-4 sm:px-8 md:px-12 mb-2 sm:mb-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight group-hover/row:text-[#E50914] transition-colors">
            {title}
          </h2>
          {subtitle && <span className="text-xs text-zinc-400 font-normal">{subtitle}</span>}
        </div>
      </div>

      {/* Row Slider Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            id={`row-left-${title.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => slide('left')}
            className="absolute left-0 top-0 bottom-0 z-40 w-10 sm:w-14 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-all duration-200 hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8 drop-shadow-md text-white" />
          </button>
        )}

        {/* Media Cards Track */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-8 md:px-12 py-3 scroll-smooth"
        >
          {items.map((item, index) => (
            <MovieCard
              key={`${item.id}-${index}`}
              media={item}
              rank={isTop10 ? index + 1 : undefined}
              showProgress={showProgress}
            />
          ))}
        </div>

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            id={`row-right-${title.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => slide('right')}
            className="absolute right-0 top-0 bottom-0 z-40 w-10 sm:w-14 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-all duration-200 hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8 drop-shadow-md text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

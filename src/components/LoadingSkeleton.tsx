import React from 'react';
import { Film, Sparkles } from 'lucide-react';

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="relative aspect-[16/9] w-full min-w-[200px] sm:min-w-[240px] md:min-w-[280px] rounded-xl bg-zinc-900 animate-pulse overflow-hidden border border-zinc-800">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/30 to-transparent animate-glow" />
      <div className="absolute bottom-3 left-3 right-3 space-y-2">
        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
        <div className="flex gap-2">
          <div className="h-3 w-10 bg-zinc-800 rounded" />
          <div className="h-3 w-12 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
};

export const RowSkeleton: React.FC<{ title?: string }> = ({ title = 'Loading Content...' }) => {
  return (
    <div className="space-y-3 px-4 sm:px-8 md:px-12 my-6">
      <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-[#E50914] shadow-lg">
        {icon || <Film className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-red-900/30 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

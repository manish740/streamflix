export type MediaType = 'movie' | 'tv';

export type MaturityRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'TV-Y' | 'TV-G' | 'TV-PG' | 'TV-14' | 'TV-MA';

export type QualityLevel = 'HD' | 'Full HD' | '4K Ultra HD' | 'HDR' | 'Dolby Vision';

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  synopsis: string;
  duration: number; // minutes
  thumbnailUrl: string;
  videoUrl: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  synopsis?: string;
  episodes: Episode[];
}

export interface MediaItem {
  id: string;
  title: string;
  slug: string;
  type: MediaType;
  synopsis: string;
  releaseYear: number;
  maturityRating: MaturityRating;
  duration?: number; // for movies in minutes
  totalSeasons?: number; // for TV shows
  quality: QualityLevel;
  ratingScore: number; // 0-10 or match percentage e.g. 98%
  matchPercentage: number; // e.g. 97
  posterUrl: string;
  backdropUrl: string;
  logoUrl?: string;
  videoUrl: string; // main video stream URL
  trailerUrl?: string; // preview teaser video URL
  director?: string;
  creator?: string;
  cast: string[];
  genres: string[];
  tags: string[];
  audioLanguages: string[];
  subtitles: string[];
  featured?: boolean;
  trendingRank?: number; // for top 10 rows (1-10)
  seasons?: Season[];
  similarIds?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  preferredLang: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin';
  profiles: UserProfile[];
  activeProfileId: string;
}

export interface ViewingProgress {
  mediaId: string;
  mediaType: MediaType;
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  currentTime: number; // seconds
  duration: number; // seconds
  percent: number; // 0-100
  updatedAt: string;
}

export interface WatchHistoryItem {
  id: string;
  mediaId: string;
  media: MediaItem;
  episodeId?: string;
  episodeTitle?: string;
  watchedAt: string;
  progressPercent: number;
}

export interface UserRating {
  mediaId: string;
  score: 'liked' | 'disliked' | 'loved';
  review?: string;
  updatedAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'favorite' | 'removed';
}

export type ActiveNavTab = 'home' | 'tv' | 'movies' | 'music' | 'new-popular' | 'my-list' | 'history';

// ==========================================
// YouTube Music & Video Playback Types
// ==========================================
export interface YouTubeTrack {
  id: string; // YouTube Video ID (e.g. "dQw4w9WgXcQ")
  videoId?: string; // Compatibility alias
  queueId?: string; // Optional unique queue entry id
  title: string;
  artist: string; // Channel title or musical artist
  channelId?: string;
  thumbnailUrl: string;
  thumbnail?: string; // Compatibility alias
  duration?: string; // Formatted e.g. "3:45"
  durationSec?: number; // Total seconds
  viewCount?: string; // e.g. "125M views"
  publishedAt?: string;
  description?: string;
  genre?: string;
  category?: 'trending' | 'popular' | 'soundtrack' | 'lofi' | 'pop' | 'rock' | 'hiphop' | 'electronic';
  isFavorite?: boolean;
}

export type ActivePlayerMode = 'audio' | 'video' | null;

export interface PlaybackState {
  currentTrack: YouTubeTrack | null;
  activePlayer: 'audio' | 'video' | null;
  isPlaying: boolean;
  isUserInitiated: boolean;
  currentTime: number;
  volume: number;
  queue: YouTubeTrack[];
}

export interface PlayTrackOptions {
  newQueue?: YouTubeTrack[];
  userInitiated?: boolean;
  startSeconds?: number;
  mode?: 'audio' | 'video';
  autoplay?: boolean;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  itemCount: number;
  channelTitle?: string;
  tracks?: YouTubeTrack[];
}

export interface MusicHistoryItem {
  id: string;
  trackId: string;
  track: YouTubeTrack;
  playedAt: string;
}

export interface YouTubeSearchResponse {
  tracks: YouTubeTrack[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults?: number;
}


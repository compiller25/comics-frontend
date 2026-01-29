// Core types for the comics platform

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'reader' | 'creator' | 'admin';
  createdAt: Date;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  genres: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  creatorId: string;
  creatorName: string;
  episodeCount: number;
  subscriberCount: number;
  rating: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export interface Episode {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  thumbnail: string;
  panels: Panel[];
  publishedAt: Date;
  likes: number;
  comments: number;
  views: number;
  isLocked?: boolean;
}

export interface Panel {
  id: string;
  imageUrl: string;
  order: number;
  alt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  episodeId: string;
  content: string;
  likes: number;
  createdAt: Date;
  replies?: Comment[];
}

export interface Bookmark {
  id: string;
  userId: string;
  seriesId: string;
  lastReadEpisode: number;
  createdAt: Date;
}

export type Genre =
  | 'action'
  | 'romance'
  | 'fantasy'
  | 'comedy'
  | 'drama'
  | 'horror'
  | 'sci-fi'
  | 'slice-of-life'
  | 'thriller'
  | 'supernatural';

export const GENRES: { value: Genre; label: string; emoji: string }[] = [
  { value: 'action', label: 'Action', emoji: '⚔️' },
  { value: 'romance', label: 'Romance', emoji: '💕' },
  { value: 'fantasy', label: 'Fantasy', emoji: '🧙' },
  { value: 'comedy', label: 'Comedy', emoji: '😂' },
  { value: 'drama', label: 'Drama', emoji: '🎭' },
  { value: 'horror', label: 'Horror', emoji: '👻' },
  { value: 'sci-fi', label: 'Sci-Fi', emoji: '🚀' },
  { value: 'slice-of-life', label: 'Slice of Life', emoji: '☕' },
  { value: 'thriller', label: 'Thriller', emoji: '🔪' },
  { value: 'supernatural', label: 'Supernatural', emoji: '✨' },
];

// src/lib/types.ts
// Canonical types aligned to the Django REST Framework payloads.
// Strategy:
// - Keep backend field names as the source of truth (snake_case).
// - Allow UI-friendly aliases as optional fields (camelCase) so components can evolve without breaking.
// - Dates are ISO strings from API (not JS Date objects).

/* =========================
   USERS (API-dependent)
========================= */
export interface User {
  id: string | number;
  username: string;
  email?: string;

  // UI optional
  avatar?: string;
  role?: "reader" | "creator" | "admin";

  // API typically sends created_at; keep both optional
  created_at?: string;
  createdAt?: string;
}

/* =========================
   PANELS
========================= */
export interface Panel {
  id: string | number;

  // Backend serializer field:
  image: string; // media path or absolute url
  order: number;

  // UI aliases (optional)
  imageUrl?: string;
  alt?: string;
}

/* =========================
   EPISODES
========================= */
export interface Episode {
  id: string | number;

  // Backend serializer field:
  series: string | number; // FK id
  title: string;
  number: number;
  is_published: boolean;
  created_at: string; // ISO string
  panels: Panel[];

  /* ---- UI fields (optional / derived) ---- */
  seriesId?: string | number;

  // If you later add a published_at field in backend, plug it in.
  publishedAt?: string;

  thumbnail?: string;

  // Not currently returned by backend — keep optional so UI doesn't crash.
  likes?: number;
  comments?: number;
  views?: number;

  // If you want locking: derive from is_published or premium rules.
  isLocked?: boolean;
}

/* =========================
   SERIES
========================= */
export interface Series {
  id: string | number;

  // Backend serializer fields:
  creator: string | number; // user id
  title: string;
  description: string;
  cover: string | null; // media path or absolute url
  status: string; // backend currently: "ongoing" / etc
  created_at: string; // ISO string

  // SeriesDetailSerializer includes episodes:
  episodes?: Episode[];

  /* ---- UI fields (optional / derived) ---- */
  // Your UI expects these; we keep them optional so existing components can function
  // once you map backend -> UI.
  coverImage?: string;
  bannerImage?: string;

  genres?: string[];

  creatorId?: string | number;
  creatorName?: string;

  episodeCount?: number;
  subscriberCount?: number;
  rating?: number;
  views?: number;

  createdAt?: string;
  updatedAt?: string;

  isFeatured?: boolean;
  isTrending?: boolean;
}

/* =========================
   COMMENTS / BOOKMARKS (UI-only for now)
========================= */
export interface Comment {
  id: string | number;
  userId: string | number;
  username: string;
  userAvatar?: string;
  episodeId: string | number;
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface Bookmark {
  id: string | number;
  userId: string | number;
  seriesId: string | number;
  lastReadEpisode: number;
  createdAt: string;
}

/* =========================
   GENRES (UI-only)
========================= */
export type Genre =
  | "action"
  | "romance"
  | "fantasy"
  | "comedy"
  | "drama"
  | "horror"
  | "sci-fi"
  | "slice-of-life"
  | "thriller"
  | "supernatural";

export const GENRES: { value: Genre; label: string; emoji: string }[] = [
  { value: "action", label: "Action", emoji: "⚔️" },
  { value: "romance", label: "Romance", emoji: "💕" },
  { value: "fantasy", label: "Fantasy", emoji: "🧙" },
  { value: "comedy", label: "Comedy", emoji: "😂" },
  { value: "drama", label: "Drama", emoji: "🎭" },
  { value: "horror", label: "Horror", emoji: "👻" },
  { value: "sci-fi", label: "Sci-Fi", emoji: "🚀" },
  { value: "slice-of-life", label: "Slice of Life", emoji: "☕" },
  { value: "thriller", label: "Thriller", emoji: "🔪" },
  { value: "supernatural", label: "Supernatural", emoji: "✨" },
];
// src/lib/api/comics.ts
import { apiFetch, absolutizeMedia } from "@/lib/api/client";
import type { Series } from "@/lib/types";

/* =========================================================
   Minimal types for series detail + reading flow
========================================================= */
export type Panel = {
  id: number;
  order: number;
  imageUrl: string;
};

export type Episode = {
  id: number;
  number: number;
  title: string;
  is_published?: boolean;
  createdAt?: string;
  panels?: Panel[];
};

export type SeriesDetailResponse = {
  series: Series;
  episodes: Episode[];
};

/* =========================================================
   Normalizers (backend → frontend shape)
========================================================= */
function normalizeSeries(raw: any): Series {
  return {
    ...raw,

    coverImage: absolutizeMedia(raw?.coverImage ?? raw?.cover ?? raw?.cover_image),
    bannerImage: absolutizeMedia(raw?.bannerImage ?? raw?.banner ?? raw?.banner_image),

    genres: Array.isArray(raw?.genres) ? raw.genres : [],
    status: raw?.status ?? "ongoing",

    creatorName:
      raw?.creatorName ??
      raw?.creator_name ??
      raw?.creator?.username ??
      raw?.creator ??
      "",

    views: Number(raw?.views ?? 0),
    rating: Number(raw?.rating ?? 0),
    episodeCount: Number(raw?.episodeCount ?? raw?.episode_count ?? 0),
    subscriberCount: Number(raw?.subscriberCount ?? raw?.subscriber_count ?? 0),

    createdAt: raw?.createdAt ?? raw?.created_at ?? raw?.created ?? raw?.created_on,
  } as Series;
}

function normalizePanel(raw: any): Panel {
  return {
    id: Number(raw?.id),
    order: Number(raw?.order ?? 0),
    imageUrl: absolutizeMedia(raw?.imageUrl ?? raw?.image_url ?? raw?.image),
  };
}

function normalizeEpisode(raw: any): Episode {
  return {
    id: Number(raw?.id),
    number: Number(raw?.number ?? raw?.episode_number ?? 0),
    title: String(raw?.title ?? ""),
    is_published: raw?.is_published ?? raw?.published,
    createdAt: raw?.createdAt ?? raw?.created_at,
    panels: Array.isArray(raw?.panels) ? raw.panels.map(normalizePanel) : [],
  };
}

function unwrapList(data: any): any[] {
  // backend might return array directly OR paginated { results: [...] }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

/* =========================
   SERIES (PUBLIC)
========================= */
export async function listSeries(): Promise<Series[]> {
  const data = await apiFetch<any>("/series/", { method: "GET" });
  return unwrapList(data).map(normalizeSeries);
}

/**
 * Creator Studio only — requires auth.
 * Backend endpoint we added: /series/mine/
 */
export async function listMySeries(): Promise<Series[]> {
  const data = await apiFetch<any>("/series/mine/", { method: "GET" });
  return unwrapList(data).map(normalizeSeries);
}

/**
 * Your UI expects: { series, episodes }
 * Handles both shapes:
 *  A) { ...seriesFields, episodes: [...] }
 *  B) { series: {...}, episodes: [...] }
 */
export async function getSeriesDetail(seriesId: string | number): Promise<SeriesDetailResponse> {
  const data = await apiFetch<any>(`/series/${seriesId}/`, { method: "GET" });

  // Shape A
  if (data && typeof data === "object" && !data.series && Array.isArray(data.episodes)) {
    return {
      series: normalizeSeries(data),
      episodes: data.episodes.map(normalizeEpisode),
    };
  }

  // Shape B
  const rawSeries = data?.series ?? data;
  const rawEpisodes = Array.isArray(data?.episodes)
    ? data.episodes
    : Array.isArray(rawSeries?.episodes)
      ? rawSeries.episodes
      : [];

  return {
    series: normalizeSeries(rawSeries),
    episodes: rawEpisodes.map(normalizeEpisode),
  };
}

/** Public search */
export async function searchSeries(q: string): Promise<Series[]> {
  const qs = new URLSearchParams({ q }).toString();
  const data = await apiFetch<any>(`/series/search/?${qs}`, { method: "GET" });
  return unwrapList(data).map(normalizeSeries);
}

/* =========================
   EPISODES
========================= */
export type CreateEpisodeInput = {
  seriesId: number;
  title: string;
  number: number;
  publish?: boolean;
};

export async function createEpisode(payload: CreateEpisodeInput) {
  const body = {
    series: payload.seriesId,
    title: payload.title,
    number: payload.number,
    is_published: payload.publish ?? true,
  };

  return apiFetch<{ id: number }>("/episodes/", {
    method: "POST",
    json: body,
  });
}

/* =========================
   PANELS (bulk upload)
========================= */
export async function bulkUploadPanels(episodeId: number, files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("images", f)); // backend expects "images"

  return apiFetch(`/episodes/${episodeId}/panels/bulk-upload/`, {
    method: "POST",
    body: form,
  });
}
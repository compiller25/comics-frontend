// src/lib/api/novels.ts
import { apiFetch, absolutizeMedia } from "@/lib/api/client";

/* =========================================================
   Types (frontend-friendly)
========================================================= */
export type Chapter = {
  id: number;
  novel: number;
  title: string;
  number: number;
  pdfUrl: string;
  isPublished: boolean;
  createdAt?: string;
};

export type Novel = {
  id: number;
  creator: number;
  creatorName: string;
  title: string;
  description: string;
  coverImage: string;
  status?: "ongoing" | "complete";
  createdAt?: string;
  chapterCount?: number;
};

export type NovelDetailResponse = {
  novel: Novel;
  chapters: Chapter[];
};

/* =========================================================
   Normalizers (backend → frontend shape)
========================================================= */
function normalizeNovel(raw: any): Novel {
  return {
    id: Number(raw?.id),
    creator: Number(raw?.creator ?? 0),
    creatorName:
      String(
        raw?.creatorName ??
          raw?.creator_name ??
          raw?.creator?.username ??
          raw?.creator_username ??
          ""
      ) || "Creator",
    title: String(raw?.title ?? ""),
    description: String(raw?.description ?? ""),
    status: (raw?.status ?? "ongoing") as "ongoing" | "complete",
    coverImage: absolutizeMedia(raw?.coverImage ?? raw?.cover ?? raw?.cover_image),
    createdAt: raw?.createdAt ?? raw?.created_at ?? raw?.created,
    chapterCount: Number(raw?.chapterCount ?? raw?.chapter_count ?? 0),
  };
}

function normalizeChapter(raw: any): Chapter {
  return {
    id: Number(raw?.id),
    novel: Number(raw?.novel ?? 0),
    title: String(raw?.title ?? ""),
    number: Number(raw?.number ?? 0),
    pdfUrl: absolutizeMedia(raw?.pdfUrl ?? raw?.pdf_url ?? raw?.pdf),
    isPublished: Boolean(raw?.isPublished ?? raw?.is_published ?? raw?.published ?? false),
    createdAt: raw?.createdAt ?? raw?.created_at,
  };
}

function unwrapList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

/* =========================================================
   NOVELS (PUBLIC + CREATOR)
========================================================= */
export async function listNovels(): Promise<Novel[]> {
  const data = await apiFetch<any>("/novels/", { method: "GET" });
  return unwrapList(data).map(normalizeNovel);
}

/** Creator Studio — requires auth */
export async function listMyNovels(): Promise<Novel[]> {
  const data = await apiFetch<any>("/novels/mine/", { method: "GET" });
  return unwrapList(data).map(normalizeNovel);
}

/**
 * Detail endpoint returns:
 *   { novel: {...}, chapters: [...] }
 * but we also defensively support the “flat” shape.
 */
export async function getNovelDetail(novelId: string | number): Promise<NovelDetailResponse> {
  const data = await apiFetch<any>(`/novels/${novelId}/`, { method: "GET" });

  // Expected wrapper
  if (data?.novel && Array.isArray(data?.chapters)) {
    return {
      novel: normalizeNovel(data.novel),
      chapters: data.chapters.map(normalizeChapter),
    };
  }

  // Defensive fallback: flat + nested chapters
  const rawNovel = data?.novel ?? data;
  const rawChapters = Array.isArray(data?.chapters)
    ? data.chapters
    : Array.isArray(rawNovel?.chapters)
      ? rawNovel.chapters
      : [];

  return {
    novel: normalizeNovel(rawNovel),
    chapters: rawChapters.map(normalizeChapter),
  };
}

/* =========================================================
   CREATOR: Create Novel (multipart)
========================================================= */
export type CreateNovelInput = {
  title: string;
  description?: string;
  status?: "ongoing" | "complete";
  coverFile?: File | null;
};

export async function createNovel(payload: CreateNovelInput) {
  const fd = new FormData();
  fd.append("title", payload.title.trim());
  fd.append("description", (payload.description ?? "").trim());
  fd.append("status", payload.status ?? "ongoing");
  if (payload.coverFile) fd.append("cover", payload.coverFile);

  return apiFetch<{ id: number }>("/novels/", { method: "POST", body: fd });
}

/* =========================================================
   CHAPTERS
========================================================= */
export async function listNovelChapters(novelId: string | number): Promise<Chapter[]> {
  const data = await apiFetch<any>(`/novels/${novelId}/chapters/`, { method: "GET" });
  return unwrapList(data).map(normalizeChapter);
}

export type CreateChapterInput = {
  novelId: number;
  title: string;
  number: number;
  pdfFile: File;
  isPublished?: boolean; // draft/publish toggle
};

/**
 * Upload chapter PDF (multipart).
 * Backend uses:
 *   POST /novels/<novel_id>/chapters/
 * fields: title, number, pdf, is_published (optional)
 */
export async function createChapter(payload: CreateChapterInput) {
  const fd = new FormData();
  fd.append("title", payload.title.trim());
  fd.append("number", String(payload.number));
  fd.append("pdf", payload.pdfFile);
  if (typeof payload.isPublished === "boolean") {
    fd.append("is_published", payload.isPublished ? "true" : "false");
  }

  return apiFetch<Chapter>(`/novels/${payload.novelId}/chapters/`, {
    method: "POST",
    body: fd,
  });
}

/**
 * Optional: toggle publish via PATCH /chapters/<id>/
 * If you don’t need it yet, ignore.
 */
export async function setChapterPublished(chapterId: number, isPublished: boolean) {
  return apiFetch<Chapter>(`/chapters/${chapterId}/`, {
    method: "PATCH",
    json: { is_published: isPublished },
  });
}
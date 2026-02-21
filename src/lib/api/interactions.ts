import { apiFetch } from "@/lib/api/client";

export type CommentDTO = {
  id: number;
  episode: number;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
};

export async function listEpisodeComments(episodeId: number) {
  return apiFetch<CommentDTO[]>(`/episodes/${episodeId}/comments/`, { method: "GET" });
}

export async function postEpisodeComment(episodeId: number, text: string) {
  return apiFetch<CommentDTO>(`/episodes/${episodeId}/comments/`, {
    method: "POST",
    json: { text },
  });
}

export async function toggleEpisodeLike(episodeId: number) {
  return apiFetch<{ liked: boolean; likes: number }>(`/episodes/${episodeId}/like/`, {
    method: "POST",
  });
}

export async function toggleEpisodeBookmark(episodeId: number) {
  return apiFetch<{ bookmarked: boolean; bookmarks: number }>(`/episodes/${episodeId}/bookmark/`, {
    method: "POST",
  });
}

export async function getEpisodeSummary(episodeId: number) {
  return apiFetch<{
    likes: number;
    comments: number;
    bookmarks: number;
    liked: boolean;
    bookmarked: boolean;
  }>(`/episodes/${episodeId}/summary/`, { method: "GET" });
}
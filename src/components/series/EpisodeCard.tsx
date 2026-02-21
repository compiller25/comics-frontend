import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Eye, Lock, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import type { Episode } from "@/lib/types";
import { apiFetch } from "@/lib/api/client";

interface EpisodeCardProps {
  episode: Episode;
  seriesId: string | number;
  index?: number;
}

/**
 * Safely formats backend timestamps.
 * Backend sends `created_at` (string).
 * Frontend previously expected `publishedAt`.
 */
function safeTimeAgo(raw?: string | null) {
  if (!raw) return "Just now";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? "Just now" : formatDistanceToNow(d, { addSuffix: true });
}

export default function EpisodeCard({ episode, seriesId, index = 0 }: EpisodeCardProps) {
  const timeAgo = safeTimeAgo(
    (episode as any).created_at ?? (episode as any).createdAt ?? (episode as any).publishedAt ?? null
  );

  // Local UI state (keeps the card snappy)
  const [liked, setLiked] = useState<boolean>(Boolean((episode as any).liked));
  const [bookmarked, setBookmarked] = useState<boolean>(Boolean((episode as any).bookmarked));
  const [likesCount, setLikesCount] = useState<number>(Number((episode as any).likes ?? 0));
  const [busy, setBusy] = useState<{ like: boolean; bookmark: boolean }>({ like: false, bookmark: false });

  const episodeId = Number((episode as any).id);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!episodeId || busy.like) return;

    // optimistic update
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setBusy((b) => ({ ...b, like: true }));

    try {
      const res = await apiFetch<{ liked: boolean }>("/episodes/" + episodeId + "/like/", {
        method: "POST",
      });

      // server is source of truth for the boolean
      setLiked(Boolean(res?.liked));
    } catch {
      // rollback on failure
      setLiked((prev) => !prev);
      setLikesCount((c) => Math.max(0, c + (next ? -1 : 1)));
    } finally {
      setBusy((b) => ({ ...b, like: false }));
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!episodeId || busy.bookmark) return;

    const next = !bookmarked;
    setBookmarked(next);
    setBusy((b) => ({ ...b, bookmark: true }));

    try {
      const res = await apiFetch<{ bookmarked: boolean }>("/episodes/" + episodeId + "/bookmark/", {
        method: "POST",
      });
      setBookmarked(Boolean(res?.bookmarked));
    } catch {
      // rollback
      setBookmarked((prev) => !prev);
    } finally {
      setBusy((b) => ({ ...b, bookmark: false }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/series/${seriesId}/episode/${episode.number}`}
        className="group flex gap-4 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-all"
      >
        {/* Thumbnail */}
        <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          {episode.thumbnail ? (
            <img
              src={episode.thumbnail}
              alt={episode.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : null}

          {episode.isLocked && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
          )}

          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
            Ep. {episode.number}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium truncate group-hover:text-primary">
                Episode {episode.number}: {episode.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
            </div>

            {/* Actions (do NOT navigate) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={busy.like}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                  liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                } ${busy.like ? "opacity-60" : ""}`}
                aria-label={liked ? "Unlike" : "Like"}
                title={liked ? "Unlike" : "Like"}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={busy.bookmark}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                  bookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                } ${busy.bookmark ? "opacity-60" : ""}`}
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {episode.views ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {(episode as any).comments ?? 0}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
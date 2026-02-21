// src/pages/EpisodeReaderPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Heart,
  MessageCircle,
  Share2,
  ChevronUp,
  List,
  Bookmark,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

import { getSeriesDetail } from "@/lib/api/comics";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";

type PanelLike = {
  id: number | string;
  order: number;
  imageUrl?: string; // frontend field
  image?: string; // common DRF field
  image_url?: string; // sometimes snake_case
};

type CommentDTO = {
  id: number;
  episode: number;
  user_id?: number;
  username: string;
  text: string;
  created_at: string;
};

type SummaryDTO = {
  likes: number;
  comments: number;
  bookmarks: number;
  liked: boolean;
  bookmarked: boolean;
};

export default function EpisodeReaderPage() {
  const { id, episodeNum } = useParams<{ id: string; episodeNum: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const episodeNumber = Number.parseInt(episodeNum || "1", 10);

  const { data, isLoading, error, refetch } = useQuery({
    // ✅ FIX: isolate cache per series detail so panels don’t “bleed” across series
    queryKey: ["seriesDetail", String(id)],
    queryFn: () => getSeriesDetail(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const series = data?.series;
  const episodes = data?.episodes || [];

  const currentEpisode = useMemo(() => {
    return (episodes as any[]).find((e) => Number(e.number) === episodeNumber);
  }, [episodes, episodeNumber]);

  const episodeId = Number((currentEpisode as any)?.id || 0);

  // panels from backend
  const panels = useMemo<PanelLike[]>(() => {
    const raw = (currentEpisode?.panels || []) as PanelLike[];
    return raw.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [currentEpisode]);

  // prev/next based on actual episode numbers
  const sortedNumbers = useMemo<number[]>(() => {
    return (episodes as any[])
      .map((e) => Number(e.number))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
  }, [episodes]);

  const currentIndex = useMemo(() => {
    return sortedNumbers.indexOf(episodeNumber);
  }, [sortedNumbers, episodeNumber]);

  const hasPrevious = currentIndex > 0;
  const hasNext =
    currentIndex !== -1 && currentIndex < sortedNumbers.length - 1;

  const prevEpisodeNum = hasPrevious ? sortedNumbers[currentIndex - 1] : null;
  const nextEpisodeNum = hasNext ? sortedNumbers[currentIndex + 1] : null;

  const [isUIVisible, setIsUIVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [comment, setComment] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowScrollTop(scrollTop > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      setIsUIVisible(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setIsUIVisible(false), 3000);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goToPrevious = () => {
    if (prevEpisodeNum != null) {
      navigate(`/series/${id}/episode/${prevEpisodeNum}`);
      window.scrollTo({ top: 0 });
    }
  };

  const goToNext = () => {
    if (nextEpisodeNum != null) {
      navigate(`/series/${id}/episode/${nextEpisodeNum}`);
      window.scrollTo({ top: 0 });
    }
  };

  /* =====================================================
     REAL INTERACTIONS (summary + comments + mutations)
  ====================================================== */

  const summaryQuery = useQuery({
    queryKey: ["episodeSummary", episodeId],
    queryFn: () =>
      apiFetch<SummaryDTO>(`/episodes/${episodeId}/summary/`, {
        method: "GET",
      }),
    enabled: episodeId > 0,
    refetchInterval: 6000,
  });

  const commentsQuery = useQuery({
    queryKey: ["episodeComments", episodeId],
    queryFn: () =>
      apiFetch<CommentDTO[]>(`/episodes/${episodeId}/comments/`, {
        method: "GET",
      }),
    enabled: episodeId > 0,
    refetchInterval: 8000,
  });

  const liked = summaryQuery.data?.liked ?? false;
  const bookmarked = summaryQuery.data?.bookmarked ?? false;
  const likesCount = summaryQuery.data?.likes ?? 0;
  const commentsCount =
    summaryQuery.data?.comments ?? (commentsQuery.data?.length ?? 0);
  const bookmarksCount = summaryQuery.data?.bookmarks ?? 0;

  const postCommentMut = useMutation({
    mutationFn: (text: string) =>
      apiFetch<CommentDTO>(`/episodes/${episodeId}/comments/`, {
        method: "POST",
        json: { text },
      }),
    onSuccess: async () => {
      setComment("");
      await queryClient.invalidateQueries({
        queryKey: ["episodeComments", episodeId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["episodeSummary", episodeId],
      });
    },
  });

  const likeMut = useMutation({
    mutationFn: () =>
      apiFetch<{ liked: boolean; likes: number }>(
        `/episodes/${episodeId}/like/`,
        { method: "POST" }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["episodeSummary", episodeId],
      });
    },
  });

  const bookmarkMut = useMutation({
    mutationFn: () =>
      apiFetch<{ bookmarked: boolean; bookmarks: number }>(
        `/episodes/${episodeId}/bookmark/`,
        { method: "POST" }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["episodeSummary", episodeId],
      });
    },
  });

  /* =====================================================
     Loading / error states
  ====================================================== */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          Loading episode…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold mb-3">Failed to load episode</h1>
          <p className="text-muted-foreground mb-6">
            {(error as Error).message || "Something went wrong."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
            <Button asChild>
              <Link to="/browse">Browse Comics</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Series Not Found</h1>
          <Button asChild>
            <Link to="/browse">Browse Comics</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!currentEpisode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold mb-3">Episode Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This series doesn’t have Episode {episodeNumber} in the backend yet.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to={`/series/${id}`}>Back to Series</Link>
            </Button>
            <Button asChild>
              <Link to="/browse">Browse Comics</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" ref={containerRef}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Navigation */}
      <AnimatePresence>
        {isUIVisible && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-4"
          >
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-white hover:bg-white/20"
                >
                  <Link to={`/series/${id}`}>
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div className="text-white">
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {series.title}
                  </p>
                  <p className="text-xs text-white/70">
                    Episode {episodeNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Episode List */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <List className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Episodes</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto">
                      {sortedNumbers.length ? (
                        sortedNumbers.map((num) => (
                          <Button
                            key={num}
                            variant={
                              num === episodeNumber ? "secondary" : "ghost"
                            }
                            className="w-full justify-start"
                            onClick={() => {
                              navigate(`/series/${id}/episode/${num}`);
                              window.scrollTo({ top: 0 });
                            }}
                          >
                            Episode {num}
                          </Button>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No episodes yet.
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-white hover:bg-white/20"
                >
                  <Link to="/">
                    <Home className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Reader Content */}
      <div className="reader-container py-16">
        {panels.length > 0 ? (
          panels.map((panel, index) => {
            const panelSrc = panel.imageUrl || panel.image || panel.image_url || "";
            return (
              <motion.div
                // ✅ FIX: stable key across navigation to prevent React reusing wrong DOM node
                key={`${episodeId}-${panel.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.06 }}
                className="reader-panel"
              >
                <img
                  src={panelSrc}
                  alt={`Panel ${panel.order}`}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </motion.div>
            );
          })
        ) : (
          <div className="max-w-2xl mx-auto px-6 py-16 text-center text-white/80">
            <h3 className="text-xl font-bold mb-2">No panels uploaded yet</h3>
            <p className="text-white/60">
              This episode exists, but it doesn’t have any panel images in the
              backend.
            </p>
            <Button className="mt-6" variant="outline" asChild>
              <Link to={`/series/${id}`}>Back to Series</Link>
            </Button>
          </div>
        )}

        {/* Episode End */}
        <div className="bg-card text-card-foreground p-8 text-center mt-8 rounded-xl mx-4">
          <h3 className="text-xl font-bold mb-2">
            End of Episode {episodeNumber}
          </h3>
          <p className="text-muted-foreground mb-6">
            {hasNext
              ? "Continue to the next episode?"
              : "You’ve reached the latest episode!"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {hasPrevious && (
              <Button variant="outline" onClick={goToPrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            {hasNext && (
              <Button onClick={goToNext}>
                Next Episode
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to={`/series/${id}`}>View Series</Link>
            </Button>
          </div>
        </div>

        {/* Comments Section (REAL) */}
        <div className="bg-card text-card-foreground p-6 mt-8 rounded-xl mx-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({commentsCount})
          </h3>

          {/* Comment Input */}
          <div className="flex gap-3 mb-6">
            <Avatar className="w-10 h-10">
              <AvatarImage src={(user as any)?.avatar} />
              <AvatarFallback>
                {(user?.username?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                placeholder={isAuthenticated ? "Write a comment..." : "Login to comment..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-2"
                disabled={!isAuthenticated || postCommentMut.isPending}
              />
              <Button
                size="sm"
                disabled={
                  !isAuthenticated ||
                  !comment.trim() ||
                  postCommentMut.isPending ||
                  episodeId <= 0
                }
                onClick={() => postCommentMut.mutate(comment.trim())}
              >
                {postCommentMut.isPending ? "Posting..." : "Post Comment"}
              </Button>

              {postCommentMut.isError ? (
                <p className="text-sm text-red-500 mt-2">
                  {((postCommentMut.error as any)?.message as string) ||
                    "Failed to post comment."}
                </p>
              ) : null}
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {commentsQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading comments…</div>
            ) : commentsQuery.isError ? (
              <div className="text-sm text-red-500">
                {(commentsQuery.error as Error).message || "Failed to load comments."}
              </div>
            ) : (commentsQuery.data?.length || 0) === 0 ? (
              <div className="text-sm text-muted-foreground">
                No comments yet. Be the first.
              </div>
            ) : (
              commentsQuery.data!.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {(c.username?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{c.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <AnimatePresence>
        {isUIVisible && (
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-4"
          >
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasPrevious}
                onClick={goToPrevious}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>

              <div className="flex items-center gap-4">
                {/* LIKE */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!isAuthenticated || likeMut.isPending || episodeId <= 0}
                    onClick={() => likeMut.mutate()}
                    className={`text-white hover:bg-white/20 ${liked ? "text-red-500" : ""}`}
                    title={!isAuthenticated ? "Login to like" : "Like"}
                  >
                    <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                  </Button>
                  <span className="text-white/80 text-xs">{likesCount}</span>
                </div>

                {/* BOOKMARK */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!isAuthenticated || bookmarkMut.isPending || episodeId <= 0}
                    onClick={() => bookmarkMut.mutate()}
                    className={`text-white hover:bg-white/20 ${bookmarked ? "text-primary" : ""}`}
                    title={!isAuthenticated ? "Login to bookmark" : "Bookmark"}
                  >
                    <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
                  </Button>
                  <span className="text-white/80 text-xs">{bookmarksCount}</span>
                </div>

                {/* SHARE (UI only for now) */}
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={!hasNext}
                onClick={goToNext}
                className="text-white hover:bg-white/20"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
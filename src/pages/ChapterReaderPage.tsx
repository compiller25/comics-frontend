// src/pages/ChapterReaderPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  ChevronUp,
  List,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { getNovelDetail } from "@/lib/api/novels";
import type { Chapter } from "@/lib/api/novels";

export default function ChapterReaderPage() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();

  const novelIdNum = Number(id || 0);
  const chapterIdNum = Number(chapterId || 0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["novelDetail", String(id)],
    queryFn: () => getNovelDetail(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const novel = data?.novel;
  const chapters: Chapter[] = data?.chapters || [];

  const sortedChapters = useMemo(() => {
    return chapters
      .slice()
      .sort((a, b) => (a.number || 0) - (b.number || 0));
  }, [chapters]);

  const currentChapter = useMemo(() => {
    // prefer numeric id match
    const byId = sortedChapters.find((c) => Number(c.id) === chapterIdNum);
    if (byId) return byId;

    // fallback: if someone passed chapter "number" in URL
    const byNum = sortedChapters.find((c) => Number(c.number) === chapterIdNum);
    return byNum || null;
  }, [sortedChapters, chapterIdNum]);

  const currentIndex = useMemo(() => {
    if (!currentChapter) return -1;
    return sortedChapters.findIndex((c) => Number(c.id) === Number(currentChapter.id));
  }, [sortedChapters, currentChapter]);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < sortedChapters.length - 1;

  const prevChapter = hasPrevious ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = hasNext ? sortedChapters[currentIndex + 1] : null;

  const [isUIVisible, setIsUIVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      hideTimeoutRef.current = setTimeout(() => setIsUIVisible(false), 2500);
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
    if (!prevChapter) return;
    navigate(`/novels/${id}/chapters/${prevChapter.id}`);
    window.scrollTo({ top: 0 });
  };

  const goToNext = () => {
    if (!nextChapter) return;
    navigate(`/novels/${id}/chapters/${nextChapter.id}`);
    window.scrollTo({ top: 0 });
  };

  // PDF URL
  const pdfUrl = currentChapter?.pdfUrl || "";

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Loading chapter…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold mb-3">Failed to load chapter</h1>
          <p className="text-muted-foreground mb-6">
            {(error as Error).message || "Something went wrong."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
            <Button asChild>
              <Link to="/browse">Back to Browse</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Novel Not Found</h1>
          <Button asChild>
            <Link to="/browse">Back to Browse</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold mb-3">Chapter Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This novel doesn’t have that chapter in the backend yet.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to={`/novels/${id}`}>Back to Novel</Link>
            </Button>
            <Button asChild>
              <Link to="/browse">Back to Browse</Link>
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
        <motion.div className="h-full bg-primary" style={{ width: `${scrollProgress}%` }} />
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
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-white hover:bg-white/20"
                >
                  <Link to={`/novels/${id}`}>
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>

                <div className="text-white min-w-0">
                  <p className="text-sm font-medium truncate max-w-[240px]">
                    {novel.title}
                  </p>
                  <p className="text-xs text-white/70 truncate max-w-[240px]">
                    Chapter {currentChapter.number}: {currentChapter.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Chapter List */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <List className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Chapters</SheetTitle>
                    </SheetHeader>

                    <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto">
                      {sortedChapters.length ? (
                        sortedChapters.map((c) => (
                          <Button
                            key={c.id}
                            variant={Number(c.id) === Number(currentChapter.id) ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              navigate(`/novels/${id}/chapters/${c.id}`);
                              window.scrollTo({ top: 0 });
                            }}
                          >
                            Ch {c.number}: {c.title}
                          </Button>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No chapters yet.</div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>

                <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20">
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
      <div className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl overflow-hidden border bg-black">
            {/* PDF embed */}
            {pdfUrl ? (
              <div className="w-full">
                {/* Desktop-friendly height; mobile still scrolls */}
                <iframe
                  title={`Chapter ${currentChapter.number}`}
                  src={pdfUrl}
                  className="w-full"
                  style={{ height: "82vh" }}
                />
              </div>
            ) : (
              <div className="p-10 text-center text-white/80">
                <FileText className="w-10 h-10 mx-auto mb-3 text-white/60" />
                <h3 className="text-xl font-bold mb-2">No PDF attached</h3>
                <p className="text-white/60">
                  This chapter exists, but the PDF file is missing in the backend.
                </p>
              </div>
            )}
          </div>

          {/* Chapter actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-white/80 text-sm">
              Chapter {currentChapter.number} • {currentChapter.title}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-transparent text-white border-white/20 hover:bg-white/10"
                asChild
                disabled={!pdfUrl}
              >
                <a href={pdfUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </a>
              </Button>

              <Button
                variant="outline"
                className="bg-transparent text-white border-white/20 hover:bg-white/10"
                asChild
                disabled={!pdfUrl}
              >
                <a href={pdfUrl} download>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>

          {/* End of chapter */}
          <div className="bg-card text-card-foreground p-8 text-center mt-8 rounded-xl">
            <h3 className="text-xl font-bold mb-2">
              End of Chapter {currentChapter.number}
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasNext ? "Continue to the next chapter?" : "You’ve reached the latest chapter!"}
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
                  Next Chapter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              <Button variant="outline" asChild>
                <Link to={`/novels/${id}`}>View Novel</Link>
              </Button>
            </div>
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
            <div className="flex items-center justify-between max-w-5xl mx-auto">
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

              <div className="flex items-center gap-2 text-white/80 text-xs">
                <FileText className="w-4 h-4" />
                <span>
                  Ch {currentChapter.number} / {sortedChapters.length || "—"}
                </span>
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
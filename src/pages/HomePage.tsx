// src/pages/HomePage.tsx
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import SeriesCard from "@/components/series/SeriesCard";
import NovelCard from "@/components/novels/NovelCard";
import { Button } from "@/components/ui/button";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listSeries, getSeriesDetail } from "@/lib/api/comics";
import { listNovels, getNovelDetail } from "@/lib/api/novels";

import type { Series } from "@/lib/types";
import type { Novel } from "@/lib/api/novels";

type HeroItem =
  | { kind: "comic"; data: Series }
  | { kind: "novel"; data: Novel };

function safeTime(obj: any): number {
  const raw =
    obj?.updatedAt ??
    obj?.updated_at ??
    obj?.createdAt ??
    obj?.created_at ??
    obj?.created_on ??
    obj?.created;
  const t = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function normalizeStatus(st: any): string {
  // unify "completed" vs "complete"
  if (st === "completed") return "complete";
  return String(st ?? "");
}

/**
 * Netflix-style horizontal row with buttons.
 * Keeps DOM lighter than huge grids and feels premium.
 */
function Row({
  title,
  subtitle,
  icon,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(320, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon ? (
              <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0">
              <h2 className="text-2xl font-bold truncate">{title}</h2>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="icon" onClick={() => scrollBy(-1)} title="Scroll left">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scrollBy(1)} title="Scroll right">
              <ChevronRight className="w-5 h-5" />
            </Button>

            {actionHref ? (
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to={actionHref}>
                  {actionLabel || "View All"} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory hide-scrollbar"
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const queryClient = useQueryClient();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // COMICS
  const { data: series = [], isLoading: comicsLoading } = useQuery({
    queryKey: ["series"],
    queryFn: listSeries,
  });

  // NOVELS
  const { data: novels = [], isLoading: novelsLoading } = useQuery({
    queryKey: ["novels-public"],
    queryFn: listNovels,
  });

  const isLoading = comicsLoading || novelsLoading;

  const {
    hero,
    trendingComics,
    trendingNovels,
    latestMixed,
    topRatedComics,
    featuredList,
  } = useMemo(() => {
    const allSeries = (series || []) as Series[];
    const allNovels = (novels || []) as Novel[];

    // ---------- Featured (Mixed) ----------
    const featuredComics = [...allSeries].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);

    // For novels we don’t have rating, so “featured” = most chapters (proxy for popularity)
    const featuredNovels = [...allNovels]
      .sort((a, b) => Number(b.chapterCount || 0) - Number(a.chapterCount || 0))
      .slice(0, 2);

    const featured: HeroItem[] = [
      ...featuredComics.map((s) => ({ kind: "comic" as const, data: s })),
      ...featuredNovels.map((n) => ({ kind: "novel" as const, data: n })),
    ].slice(0, 5);

    // ---------- Trending ----------
    const trendingC = [...allSeries]
      .sort((a, b) => (Boolean((b as any).isTrending) ? 1 : 0) - (Boolean((a as any).isTrending) ? 1 : 0))
      .slice(0, 12);

    const trendingN = [...allNovels]
      .sort((a, b) => Number(b.chapterCount || 0) - Number(a.chapterCount || 0))
      .slice(0, 12);

    // ---------- Latest Mixed ----------
    const mixed: HeroItem[] = [
      ...allSeries.map((s) => ({ kind: "comic" as const, data: s })),
      ...allNovels.map((n) => ({ kind: "novel" as const, data: n })),
    ];

    const latest = mixed
      .sort((a, b) => safeTime(b.data) - safeTime(a.data))
      .slice(0, 18);

    // ---------- Top Rated Comics ----------
    const topRated = [...allSeries].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);

    const heroItem = featured.length ? featured : [];

    return {
      featuredList: featured,
      hero: heroItem,
      trendingComics: trendingC,
      trendingNovels: trendingN,
      latestMixed: latest,
      topRatedComics: topRated,
    };
  }, [series, novels]);

  const current = hero[featuredIndex]?.data;
  const currentKind = hero[featuredIndex]?.kind;

  const nextFeatured = () => {
    if (!hero.length) return;
    setFeaturedIndex((prev) => (prev + 1) % hero.length);
  };

  const prevFeatured = () => {
    if (!hero.length) return;
    setFeaturedIndex((prev) => (prev - 1 + hero.length) % hero.length);
  };

  // Prefetch on hover → instant-feel navigation
  const prefetchComic = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: ["seriesDetail", String(id)],
      queryFn: () => getSeriesDetail(String(id)),
      staleTime: 30_000,
    });
  };

  const prefetchNovel = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: ["novel", String(id)],
      queryFn: () => getNovelDetail(String(id)),
      staleTime: 30_000,
    });
  };

  // Hero background: comics use banner/cover; novels use cover
  const heroImage =
    currentKind === "comic"
      ? ((current as any)?.bannerImage || (current as any)?.coverImage || "")
      : ((current as any)?.coverImage || "");

  const heroTitle = (current as any)?.title || "HADITHI TUBE";
  const heroDesc = (current as any)?.description || "";

  const heroStatus = normalizeStatus((current as any)?.status || "ongoing");

  const heroHref =
    currentKind === "comic"
      ? `/series/${(current as any)?.id}`
      : `/novels/${(current as any)?.id}`;

  const heroPrimaryLabel = currentKind === "comic" ? "Start Reading" : "Open Novel";

  return (
    <Layout>
      {/* HERO (Mixed) */}
      <section className="relative">
        <div className="relative h-[72vh] min-h-[520px] max-h-[760px] overflow-hidden">
          <motion.div
            key={featuredIndex}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {heroImage ? (
              <img src={heroImage} alt={heroTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary/40" />
            )}

            {/* cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          </motion.div>

          <div className="container mx-auto px-4 relative h-full flex items-center">
            <motion.div
              key={featuredIndex}
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="max-w-2xl"
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  Featured
                </span>

                {currentKind ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-foreground text-sm">
                    {currentKind === "comic" ? "Comic" : "Novel"}
                  </span>
                ) : null}

                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-foreground text-sm">
                  {heroStatus}
                </span>
              </div>

              {/* Brand */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-balance">
                HADITHI TUBE
              </h1>

              {isLoading ? (
                <p className="text-muted-foreground">Loading…</p>
              ) : current ? (
                <>
                  <p className="text-xl font-semibold mb-2">{heroTitle}</p>
                  <p className="text-lg text-muted-foreground mb-6 line-clamp-3">{heroDesc || "—"}</p>

                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" asChild>
                      <Link to={heroHref}>
                        {heroPrimaryLabel}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/browse">Browse Library</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No content yet. Add comics/novels in Creator Studio.
                </p>
              )}
            </motion.div>
          </div>

          {/* Hero controls */}
          <div className="absolute bottom-8 right-8 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevFeatured}
              className="bg-background/50 backdrop-blur-sm"
              disabled={!hero.length}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium px-3">
              {hero.length ? featuredIndex + 1 : 0} / {hero.length || 0}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextFeatured}
              className="bg-background/50 backdrop-blur-sm"
              disabled={!hero.length}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* TRENDING COMICS (Row) */}
      <Row
        title="Trending Comics"
        subtitle="What everyone’s reading right now"
        icon={<TrendingUp className="w-5 h-5" />}
        actionHref="/browse?content=comics&sort=trending"
        actionLabel="View All"
      >
        {trendingComics.map((s, index) => (
          <div
            key={`comic-${s.id}`}
            className="snap-start w-[160px] sm:w-[180px] md:w-[200px] shrink-0"
            onMouseEnter={() => prefetchComic(Number(s.id))}
            onTouchStart={() => prefetchComic(Number(s.id))}
          >
            <SeriesCard series={s} index={index} />
          </div>
        ))}
      </Row>

      {/* TRENDING NOVELS (Row) */}
      <Row
        title="Trending Novels"
        subtitle="Binge-worthy PDF chapters"
        icon={<BookOpen className="w-5 h-5" />}
        actionHref="/browse?content=novels&sort=popular"
        actionLabel="View All"
      >
        {trendingNovels.map((n, index) => (
          <div
            key={`novel-${n.id}`}
            className="snap-start w-[160px] sm:w-[180px] md:w-[200px] shrink-0"
            onMouseEnter={() => prefetchNovel(Number(n.id))}
            onTouchStart={() => prefetchNovel(Number(n.id))}
          >
            <NovelCard novel={n} index={index} />
          </div>
        ))}
      </Row>

      {/* LATEST DROPS (Mixed Row) */}
      <section className="py-10 bg-secondary/30">
        <Row
          title="Latest Drops"
          subtitle="Fresh uploads from creators"
          icon={<Clock className="w-5 h-5" />}
          actionHref="/browse?sort=latest&content=all"
          actionLabel="View All"
        >
          {latestMixed.map((item, index) => {
            if (item.kind === "comic") {
              const s = item.data as Series;
              return (
                <div
                  key={`latest-comic-${s.id}`}
                  className="snap-start w-[160px] sm:w-[180px] md:w-[200px] shrink-0"
                  onMouseEnter={() => prefetchComic(Number(s.id))}
                  onTouchStart={() => prefetchComic(Number(s.id))}
                >
                  <SeriesCard series={s} index={index} />
                </div>
              );
            }
            const n = item.data as Novel;
            return (
              <div
                key={`latest-novel-${n.id}`}
                className="snap-start w-[160px] sm:w-[180px] md:w-[200px] shrink-0"
                onMouseEnter={() => prefetchNovel(Number(n.id))}
                onTouchStart={() => prefetchNovel(Number(n.id))}
              >
                <NovelCard novel={n} index={index} />
              </div>
            );
          })}
        </Row>
      </section>

      {/* TOP RATED COMICS */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Top Rated Comics</h2>
                <p className="text-sm text-muted-foreground">Reader favorites</p>
              </div>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/browse?content=comics&sort=rating">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRatedComics.map((s, index) => (
              <div
                key={s.id}
                onMouseEnter={() => prefetchComic(Number(s.id))}
                onTouchStart={() => prefetchComic(Number(s.id))}
              >
                <SeriesCard series={s} variant="featured" index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Build Your Universe</h2>
            <p className="text-muted-foreground mb-8">
              Publish comics (panels) and novels (PDF chapters) from Creator Studio.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/creator">
                  Start Creating <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/browse">Explore Library</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
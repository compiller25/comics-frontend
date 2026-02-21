// src/pages/SeriesDetailPage.tsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookmarkPlus,
  Share2,
  Star,
  Eye,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import Layout from "@/components/layout/Layout";
import EpisodeCard from "@/components/series/EpisodeCard";
import SeriesCard from "@/components/series/SeriesCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getSeriesDetail } from "@/lib/api/comics";

export default function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    // ✅ FIX: isolate detail cache from list cache so panels don’t “bleed” across series
    queryKey: ["seriesDetail", String(id)],
    queryFn: () => getSeriesDetail(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const series = data?.series;
  const episodes = useMemo(() => (data?.episodes ? [...data.episodes] : []), [data?.episodes]);

  // Make start episode deterministic: lowest episode number
  const startEpisodeNum = useMemo(() => {
    if (!episodes.length) return 1;
    const nums = episodes
      .map((e: any) => Number(e?.number))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b);
    return nums[0] ?? 1;
  }, [episodes]);

  const formatNumber = (num: number): string => {
    const n = Number(num || 0);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  // Similar not supported yet
  const similarSeries: any[] = [];

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading series…
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-3">Failed to load series</h1>
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
      </Layout>
    );
  }

  if (!series) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Series Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The series you're looking for doesn't exist (or the API response shape is wrong).
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
      </Layout>
    );
  }

  // createdAt can be null; don’t crash date-fns
  const createdAtLabel = (() => {
    const raw = (series as any).createdAt;
    const d = raw ? new Date(raw) : null;
    return d && !Number.isNaN(d.getTime()) ? format(d, "MMM yyyy") : "—";
  })();

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative h-[300px] md:h-[400px]">
        <img
          src={series.bannerImage || series.coverImage}
          alt={series.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Button variant="outline" size="sm" asChild className="bg-background/50 backdrop-blur-sm">
            <Link to="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Cover Image */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0">
            <img
              src={series.coverImage}
              alt={series.title}
              className="w-40 md:w-52 h-auto rounded-xl shadow-elevated mx-auto md:mx-0"
            />
          </motion.div>

          {/* Series Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 text-center md:text-left"
          >
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
              {(series.genres || []).map((genre: string) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
              <Badge variant={series.status === "ongoing" ? "default" : "outline"}>{series.status}</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{series.title}</h1>
            <p className="text-muted-foreground mb-4">by {series.creatorName || "Creator"}</p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6 text-sm">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {series.rating || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-muted-foreground" />
                {formatNumber(series.views || 0)} views
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                {formatNumber((series as any).subscriberCount || 0)} subscribers
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {createdAtLabel}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
              <Button size="lg" asChild>
                <Link to={`/series/${series.id}/episode/${startEpisodeNum}`}>Start Reading</Link>
              </Button>

              <Button
                size="lg"
                variant={isSubscribed ? "secondary" : "outline"}
                onClick={() => setIsSubscribed((v) => !v)}
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>

              <Button size="lg" variant="outline" type="button">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Description */}
            <div className="bg-card rounded-xl p-4">
              <p className={`text-muted-foreground ${!isDescriptionExpanded ? "line-clamp-3" : ""}`}>
                {series.description}
              </p>
              {series.description?.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDescriptionExpanded((v) => !v)}
                  className="mt-2"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Read More
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="episodes" className="mt-8">
          <TabsList>
            <TabsTrigger value="episodes">
              Episodes ({episodes.length || (series as any).episodeCount || 0})
            </TabsTrigger>
            <TabsTrigger value="similar">Similar</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="mt-6">
            {episodes.length > 0 ? (
              <div className="space-y-2">
                {episodes
                  .slice()
                  .sort((a: any, b: any) => Number(b.number) - Number(a.number))
                  .map((episode: any, index: number) => (
                    <EpisodeCard
                      key={`${series.id}-${episode.id ?? episode.number}`} // ✅ extra safe key
                      episode={episode}
                      seriesId={series.id}
                      index={index}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl">
                <p className="text-muted-foreground">No episodes yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="similar" className="mt-6">
            {similarSeries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {similarSeries.map((s: any, index: number) => (
                  <SeriesCard key={s.id} series={s} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Similar recommendations will appear here later.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
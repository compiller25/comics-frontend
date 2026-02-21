import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Star, BookOpen } from "lucide-react";
import type { Series } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface SeriesCardProps {
  series: Series;
  variant?: "default" | "featured" | "compact";
  index?: number;
}

export default function SeriesCard({ series, variant = "default", index = 0 }: SeriesCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  // ✅ Defensive normalization (backend can omit fields)
  const id = series?.id ?? "";
  const title = String(series?.title ?? "Untitled");
  const description = String(series?.description ?? "");
  const creatorName = String((series as any)?.creatorName ?? (series as any)?.creator ?? "Unknown");
  const coverImage = String((series as any)?.coverImage ?? (series as any)?.cover ?? "");
  const bannerImage = String((series as any)?.bannerImage ?? "");
  const isTrending = Boolean((series as any)?.isTrending);

  const views = Number.isFinite(Number((series as any)?.views)) ? Number((series as any)?.views) : 0;
  const rating = Number.isFinite(Number((series as any)?.rating)) ? Number((series as any)?.rating) : 0;
  const episodeCount = Number.isFinite(Number((series as any)?.episodeCount))
    ? Number((series as any)?.episodeCount)
    : 0;

  const genres = Array.isArray((series as any)?.genres) ? ((series as any).genres as string[]) : [];

  // Fallback image to prevent broken layout (you can replace with your own local placeholder)
  const safeCover =
    coverImage ||
    bannerImage ||
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=1200&fit=crop";

  if (variant === "featured") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
        <Link
          to={`/series/${id}`}
          className="group block relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden card-hover"
        >
          <img
            src={safeCover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="series-overlay" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex flex-wrap gap-2 mb-3">
              {genres.slice(0, 2).map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="bg-primary/20 text-primary-foreground backdrop-blur-sm"
                >
                  {genre}
                </Badge>
              ))}
              {isTrending && <Badge className="bg-orange-500/90 text-white">🔥 Trending</Badge>}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/80 text-sm line-clamp-2 mb-3">{description}</p>

            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatNumber(views)}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {rating}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {episodeCount} Eps
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
        <Link to={`/series/${id}`} className="group flex gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <img src={safeCover} alt={title} className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
          <div className="flex flex-col justify-center min-w-0">
            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-xs text-muted-foreground">{creatorName}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {rating}
              </span>
              <span>{episodeCount} eps</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Link to={`/series/${id}`} className="group block rounded-xl overflow-hidden bg-card card-hover">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={safeCover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="series-overlay opacity-0 group-hover:opacity-100 transition-opacity" />

          {isTrending && (
            <Badge className="absolute top-2 right-2 bg-orange-500/90 text-white">🔥 Trending</Badge>
          )}

          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 2).map((genre) => (
                <span key={genre} className="genre-tag text-[10px] bg-black/50 text-white">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{creatorName}</p>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {rating}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(views)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
// src/components/novels/NovelCard.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Book } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Novel } from "@/lib/api/novels";

type Props = {
  novel: Novel;
  index?: number;
  variant?: "default" | "compact";
};

export default function NovelCard({ novel, index = 0, variant = "default" }: Props) {
  const cover = (novel.coverImage || "").trim();
  const status = novel.status || "ongoing";
  const chapters = Number(novel.chapterCount || 0);

  // A “premium” fallback cover so empty covers don’t look cheap
  const FallbackCover = () => (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-muted to-background" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-black/25 border border-white/10 backdrop-blur-sm flex items-center justify-center">
          <Book className="w-7 h-7 text-white/90" />
        </div>
      </div>
    </div>
  );

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="group"
      >
        <Link to={`/novels/${novel.id}`} className="block">
          <div className="rounded-xl border bg-card overflow-hidden transition-all group-hover:shadow-md group-hover:-translate-y-[1px]">
            <div className="p-3 flex gap-3">
              <div className="w-16 h-24 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                {cover ? (
                  <img
                    src={cover}
                    alt={novel.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <FallbackCover />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold truncate">{novel.title}</p>
                  <Badge variant={status === "complete" ? "secondary" : "default"} className="shrink-0">
                    {status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {novel.creatorName || "Creator"} • {chapters} chapter{chapters === 1 ? "" : "s"}
                </p>

                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {novel.description || "—"}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // default (grid) variant — “poster” vibe like SeriesCard
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group"
    >
      <Link to={`/novels/${novel.id}`} className="block">
        <div className="rounded-2xl border bg-card overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
          {/* Cover */}
          <div className="relative aspect-[2/3] bg-muted overflow-hidden">
            {cover ? (
              <img
                src={cover}
                alt={novel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                loading="lazy"
              />
            ) : (
              <FallbackCover />
            )}

            {/* cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/30 to-transparent" />

            {/* badges */}
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge className="backdrop-blur-sm bg-black/40 text-white border-white/10">
                {status}
              </Badge>
            </div>

            <div className="absolute top-2 right-2">
              <Badge className="backdrop-blur-sm bg-black/40 text-white border-white/10">
                {chapters} ch
              </Badge>
            </div>

            {/* bottom meta */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white font-semibold leading-tight line-clamp-2 drop-shadow">
                {novel.title}
              </p>
              <p className="text-white/70 text-xs mt-1 line-clamp-1">
                {novel.creatorName || "Creator"}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {novel.description || "—"}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
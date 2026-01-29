import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Star, BookOpen } from 'lucide-react';
import { Series } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface SeriesCardProps {
  series: Series;
  variant?: 'default' | 'featured' | 'compact';
  index?: number;
}

export default function SeriesCard({ series, variant = 'default', index = 0 }: SeriesCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link
          to={`/series/${series.id}`}
          className="group block relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden card-hover"
        >
          <img
            src={series.coverImage}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="series-overlay" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex flex-wrap gap-2 mb-3">
              {series.genres.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="secondary" className="bg-primary/20 text-primary-foreground backdrop-blur-sm">
                  {genre}
                </Badge>
              ))}
              {series.isTrending && (
                <Badge className="bg-orange-500/90 text-white">🔥 Trending</Badge>
              )}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{series.title}</h3>
            <p className="text-white/80 text-sm line-clamp-2 mb-3">{series.description}</p>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatNumber(series.views)}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {series.rating}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {series.episodeCount} Eps
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link
          to={`/series/${series.id}`}
          className="group flex gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <img
            src={series.coverImage}
            alt={series.title}
            className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex flex-col justify-center min-w-0">
            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {series.title}
            </h4>
            <p className="text-xs text-muted-foreground">{series.creatorName}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {series.rating}
              </span>
              <span>{series.episodeCount} eps</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={`/series/${series.id}`}
        className="group block rounded-xl overflow-hidden bg-card card-hover"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={series.coverImage}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="series-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
          {series.isTrending && (
            <Badge className="absolute top-2 right-2 bg-orange-500/90 text-white">
              🔥 Trending
            </Badge>
          )}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-wrap gap-1">
              {series.genres.slice(0, 2).map((genre) => (
                <span key={genre} className="genre-tag text-[10px] bg-black/50 text-white">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {series.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{series.creatorName}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {series.rating}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(series.views)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

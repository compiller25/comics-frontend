import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Eye, Lock } from 'lucide-react';
import { Episode } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface EpisodeCardProps {
  episode: Episode;
  seriesId: string;
  index?: number;
}

export default function EpisodeCard({ episode, seriesId, index = 0 }: EpisodeCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/series/${seriesId}/episode/${episode.number}`}
        className="group flex gap-4 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-all duration-200"
      >
        {/* Thumbnail */}
        <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={episode.thumbnail}
            alt={episode.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
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
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                Episode {episode.number}: {episode.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(episode.publishedAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(episode.views)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(episode.likes)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {formatNumber(episode.comments)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

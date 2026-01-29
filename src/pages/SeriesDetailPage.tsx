import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  BookmarkPlus, 
  Share2, 
  Star, 
  Eye, 
  Users, 
  Calendar, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import EpisodeCard from '@/components/series/EpisodeCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSeriesById, getEpisodesBySeries, mockSeries } from '@/lib/mockData';
import { formatDistanceToNow, format } from 'date-fns';
import SeriesCard from '@/components/series/SeriesCard';

export default function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const series = getSeriesById(id || '');
  const episodes = getEpisodesBySeries(id || '');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!series) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Series Not Found</h1>
          <p className="text-muted-foreground mb-8">The series you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/browse">Browse Comics</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const similarSeries = mockSeries
    .filter((s) => s.id !== series.id && s.genres.some((g) => series.genres.includes(g)))
    .slice(0, 4);

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0"
          >
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
              {series.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
              <Badge variant={series.status === 'ongoing' ? 'default' : 'outline'}>
                {series.status}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{series.title}</h1>
            <p className="text-muted-foreground mb-4">by {series.creatorName}</p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6 text-sm">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {series.rating}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-muted-foreground" />
                {formatNumber(series.views)} views
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                {formatNumber(series.subscriberCount)} subscribers
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {format(new Date(series.createdAt), 'MMM yyyy')}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
              <Button size="lg" asChild>
                <Link to={`/series/${series.id}/episode/1`}>
                  Start Reading
                </Link>
              </Button>
              <Button
                size="lg"
                variant={isSubscribed ? 'secondary' : 'outline'}
                onClick={() => setIsSubscribed(!isSubscribed)}
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Description */}
            <div className="bg-card rounded-xl p-4">
              <p className={`text-muted-foreground ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                {series.description}
              </p>
              {series.description.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
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
              Episodes ({episodes.length || series.episodeCount})
            </TabsTrigger>
            <TabsTrigger value="similar">Similar</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="mt-6">
            {episodes.length > 0 ? (
              <div className="space-y-2">
                {episodes.map((episode, index) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    seriesId={series.id}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl">
                <p className="text-muted-foreground">
                  {series.episodeCount} episodes available
                </p>
                <Button className="mt-4" asChild>
                  <Link to={`/series/${series.id}/episode/1`}>Start Reading</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="similar" className="mt-6">
            {similarSeries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {similarSeries.map((s, index) => (
                  <SeriesCard key={s.id} series={s} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No similar series found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

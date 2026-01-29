import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Heart, 
  MessageCircle, 
  Share2, 
  Settings, 
  ChevronUp,
  X,
  Menu,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSeriesById, getEpisodesBySeries, mockComments } from '@/lib/mockData';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';

export default function EpisodeReaderPage() {
  const { id, episodeNum } = useParams<{ id: string; episodeNum: string }>();
  const navigate = useNavigate();
  const series = getSeriesById(id || '');
  const episodes = getEpisodesBySeries(id || '');
  const currentEpisode = episodes.find((e) => e.number === parseInt(episodeNum || '1'));
  
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [comment, setComment] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock panels if episode not found
  const panels = currentEpisode?.panels || [
    { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=1200&fit=crop', order: 1 },
    { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=1100&fit=crop', order: 2 },
    { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=800&h=1000&fit=crop', order: 3 },
    { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop', order: 4 },
    { id: 'p5', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=900&fit=crop', order: 5 },
  ];

  const episodeNumber = parseInt(episodeNum || '1');
  const hasPrevious = episodeNumber > 1;
  const hasNext = episodeNumber < (series?.episodeCount || 1);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
      setShowScrollTop(scrollTop > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsUIVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setIsUIVisible(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevious = () => {
    if (hasPrevious) {
      navigate(`/series/${id}/episode/${episodeNumber - 1}`);
      window.scrollTo({ top: 0 });
    }
  };

  const goToNext = () => {
    if (hasNext) {
      navigate(`/series/${id}/episode/${episodeNumber + 1}`);
      window.scrollTo({ top: 0 });
    }
  };

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Episode Not Found</h1>
          <Button asChild>
            <Link to="/browse">Browse Comics</Link>
          </Button>
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
                <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20">
                  <Link to={`/series/${id}`}>
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div className="text-white">
                  <p className="text-sm font-medium truncate max-w-[200px]">{series.title}</p>
                  <p className="text-xs text-white/70">Episode {episodeNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Episode List */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <List className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Episodes</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto">
                      {Array.from({ length: series.episodeCount }, (_, i) => i + 1).map((num) => (
                        <Button
                          key={num}
                          variant={num === episodeNumber ? 'secondary' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => {
                            navigate(`/series/${id}/episode/${num}`);
                            window.scrollTo({ top: 0 });
                          }}
                        >
                          Episode {num}
                        </Button>
                      ))}
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
      <div className="reader-container py-16">
        {panels.map((panel, index) => (
          <motion.div
            key={panel.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="reader-panel"
          >
            <img
              src={panel.imageUrl}
              alt={panel.alt || `Panel ${panel.order}`}
              className="w-full h-auto"
              loading="lazy"
            />
          </motion.div>
        ))}

        {/* Episode End */}
        <div className="bg-card text-card-foreground p-8 text-center mt-8 rounded-xl mx-4">
          <h3 className="text-xl font-bold mb-2">End of Episode {episodeNumber}</h3>
          <p className="text-muted-foreground mb-6">
            {hasNext ? 'Continue to the next episode?' : 'You\'ve reached the latest episode!'}
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

        {/* Comments Section */}
        <div className="bg-card text-card-foreground p-6 mt-8 rounded-xl mx-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({mockComments.length})
          </h3>

          {/* Comment Input */}
          <div className="flex gap-3 mb-6">
            <Avatar className="w-10 h-10">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-2"
              />
              <Button size="sm" disabled={!comment.trim()}>
                Post Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {mockComments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={c.userAvatar} />
                  <AvatarFallback>{c.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{c.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.content}</p>
                  <button className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground">
                    <Heart className="w-3 h-3" />
                    {c.likes}
                  </button>
                </div>
              </div>
            ))}
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`text-white hover:bg-white/20 ${isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SeriesCard from '@/components/series/SeriesCard';
import { Button } from '@/components/ui/button';
import { getFeaturedSeries, getTrendingSeries, getLatestSeries, mockSeries } from '@/lib/mockData';

export default function HomePage() {
  const featured = getFeaturedSeries();
  const trending = getTrendingSeries();
  const latest = getLatestSeries().slice(0, 8);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featured.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  return (
    <Layout>
      {/* Hero Section with Featured */}
      <section className="relative">
        <div className="relative h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden">
          {/* Background Image */}
          <motion.div
            key={featuredIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img
              src={featured[featuredIndex]?.bannerImage || featured[featuredIndex]?.coverImage}
              alt={featured[featuredIndex]?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          </motion.div>

          {/* Content */}
          <div className="container mx-auto px-4 relative h-full flex items-center">
            <motion.div
              key={featuredIndex}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
                <Star className="w-4 h-4 fill-current" />
                Featured Series
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance">
                {featured[featuredIndex]?.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6 line-clamp-3">
                {featured[featuredIndex]?.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {featured[featuredIndex]?.genres.map((genre) => (
                  <span key={genre} className="genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Button size="lg" asChild>
                  <Link to={`/series/${featured[featuredIndex]?.id}`}>
                    Start Reading
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to={`/series/${featured[featuredIndex]?.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute bottom-8 right-8 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevFeatured}
              className="bg-background/50 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium px-3">
              {featuredIndex + 1} / {featured.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextFeatured}
              className="bg-background/50 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Trending Now</h2>
                <p className="text-sm text-muted-foreground">What everyone's reading</p>
              </div>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/browse?sort=trending">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trending.map((series, index) => (
              <SeriesCard key={series.id} series={series} index={index} />
            ))}
            {/* Fill remaining spots with other popular series */}
            {mockSeries.slice(0, 5 - trending.length).map((series, index) => (
              <SeriesCard key={series.id} series={series} index={trending.length + index} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Latest Updates</h2>
                <p className="text-sm text-muted-foreground">Fresh episodes just dropped</p>
              </div>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/browse?sort=latest">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {latest.map((series, index) => (
              <SeriesCard key={series.id} series={series} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Top Rated</h2>
                <p className="text-sm text-muted-foreground">Reader favorites</p>
              </div>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/browse?sort=rating">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...mockSeries]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map((series, index) => (
                <SeriesCard key={series.id} series={series} variant="featured" index={index} />
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Your Own Story?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of creators sharing their webcomics with millions of readers worldwide.
            </p>
            <Button size="lg" asChild>
              <Link to="/creator">
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

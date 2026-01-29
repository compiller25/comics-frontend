import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SeriesCard from '@/components/series/SeriesCard';
import GenreFilter from '@/components/series/GenreFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { mockSeries, searchSeries, filterByGenre } from '@/lib/mockData';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type SortOption = 'popular' | 'latest' | 'rating' | 'trending';
type StatusFilter = 'all' | 'ongoing' | 'completed' | 'hiatus';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialSort = (searchParams.get('sort') as SortOption) || 'popular';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredSeries = useMemo(() => {
    let result = [...mockSeries];

    // Search filter
    if (searchQuery) {
      result = searchSeries(searchQuery);
    }

    // Genre filter
    if (selectedGenre) {
      result = result.filter((s) => s.genres.includes(selectedGenre));
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sorting
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'latest':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'trending':
        result = result.filter((s) => s.isTrending).concat(result.filter((s) => !s.isTrending));
        break;
    }

    return result;
  }, [searchQuery, selectedGenre, sortBy, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Comics</h1>
          <p className="text-muted-foreground">
            Discover your next favorite series from our collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>

            {/* Filters Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your search results
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Status</Label>
                    <RadioGroup
                      value={statusFilter}
                      onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="font-normal">All</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ongoing" id="ongoing" />
                        <Label htmlFor="ongoing" className="font-normal">Ongoing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="completed" id="completed" />
                        <Label htmlFor="completed" className="font-normal">Completed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hiatus" id="hiatus" />
                        <Label htmlFor="hiatus" className="font-normal">On Hiatus</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Genres</Label>
                    <GenreFilter
                      selectedGenre={selectedGenre}
                      onSelectGenre={setSelectedGenre}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Genre Pills */}
        <div className="mb-6 overflow-x-auto pb-2 hide-scrollbar">
          <GenreFilter selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} />
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredSeries.length} {filteredSeries.length === 1 ? 'series' : 'series'} found
          </p>
        </div>

        {filteredSeries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">
              No comics found matching your criteria
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedGenre(null);
              setStatusFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredSeries.map((series, index) => (
              <SeriesCard key={series.id} series={series} index={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSeries.map((series, index) => (
              <SeriesCard key={series.id} series={series} variant="compact" index={index} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

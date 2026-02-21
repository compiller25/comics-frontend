import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Grid, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Layout from "@/components/layout/Layout";
import SeriesCard from "@/components/series/SeriesCard";
import GenreFilter from "@/components/series/GenreFilter";
import NovelCard from "@/components/novels/NovelCard";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { listSeries } from "@/lib/api/comics";
import type { Series } from "@/lib/types";

import { listNovels } from "@/lib/api/novels";
import type { Novel } from "@/lib/api/novels";

type SortOption = "popular" | "latest" | "rating" | "trending";
type StatusFilter = "all" | "ongoing" | "completed" | "hiatus";
type ContentFilter = "all" | "comics" | "novels";

type BrowseItem = { kind: "comic"; data: Series } | { kind: "novel"; data: Novel };

function normalizeStatus(st: any): string {
  // unify "completed" vs "complete"
  if (st === "completed") return "complete";
  return String(st ?? "");
}

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

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialSort = (searchParams.get("sort") as SortOption) || "popular";
  const initialContent = (searchParams.get("content") as ContentFilter) || "all";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [contentFilter, setContentFilter] = useState<ContentFilter>(initialContent);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // COMICS
  const {
    data: seriesData = [],
    isLoading: comicsLoading,
    error: comicsError,
    refetch: refetchComics,
  } = useQuery({
    queryKey: ["series"],
    queryFn: listSeries,
  });

  // NOVELS
  const {
    data: novelsData = [],
    isLoading: novelsLoading,
    error: novelsError,
    refetch: refetchNovels,
  } = useQuery({
    queryKey: ["novels-public"],
    queryFn: listNovels,
  });

  const isLoading = comicsLoading || novelsLoading;
  const error = comicsError || novelsError;

  const filteredItems = useMemo(() => {
    let items: BrowseItem[] = [
      ...seriesData.map((s) => ({ kind: "comic" as const, data: s })),
      ...novelsData.map((n) => ({ kind: "novel" as const, data: n })),
    ];

    // Content filter
    if (contentFilter !== "all") {
      items = items.filter((i) => (contentFilter === "comics" ? i.kind === "comic" : i.kind === "novel"));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter((i) => {
        const title = String((i.data as any).title || "").toLowerCase();
        const desc = String((i.data as any).description || "").toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }

    // Genre filter (comics only)
    if (selectedGenre) {
      items = items.filter((i) => {
        if (i.kind !== "comic") return true;
        const s = i.data as Series;
        return (s.genres || []).includes(selectedGenre);
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      const want = normalizeStatus(statusFilter);
      items = items.filter((i) => normalizeStatus((i.data as any).status) === want);
    }

    // Sorting
    switch (sortBy) {
      case "popular":
        items.sort((a, b) => {
          const av = a.kind === "comic" ? Number((a.data as any).views || 0) : Number((a.data as any).chapterCount || 0);
          const bv = b.kind === "comic" ? Number((b.data as any).views || 0) : Number((b.data as any).chapterCount || 0);
          return bv - av;
        });
        break;

      case "latest":
        items.sort((a, b) => safeTime(b.data) - safeTime(a.data));
        break;

      case "rating":
        items.sort((a, b) => {
          const ar = a.kind === "comic" ? Number((a.data as any).rating || 0) : -1;
          const br = b.kind === "comic" ? Number((b.data as any).rating || 0) : -1;
          return br - ar;
        });
        break;

      case "trending":
        items = items
          .filter((i) => i.kind === "comic" && Boolean((i.data as any).isTrending))
          .concat(items.filter((i) => !(i.kind === "comic" && Boolean((i.data as any).isTrending))));
        break;
    }

    return items;
  }, [seriesData, novelsData, contentFilter, searchQuery, selectedGenre, sortBy, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    params.sort = sortBy;
    params.content = contentFilter;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre(null);
    setStatusFilter("all");
    setSortBy("popular");
    setContentFilter("all");
    setSearchParams({});
  };

  const refetchAll = () => {
    refetchComics();
    refetchNovels();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse</h1>
          <p className="text-muted-foreground">Comics + novels in one place</p>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border p-4">
            <p className="text-sm text-red-500 mb-3">{(error as Error).message || "Failed to load content."}</p>
            <Button variant="outline" onClick={refetchAll}>
              Retry
            </Button>
          </div>
        ) : null}

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

          <div className="flex gap-2 flex-wrap">
            <Select value={contentFilter} onValueChange={(v) => setContentFilter(v as ContentFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Content" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="comics">Comics</SelectItem>
                <SelectItem value="novels">Novels</SelectItem>
              </SelectContent>
            </Select>

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

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your search results</SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Status</Label>
                    <RadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="font-normal">
                          All
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ongoing" id="ongoing" />
                        <Label htmlFor="ongoing" className="font-normal">
                          Ongoing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="completed" id="completed" />
                        <Label htmlFor="completed" className="font-normal">
                          Completed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hiatus" id="hiatus" />
                        <Label htmlFor="hiatus" className="font-normal">
                          On Hiatus
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Genres (Comics)</Label>
                    <GenreFilter selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden sm:flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{isLoading ? "Loading..." : `${filteredItems.length} items found`}</p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">No results found</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item, index) =>
              item.kind === "comic" ? (
                <SeriesCard key={`comic-${(item.data as Series).id}`} series={item.data as Series} index={index} />
              ) : (
                <NovelCard key={`novel-${(item.data as Novel).id}`} novel={item.data as Novel} index={index} />
              )
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, index) =>
              item.kind === "comic" ? (
                <SeriesCard
                  key={`comic-${(item.data as Series).id}`}
                  series={item.data as Series}
                  variant="compact"
                  index={index}
                />
              ) : (
                <NovelCard
                  key={`novel-${(item.data as Novel).id}`}
                  novel={item.data as Novel}
                  variant="compact"
                  index={index}
                />
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
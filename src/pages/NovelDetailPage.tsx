// src/pages/NovelDetailPage.tsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Lock, Book } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { getNovelDetail } from "@/lib/api/novels";
import type { Chapter } from "@/lib/api/novels";

export default function NovelDetailPage() {
  const { id } = useParams();

  const [q, setQ] = useState("");

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["novel", String(id)],
    queryFn: () => getNovelDetail(String(id)),
    enabled: !!id,
    staleTime: 0,
  });

  const novel = data?.novel;
  const chapters = data?.chapters ?? [];

  const filteredChapters = useMemo(() => {
    if (!q.trim()) return chapters;
    const s = q.trim().toLowerCase();
    return chapters.filter((c) => (c.title || "").toLowerCase().includes(s));
  }, [chapters, q]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border p-4">
            <p className="text-sm text-red-500 mb-3">
              {(error as Error).message || "Failed to load novel."}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : null}

        {isLoading || !novel ? (
          <div className="py-16 text-center text-muted-foreground">Loading...</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="w-32 h-44 rounded-xl bg-muted overflow-hidden shrink-0">
                {novel.coverImage ? (
                  <img
                    src={novel.coverImage}
                    alt={novel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Book className="w-7 h-7" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold">{novel.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={novel.status === "complete" ? "secondary" : "default"}>
                    {novel.status || "ongoing"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {Number(novel.chapterCount || chapters.length)} chapters
                  </span>
                </div>

                {novel.description ? (
                  <p className="text-muted-foreground mt-4 max-w-2xl">{novel.description}</p>
                ) : (
                  <p className="text-muted-foreground mt-4">—</p>
                )}

                <div className="mt-5 max-w-sm">
                  <Input
                    placeholder="Search chapters..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Chapters */}
            <Card>
              <CardHeader>
                <CardTitle>Chapters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredChapters.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No chapters found.
                  </p>
                ) : (
                  filteredChapters.map((ch: Chapter) => (
                    <Link
                      key={ch.id}
                      to={`/novels/${novel.id}/chapters/${ch.id}`}
                      className="block"
                    >
                      <div className="rounded-lg border p-3 hover:bg-accent/20 transition-colors">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              Chapter {ch.number}: {ch.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {ch.createdAt ? new Date(ch.createdAt).toLocaleString() : ""}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            {ch.isPublished ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
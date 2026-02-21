// src/pages/CreatorDashboard.tsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Eye,
  Upload,
  Image as ImageIcon,
  BookOpen,
  Users,
  TrendingUp,
  FileText,
  Book,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/contexts/AuthContext";
import type { Series } from "@/lib/types";
import { listMySeries } from "@/lib/api/comics";
import { apiFetch } from "@/lib/api/client";

// ✅ Novels API
import type { Novel } from "@/lib/api/novels";
import { listMyNovels, createNovel, createChapter } from "@/lib/api/novels";

type CreateSeriesForm = {
  title: string;
  description: string;
  status: "ongoing" | "complete";
  coverFile: File | null;
};

type UploadEpisodeForm = {
  seriesId: string;
  title: string;
  number: number;
  publish: boolean;
  panelFiles: File[];
};

type CreateNovelForm = {
  title: string;
  description: string;
  status: "ongoing" | "complete";
  coverFile: File | null;
};

type UploadChapterForm = {
  novelId: string;
  title: string;
  number: number;
  isPublished: boolean;
  pdfFile: File | null;
};

export default function CreatorDashboard() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // ----------------------------
  // SERIES: create + upload episode
  // ----------------------------
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createSeries, setCreateSeries] = useState<CreateSeriesForm>({
    title: "",
    description: "",
    status: "ongoing",
    coverFile: null,
  });
  const [createSeriesBusy, setCreateSeriesBusy] = useState(false);
  const [createSeriesError, setCreateSeriesError] = useState<string | null>(null);
  const [createSeriesSuccess, setCreateSeriesSuccess] = useState<string | null>(null);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadEpisodeForm>({
    seriesId: "",
    title: "",
    number: 1,
    publish: true,
    panelFiles: [],
  });
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [lockedSeriesId, setLockedSeriesId] = useState<string | null>(null);

  // ----------------------------
  // NOVELS: create + upload chapter (PDF)
  // ----------------------------
  const [isCreateNovelOpen, setIsCreateNovelOpen] = useState(false);
  const [createNovelForm, setCreateNovelForm] = useState<CreateNovelForm>({
    title: "",
    description: "",
    status: "ongoing",
    coverFile: null,
  });
  const [createNovelBusy, setCreateNovelBusy] = useState(false);
  const [createNovelError, setCreateNovelError] = useState<string | null>(null);
  const [createNovelSuccess, setCreateNovelSuccess] = useState<string | null>(null);

  const [isUploadChapterOpen, setIsUploadChapterOpen] = useState(false);
  const [uploadChapterForm, setUploadChapterForm] = useState<UploadChapterForm>({
    novelId: "",
    title: "",
    number: 1,
    isPublished: false, // draft by default
    pdfFile: null,
  });
  const [uploadChapterBusy, setUploadChapterBusy] = useState(false);
  const [uploadChapterError, setUploadChapterError] = useState<string | null>(null);
  const [uploadChapterSuccess, setUploadChapterSuccess] = useState<string | null>(null);
  const [lockedNovelId, setLockedNovelId] = useState<string | null>(null);

  // ✅ ALWAYS derive the active novel id from either the form OR the lock
  const effectiveNovelId = uploadChapterForm.novelId || lockedNovelId || "";

  // ----------------------------
  // Queries
  // ----------------------------
  const {
    data: allSeries = [],
    isLoading: seriesLoading,
    error: seriesError,
    refetch: refetchSeries,
  } = useQuery({
    queryKey: ["series"],
    queryFn: listMySeries,
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const {
    data: allNovels = [],
    isLoading: novelsLoading,
    error: novelsError,
    refetch: refetchNovels,
  } = useQuery({
    queryKey: ["novels"],
    queryFn: listMyNovels,
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const mySeries = useMemo<Series[]>(() => allSeries, [allSeries]);
  const myNovels = useMemo<Novel[]>(() => allNovels, [allNovels]);

  const stats = useMemo(() => {
    const totalEpisodes = mySeries.reduce((acc, s) => acc + (s.episodeCount || 0), 0);
    const totalViews = mySeries.reduce((acc, s) => acc + (s.views || 0), 0);
    const totalSubs = mySeries.reduce((acc, s) => acc + ((s as any).subscriberCount || 0), 0);
    const avgRating =
      mySeries.length > 0
        ? (mySeries.reduce((acc, s) => acc + (s.rating || 0), 0) / mySeries.length).toFixed(1)
        : "0.0";

    const totalChapters = myNovels.reduce((acc, n) => acc + Number(n.chapterCount || 0), 0);

    return [
      { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, change: "" },
      { label: "Subscribers", value: totalSubs.toLocaleString(), icon: Users, change: "" },
      { label: "Episodes", value: totalEpisodes.toLocaleString(), icon: BookOpen, change: "" },
      { label: "Chapters", value: totalChapters.toLocaleString(), icon: FileText, change: "" },
      { label: "Avg. Rating", value: avgRating, icon: TrendingUp, change: "" },
    ];
  }, [mySeries, myNovels]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Creator Studio</h1>
          <p className="text-muted-foreground mb-8">Please login to access the creator dashboard</p>
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // ----------------------------
  // Helpers
  // ----------------------------
  const resetCreateSeries = () => {
    setCreateSeries({ title: "", description: "", status: "ongoing", coverFile: null });
    setCreateSeriesError(null);
    setCreateSeriesSuccess(null);
  };

  const resetUploadEpisode = () => {
    setUploadError(null);
    setUploadProgress(null);
    setUploadSuccess(null);
    setLockedSeriesId(null);
    setUploadForm({ seriesId: "", title: "", number: 1, publish: true, panelFiles: [] });
  };

  const openUploadForSeries = (seriesId: string) => {
    resetUploadEpisode();
    setLockedSeriesId(seriesId);
    setUploadForm((s) => ({ ...s, seriesId }));
    setIsUploadDialogOpen(true);
  };

  const openUploadGeneral = () => {
    resetUploadEpisode();
    setIsUploadDialogOpen(true);
  };

  const resetCreateNovel = () => {
    setCreateNovelForm({ title: "", description: "", status: "ongoing", coverFile: null });
    setCreateNovelError(null);
    setCreateNovelSuccess(null);
  };

  const resetUploadChapter = () => {
    setUploadChapterError(null);
    setUploadChapterSuccess(null);
    setLockedNovelId(null);
    setUploadChapterForm({ novelId: "", title: "", number: 1, isPublished: false, pdfFile: null });
  };

  const openUploadChapterForNovel = (novelId: string) => {
    resetUploadChapter();

    // ✅ lock and also FORCE the form to carry the id
    setLockedNovelId(novelId);
    setUploadChapterForm((s) => ({ ...s, novelId }));

    setIsUploadChapterOpen(true);
  };

  const openUploadChapterGeneral = () => {
    resetUploadChapter();
    setIsUploadChapterOpen(true);
  };

  // ----------------------------
  // Actions: Series
  // ----------------------------
  const handleCreateSeriesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSeriesError(null);
    setCreateSeriesSuccess(null);

    if (!createSeries.title.trim()) {
      setCreateSeriesError("Title is required.");
      return;
    }

    setCreateSeriesBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", createSeries.title.trim());
      fd.append("description", createSeries.description.trim());
      fd.append("status", createSeries.status);
      if (createSeries.coverFile) fd.append("cover", createSeries.coverFile);

      await apiFetch("/series/", { method: "POST", body: fd });

      setCreateSeriesSuccess("Series created ✅");

      await queryClient.invalidateQueries({ queryKey: ["series"] });
      await refetchSeries();

      setTimeout(() => {
        setIsCreateDialogOpen(false);
        resetCreateSeries();
      }, 600);
    } catch (err) {
      setCreateSeriesError((err as Error).message || "Failed to create series.");
    } finally {
      setCreateSeriesBusy(false);
    }
  };

  const handleUploadEpisodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    const seriesIdNum = Number(uploadForm.seriesId);
    if (!uploadForm.seriesId || !Number.isFinite(seriesIdNum) || seriesIdNum <= 0) {
      setUploadError("Pick a Series first.");
      return;
    }
    if (!uploadForm.title.trim()) {
      setUploadError("Episode title is required.");
      return;
    }
    if (!Number.isFinite(uploadForm.number) || uploadForm.number < 1) {
      setUploadError("Episode number must be 1 or higher.");
      return;
    }
    if (!uploadForm.panelFiles.length) {
      setUploadError("Select at least one panel image.");
      return;
    }

    setUploadBusy(true);
    setUploadProgress({ done: 0, total: uploadForm.panelFiles.length });

    try {
      const episode = await apiFetch<{ id: number }>("/episodes/", {
        method: "POST",
        json: {
          series: seriesIdNum,
          title: uploadForm.title.trim(),
          number: uploadForm.number,
          is_published: uploadForm.publish,
        },
      });

      const episodeId = episode.id;

      const fd = new FormData();
      uploadForm.panelFiles.forEach((f) => fd.append("images", f));

      await apiFetch(`/episodes/${episodeId}/panels/bulk-upload/`, { method: "POST", body: fd });

      setUploadProgress({ done: uploadForm.panelFiles.length, total: uploadForm.panelFiles.length });
      setUploadSuccess("Episode + panels uploaded ✅");

      await queryClient.invalidateQueries({ queryKey: ["series"] });
      await queryClient.invalidateQueries({ queryKey: ["series", String(seriesIdNum)] });
      await refetchSeries();

      setTimeout(() => {
        setIsUploadDialogOpen(false);
        resetUploadEpisode();
      }, 700);
    } catch (err) {
      setUploadError((err as Error).message || "Failed to upload episode/panels.");
    } finally {
      setUploadBusy(false);
    }
  };

  // ----------------------------
  // Actions: Novels
  // ----------------------------
  const handleCreateNovelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateNovelError(null);
    setCreateNovelSuccess(null);

    if (!createNovelForm.title.trim()) {
      setCreateNovelError("Title is required.");
      return;
    }

    setCreateNovelBusy(true);
    try {
      await createNovel({
        title: createNovelForm.title,
        description: createNovelForm.description,
        status: createNovelForm.status,
        coverFile: createNovelForm.coverFile,
      });

      setCreateNovelSuccess("Novel created ✅");

      await queryClient.invalidateQueries({ queryKey: ["novels"] });
      await refetchNovels();

      setTimeout(() => {
        setIsCreateNovelOpen(false);
        resetCreateNovel();
      }, 600);
    } catch (err) {
      setCreateNovelError((err as Error).message || "Failed to create novel.");
    } finally {
      setCreateNovelBusy(false);
    }
  };

  const handleUploadChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadChapterError(null);
    setUploadChapterSuccess(null);

    // ✅ Use effectiveNovelId so “locked but empty” can never block you
    const novelIdNum = Number(effectiveNovelId);

    if (!effectiveNovelId || !Number.isFinite(novelIdNum) || novelIdNum <= 0) {
      setUploadChapterError("Pick a Novel first.");
      return;
    }
    if (!uploadChapterForm.title.trim()) {
      setUploadChapterError("Chapter title is required.");
      return;
    }
    if (!Number.isFinite(uploadChapterForm.number) || uploadChapterForm.number < 1) {
      setUploadChapterError("Chapter number must be 1 or higher.");
      return;
    }
    if (!uploadChapterForm.pdfFile) {
      setUploadChapterError("Select a PDF file.");
      return;
    }

    setUploadChapterBusy(true);
    try {
      await createChapter({
        novelId: novelIdNum,
        title: uploadChapterForm.title,
        number: uploadChapterForm.number,
        pdfFile: uploadChapterForm.pdfFile,
        isPublished: uploadChapterForm.isPublished,
      });

      setUploadChapterSuccess("Chapter uploaded ✅");

      await queryClient.invalidateQueries({ queryKey: ["novels"] });
      await queryClient.invalidateQueries({ queryKey: ["novel", String(novelIdNum)] });
      await refetchNovels();

      setTimeout(() => {
        setIsUploadChapterOpen(false);
        resetUploadChapter();
      }, 800);
    } catch (err) {
      setUploadChapterError((err as Error).message || "Failed to upload chapter.");
    } finally {
      setUploadChapterBusy(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Creator Studio</h1>
            <p className="text-muted-foreground">Manage your series and novels</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openUploadGeneral}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Episode
            </Button>

            <Button variant="outline" onClick={openUploadChapterGeneral}>
              <FileText className="w-4 h-4 mr-2" />
              Upload Chapter (PDF)
            </Button>

            {/* New Novel */}
            <Dialog
              open={isCreateNovelOpen}
              onOpenChange={(open) => {
                setIsCreateNovelOpen(open);
                if (!open) resetCreateNovel();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Book className="w-4 h-4 mr-2" />
                  New Novel
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Novel</DialogTitle>
                  <DialogDescription>Create a novel, then upload chapters as PDFs.</DialogDescription>
                </DialogHeader>

                <form className="space-y-4 mt-4" onSubmit={handleCreateNovelSubmit}>
                  <div>
                    <Label htmlFor="novelTitle">Title</Label>
                    <Input
                      id="novelTitle"
                      placeholder="Enter novel title"
                      value={createNovelForm.title}
                      onChange={(e) => setCreateNovelForm((s) => ({ ...s, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="novelDesc">Description</Label>
                    <Textarea
                      id="novelDesc"
                      placeholder="Describe your novel..."
                      rows={3}
                      value={createNovelForm.description}
                      onChange={(e) => setCreateNovelForm((s) => ({ ...s, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        variant={createNovelForm.status === "ongoing" ? "secondary" : "outline"}
                        onClick={() => setCreateNovelForm((s) => ({ ...s, status: "ongoing" }))}
                      >
                        Ongoing
                      </Button>
                      <Button
                        type="button"
                        variant={createNovelForm.status === "complete" ? "secondary" : "outline"}
                        onClick={() => setCreateNovelForm((s) => ({ ...s, status: "complete" }))}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Cover Image (optional)</Label>
                    <div className="mt-2 border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Choose a JPG/PNG cover</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCreateNovelForm((s) => ({ ...s, coverFile: e.target.files?.[0] || null }))
                        }
                      />
                    </div>
                  </div>

                  {createNovelError ? <p className="text-sm text-red-500">{createNovelError}</p> : null}
                  {createNovelSuccess ? <p className="text-sm text-green-500">{createNovelSuccess}</p> : null}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsCreateNovelOpen(false)}
                      disabled={createNovelBusy}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createNovelBusy}>
                      {createNovelBusy ? "Creating..." : "Create Novel"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* New Series */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) resetCreateSeries();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Series
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Series</DialogTitle>
                  <DialogDescription>Create a series first. Then upload episodes/panels.</DialogDescription>
                </DialogHeader>

                <form className="space-y-4 mt-4" onSubmit={handleCreateSeriesSubmit}>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter series title"
                      value={createSeries.title}
                      onChange={(e) => setCreateSeries((s) => ({ ...s, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your series..."
                      rows={3}
                      value={createSeries.description}
                      onChange={(e) => setCreateSeries((s) => ({ ...s, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        variant={createSeries.status === "ongoing" ? "secondary" : "outline"}
                        onClick={() => setCreateSeries((s) => ({ ...s, status: "ongoing" }))}
                      >
                        Ongoing
                      </Button>
                      <Button
                        type="button"
                        variant={createSeries.status === "complete" ? "secondary" : "outline"}
                        onClick={() => setCreateSeries((s) => ({ ...s, status: "complete" }))}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Cover Image (optional)</Label>
                    <div className="mt-2 border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Choose a JPG/PNG cover</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCreateSeries((s) => ({ ...s, coverFile: e.target.files?.[0] || null }))
                        }
                      />
                    </div>
                  </div>

                  {createSeriesError ? <p className="text-sm text-red-500">{createSeriesError}</p> : null}
                  {createSeriesSuccess ? <p className="text-sm text-green-500">{createSeriesSuccess}</p> : null}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={createSeriesBusy}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSeriesBusy}>
                      {createSeriesBusy ? "Creating..." : "Create Series"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">—</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Upload Episode Dialog */}
        <Dialog
          open={isUploadDialogOpen}
          onOpenChange={(open) => {
            setIsUploadDialogOpen(open);
            if (!open) resetUploadEpisode();
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Episode</DialogTitle>
              <DialogDescription>Create an episode and upload its panels in reading order.</DialogDescription>
            </DialogHeader>

            <form className="space-y-4 mt-4" onSubmit={handleUploadEpisodeSubmit}>
              <div>
                <Label>Series</Label>
                <select
                  className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={uploadForm.seriesId}
                  disabled={!!lockedSeriesId || uploadBusy}
                  onChange={(e) => setUploadForm((s) => ({ ...s, seriesId: e.target.value }))}
                >
                  <option value="">Select series...</option>
                  {mySeries.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.title}
                    </option>
                  ))}
                </select>
                {lockedSeriesId ? (
                  <p className="text-xs text-muted-foreground mt-1">Series locked (opened from a series card).</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="epTitle">Episode Title</Label>
                <Input
                  id="epTitle"
                  placeholder="Enter episode title"
                  value={uploadForm.title}
                  disabled={uploadBusy}
                  onChange={(e) => setUploadForm((s) => ({ ...s, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="epNum">Episode Number</Label>
                <Input
                  id="epNum"
                  type="number"
                  min={1}
                  value={uploadForm.number}
                  disabled={uploadBusy}
                  onChange={(e) => setUploadForm((s) => ({ ...s, number: Number(e.target.value || 1) }))}
                />
              </div>

              <div>
                <Label>Panels (images)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadBusy}
                  onChange={(e) =>
                    setUploadForm((s) => ({
                      ...s,
                      panelFiles: e.target.files ? Array.from(e.target.files) : [],
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: backend sorts by filename, so name files like 01.png, 02.png…
                </p>
              </div>

              {uploadProgress ? (
                <p className="text-sm text-muted-foreground">
                  Uploading: {uploadProgress.done}/{uploadProgress.total}
                </p>
              ) : null}

              {uploadError ? <p className="text-sm text-red-500">{uploadError}</p> : null}
              {uploadSuccess ? <p className="text-sm text-green-500">{uploadSuccess}</p> : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={uploadBusy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadBusy}>
                  {uploadBusy ? "Uploading..." : "Create & Upload"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Upload Chapter Dialog */}
        <Dialog
          open={isUploadChapterOpen}
          onOpenChange={(open) => {
            setIsUploadChapterOpen(open);
            if (!open) resetUploadChapter();
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Chapter (PDF)</DialogTitle>
              <DialogDescription>Create a chapter and upload the PDF. Default is Draft.</DialogDescription>
            </DialogHeader>

            <form className="space-y-4 mt-4" onSubmit={handleUploadChapterSubmit}>
              <div>
                <Label>Novel</Label>
                <select
                  className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={effectiveNovelId}
                  disabled={!!lockedNovelId || uploadChapterBusy}
                  onChange={(e) => setUploadChapterForm((s) => ({ ...s, novelId: e.target.value }))}
                >
                  <option value="">Select novel...</option>
                  {myNovels.map((n) => (
                    <option key={n.id} value={String(n.id)}>
                      {n.title}
                    </option>
                  ))}
                </select>
                {lockedNovelId ? (
                  <p className="text-xs text-muted-foreground mt-1">Novel locked (opened from a novel card).</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="chTitle">Chapter Title</Label>
                <Input
                  id="chTitle"
                  placeholder="Enter chapter title"
                  value={uploadChapterForm.title}
                  disabled={uploadChapterBusy}
                  onChange={(e) => setUploadChapterForm((s) => ({ ...s, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="chNum">Chapter Number</Label>
                <Input
                  id="chNum"
                  type="number"
                  min={1}
                  value={uploadChapterForm.number}
                  disabled={uploadChapterBusy}
                  onChange={(e) =>
                    setUploadChapterForm((s) => ({ ...s, number: Number(e.target.value || 1) }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Publish</Label>
                  <p className="text-xs text-muted-foreground">If off, chapter stays draft.</p>
                </div>
                <Button
                  type="button"
                  variant={uploadChapterForm.isPublished ? "secondary" : "outline"}
                  disabled={uploadChapterBusy}
                  onClick={() => setUploadChapterForm((s) => ({ ...s, isPublished: !s.isPublished }))}
                >
                  {uploadChapterForm.isPublished ? "Published" : "Draft"}
                </Button>
              </div>

              <div>
                <Label>PDF File</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  disabled={uploadChapterBusy}
                  onChange={(e) =>
                    setUploadChapterForm((s) => ({ ...s, pdfFile: e.target.files?.[0] || null }))
                  }
                />
              </div>

              {uploadChapterError ? <p className="text-sm text-red-500">{uploadChapterError}</p> : null}
              {uploadChapterSuccess ? <p className="text-sm text-green-500">{uploadChapterSuccess}</p> : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsUploadChapterOpen(false)}
                  disabled={uploadChapterBusy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadChapterBusy}>
                  {uploadChapterBusy ? "Uploading..." : "Upload Chapter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="series">
          <TabsList>
            <TabsTrigger value="series">My Series</TabsTrigger>
            <TabsTrigger value="novels">My Novels</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* SERIES TAB */}
          <TabsContent value="series" className="mt-6">
            {seriesError ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-red-500 mb-3">
                    {(seriesError as Error).message || "Failed to load series."}
                  </p>
                  <Button variant="outline" onClick={() => refetchSeries()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : seriesLoading ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">Loading…</CardContent>
              </Card>
            ) : mySeries.length > 0 ? (
              <div className="space-y-4">
                {mySeries.map((series, index) => (
                  <motion.div
                    key={series.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={series.coverImage}
                            alt={series.title}
                            className="w-20 h-28 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{series.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={series.status === "ongoing" ? "default" : "secondary"}>
                                    {series.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link to={`/series/${series.id}`}>
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{series.description}</p>

                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span>{series.episodeCount || 0} episodes</span>
                              <span>{(series.views || 0).toLocaleString()} views</span>
                              <span>{((series as any).subscriberCount || 0).toLocaleString()} subscribers</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex gap-2">
                          <Button size="sm" onClick={() => openUploadForSeries(String(series.id))}>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Episode
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No series yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first webcomic series and start publishing</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Series
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* NOVELS TAB */}
          <TabsContent value="novels" className="mt-6">
            {novelsError ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-red-500 mb-3">
                    {(novelsError as Error).message || "Failed to load novels."}
                  </p>
                  <Button variant="outline" onClick={() => refetchNovels()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : novelsLoading ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">Loading…</CardContent>
              </Card>
            ) : myNovels.length > 0 ? (
              <div className="space-y-4">
                {myNovels.map((novel, index) => (
                  <motion.div
                    key={novel.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={novel.coverImage || ""}
                            alt={novel.title}
                            className="w-20 h-28 object-cover rounded-lg bg-muted"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{novel.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={novel.status === "ongoing" ? "default" : "secondary"}>
                                    {novel.status || "ongoing"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" disabled title="Novel detail page (later)">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{novel.description}</p>

                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span>{Number(novel.chapterCount || 0)} chapters</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex gap-2">
                          <Button size="sm" onClick={() => openUploadChapterForNovel(String(novel.id))}>
                            <FileText className="w-4 h-4 mr-2" />
                            Upload Chapter (PDF)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Book className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No novels yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first novel and upload PDF chapters</p>
                  <Button onClick={() => setIsCreateNovelOpen(true)} variant="secondary">
                    <Book className="w-4 h-4 mr-2" />
                    Create Novel
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>We’ll wire real analytics after uploads are stable.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-lg">
                  <p className="text-muted-foreground">Analytics charts will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Creator Settings</CardTitle>
                <CardDescription>Basic profile settings (UI only for now)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="creatorName">Creator Name</Label>
                  <Input id="creatorName" defaultValue={user?.username} />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell readers about yourself..." rows={3} />
                </div>
                <div>
                  <Label htmlFor="socialLinks">Social Links</Label>
                  <Input id="socialLinks" placeholder="Twitter, Instagram, etc." />
                </div>
                <Button disabled>Save Changes</Button>
                <p className="text-xs text-muted-foreground">We’ll connect this to backend after uploads are stable.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
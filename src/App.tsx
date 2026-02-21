import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import SeriesDetailPage from "./pages/SeriesDetailPage";
import EpisodeReaderPage from "./pages/EpisodeReaderPage";
import CreatorDashboard from "./pages/CreatorDashboard";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";

// ✅ NOVELS
import NovelDetailPage from "./pages/NovelDetailPage";
import ChapterReaderPage from "./pages/ChapterReaderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          {/* ✅ GitHub Pages Safe Router */}
          <HashRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />

              {/* BROWSE */}
              <Route path="/browse" element={<BrowsePage />} />

              {/* COMICS */}
              <Route path="/series/:id" element={<SeriesDetailPage />} />
              <Route
                path="/series/:id/episode/:episodeNum"
                element={<EpisodeReaderPage />}
              />

              {/* NOVELS */}
              <Route path="/novels/:id" element={<NovelDetailPage />} />
              <Route
                path="/novels/:id/chapters/:chapterId"
                element={<ChapterReaderPage />}
              />

              {/* CREATOR */}
              <Route path="/creator" element={<CreatorDashboard />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
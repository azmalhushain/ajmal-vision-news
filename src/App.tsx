import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navigation } from "@/components/Navigation";
import Home from "./pages/Home";
import About from "./pages/About";
import Vision from "./pages/Vision";
import News from "./pages/News";
import Podcasts from "./pages/Podcasts";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminLayout from "./components/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Posts from "./pages/admin/Posts";
import Users from "./pages/admin/Users";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import HeroEditor from "./pages/admin/HeroEditor";
import VisionEditor from "./pages/admin/VisionEditor";
import DevelopmentAreasEditor from "./pages/admin/DevelopmentAreasEditor";
import AboutEditor from "./pages/admin/AboutEditor";
import GalleryEditor from "./pages/admin/GalleryEditor";
import ContactEditor from "./pages/admin/ContactEditor";
import FooterEditor from "./pages/admin/FooterEditor";
import PodcastEditor from "./pages/admin/PodcastEditor";
import CommentsManager from "./pages/admin/CommentsManager";
import PostStatsEditor from "./pages/admin/PostStatsEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<><Navigation /><Home /></>} />
            <Route path="/about" element={<><Navigation /><About /></>} />
            <Route path="/vision" element={<><Navigation /><Vision /></>} />
            <Route path="/news" element={<><Navigation /><News /></>} />
            <Route path="/podcasts" element={<><Navigation /><Podcasts /></>} />
            <Route path="/gallery" element={<><Navigation /><Gallery /></>} />
            <Route path="/contact" element={<><Navigation /><Contact /></>} />
            
            {/* Auth route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="posts" element={<Posts />} />
              <Route path="podcasts" element={<PodcastEditor />} />
              <Route path="comments" element={<CommentsManager />} />
              <Route path="post-stats" element={<PostStatsEditor />} />
              <Route path="hero" element={<HeroEditor />} />
              <Route path="vision" element={<VisionEditor />} />
              <Route path="development-areas" element={<DevelopmentAreasEditor />} />
              <Route path="about" element={<AboutEditor />} />
              <Route path="gallery" element={<GalleryEditor />} />
              <Route path="contact" element={<ContactEditor />} />
              <Route path="footer" element={<FooterEditor />} />
              <Route path="users" element={<Users />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

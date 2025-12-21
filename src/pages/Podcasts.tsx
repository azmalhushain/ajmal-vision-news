import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Play, Pause, Clock, Pin, Heart, MessageCircle, ChevronDown, ChevronUp, Loader2, Video, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { PodcastCardSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  video_url: string | null;
  media_type: string;
  cover_image_url: string | null;
  duration: string | null;
  is_pinned: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 12;

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);
  const [likedPodcasts, setLikedPodcasts] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPodcasts(1, true);
    loadLikedPodcasts();
  }, []);

  const loadLikedPodcasts = () => {
    const liked = localStorage.getItem("liked_podcasts");
    if (liked) {
      setLikedPodcasts(new Set(JSON.parse(liked)));
    }
  };

  const fetchPodcasts = async (pageNum: number, reset = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const from = (pageNum - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count } = await supabase
      .from("podcasts")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data) {
      if (reset) {
        setPodcasts(data as Podcast[]);
      } else {
        setPodcasts((prev) => [...prev, ...(data as Podcast[])]);
      }

      const totalLoaded = reset ? data.length : podcasts.length + data.length;
      setHasMore(count ? totalLoaded < count : false);
      setPage(pageNum);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          fetchPodcasts(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, page]);

  const togglePlay = (podcast: Podcast) => {
    if (podcast.media_type === "video") return;
    
    if (playingId === podcast.id) {
      audioElements[podcast.id]?.pause();
      setPlayingId(null);
    } else {
      Object.values(audioElements).forEach((audio) => audio.pause());

      if (!audioElements[podcast.id]) {
        const audio = new Audio(podcast.audio_url);
        audio.onended = () => setPlayingId(null);
        setAudioElements((prev) => ({ ...prev, [podcast.id]: audio }));
        audio.play();
      } else {
        audioElements[podcast.id].play();
      }
      setPlayingId(podcast.id);
    }
  };

  const toggleLike = (podcastId: string) => {
    const newLiked = new Set(likedPodcasts);
    if (newLiked.has(podcastId)) {
      newLiked.delete(podcastId);
    } else {
      newLiked.add(podcastId);
    }
    setLikedPodcasts(newLiked);
    localStorage.setItem("liked_podcasts", JSON.stringify([...newLiked]));
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  };

  const handleVideoHover = (podcastId: string, isHovering: boolean) => {
    setHoveredVideo(isHovering ? podcastId : null);
    const video = videoRefs.current[podcastId];
    if (video) {
      if (isHovering) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }
  };

  const truncateDescription = (text: string | null, maxLength: number = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Separate pinned and regular podcasts
  const pinnedPodcasts = podcasts.filter((p) => p.is_pinned);
  const regularPodcasts = podcasts.filter((p) => !p.is_pinned);

  return (
    <div className="min-h-screen pt-20 sm:pt-24">
      <SEOHead 
        title="Media Gallery - Ajmal Akhtar Azad"
        description="Watch videos and listen to podcasts from Mayor Ajmal Akhtar Azad about development initiatives."
        url="/podcasts"
        keywords="Podcasts, Videos, Ajmal Akhtar Azad, Mayor, Bhokraha Narsingh, Media"
      />
      
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Video className="h-4 w-4" />
              <span>Media Gallery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4">
              <span className="block text-foreground">WATCH &</span>
              <span className="block text-accent">LISTEN</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {t("podcastDescription") || "Explore our collection of videos and podcasts"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <PodcastCardSkeleton key={i} />
              ))}
            </div>
          ) : podcasts.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              <Headphones className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{t("noPodcasts") || "No media available yet"}</p>
            </div>
          ) : (
            <>
              {/* Featured/Pinned Section */}
              {pinnedPodcasts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Pin className="h-5 w-5 text-accent fill-accent" />
                    Featured
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pinnedPodcasts.slice(0, 2).map((podcast, index) => (
                      <motion.div
                        key={podcast.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group"
                      >
                        <div className="glass-card rounded-2xl border border-border overflow-hidden h-full">
                          <div 
                            className="relative aspect-video bg-muted"
                            onMouseEnter={() => handleVideoHover(podcast.id, true)}
                            onMouseLeave={() => handleVideoHover(podcast.id, false)}
                          >
                            {podcast.media_type === "video" && podcast.video_url ? (
                              <>
                                {hoveredVideo === podcast.id && !getYouTubeId(podcast.video_url) ? (
                                  <video
                                    ref={(el) => { videoRefs.current[podcast.id] = el; }}
                                    src={podcast.video_url}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    playsInline
                                  />
                                ) : (
                                  <img
                                    src={podcast.cover_image_url || getYouTubeThumbnail(podcast.video_url) || "/placeholder.svg"}
                                    alt={podcast.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-center justify-center">
                                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                    <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full relative">
                                <img
                                  src={podcast.cover_image_url || "/placeholder.svg"}
                                  alt={podcast.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
                                  <button
                                    onClick={() => togglePlay(podcast)}
                                    className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                                  >
                                    {playingId === podcast.id ? (
                                      <Pause className="h-7 w-7 text-primary-foreground" fill="currentColor" />
                                    ) : (
                                      <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="px-3 py-1 rounded-full text-xs bg-accent text-accent-foreground flex items-center gap-1 shadow font-medium">
                                <Pin className="h-3 w-3 fill-current" />
                                Featured
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs shadow font-medium ${
                                podcast.media_type === "video" ? "bg-blue-500 text-white" : "bg-primary text-primary-foreground"
                              }`}>
                                {podcast.media_type === "video" ? "Video" : "Audio"}
                              </span>
                            </div>
                            {podcast.duration && (
                              <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs bg-black/80 text-white flex items-center gap-1 backdrop-blur-sm">
                                <Clock className="h-3 w-3" />
                                {podcast.duration}
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {podcast.title}
                            </h3>
                            {podcast.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {podcast.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleLike(podcast.id)}
                                  className={`flex items-center gap-1 text-sm transition-colors ${
                                    likedPodcasts.has(podcast.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                                  }`}
                                >
                                  <Heart className={`h-4 w-4 ${likedPodcasts.has(podcast.id) ? "fill-current" : ""}`} />
                                </button>
                                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                                  <MessageCircle className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(podcast.created_at).toLocaleDateString()}
                                </span>
                                <ShareButtons
                                  url={`/podcasts?id=${podcast.id}`}
                                  title={podcast.title}
                                  description={podcast.description || ""}
                                  image={podcast.cover_image_url || undefined}
                                  variant="dropdown"
                                  size="sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {regularPodcasts.map((podcast, index) => (
                  <motion.div
                    key={podcast.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                    className="group"
                  >
                    <div className="glass-card rounded-xl border border-border overflow-hidden h-full flex flex-col">
                      {/* Thumbnail with hover preview */}
                      <div 
                        className="relative aspect-video bg-muted"
                        onMouseEnter={() => handleVideoHover(podcast.id, true)}
                        onMouseLeave={() => handleVideoHover(podcast.id, false)}
                      >
                        {podcast.media_type === "video" && podcast.video_url ? (
                          <>
                            {hoveredVideo === podcast.id && !getYouTubeId(podcast.video_url) ? (
                              <video
                                ref={(el) => { videoRefs.current[podcast.id] = el; }}
                                src={podcast.video_url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                              />
                            ) : (
                              <img
                                src={podcast.cover_image_url || getYouTubeThumbnail(podcast.video_url) || "/placeholder.svg"}
                                alt={podcast.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center">
                                <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full relative">
                            {podcast.cover_image_url ? (
                              <img
                                src={podcast.cover_image_url}
                                alt={podcast.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
                                <Headphones className="h-12 w-12 text-primary/50" />
                              </div>
                            )}
                            <button
                              onClick={() => togglePlay(podcast)}
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30"
                            >
                              <div className="w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                                {playingId === podcast.id ? (
                                  <Pause className="h-5 w-5 text-primary-foreground" fill="currentColor" />
                                ) : (
                                  <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
                                )}
                              </div>
                            </button>
                          </div>
                        )}
                        
                        {/* Playing indicator */}
                        {playingId === podcast.id && (
                          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 z-10">
                            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                              <div className="h-full bg-primary animate-pulse w-1/2"></div>
                            </div>
                            <button
                              onClick={() => togglePlay(podcast)}
                              className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Pause className="h-3 w-3 text-primary-foreground" fill="currentColor" />
                            </button>
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs shadow-sm font-medium ${
                            podcast.media_type === "video" 
                              ? "bg-blue-500 text-white" 
                              : "bg-primary text-primary-foreground"
                          }`}>
                            {podcast.media_type === "video" ? <Video className="h-3 w-3" /> : <Headphones className="h-3 w-3" />}
                          </span>
                        </div>
                        
                        {podcast.duration && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs bg-black/80 text-white flex items-center gap-1 backdrop-blur-sm">
                            <Clock className="h-3 w-3" />
                            {podcast.duration}
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-sm font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                          {podcast.title}
                        </h3>
                        
                        {podcast.description && (
                          <div className="mb-3 flex-1">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {expandedDesc === podcast.id 
                                ? podcast.description 
                                : truncateDescription(podcast.description, 70)}
                            </p>
                            {podcast.description.length > 70 && (
                              <button
                                onClick={() => setExpandedDesc(expandedDesc === podcast.id ? null : podcast.id)}
                                className="text-xs text-primary hover:underline mt-1 flex items-center gap-0.5"
                              >
                                {expandedDesc === podcast.id ? (
                                  <><ChevronUp className="h-3 w-3" /> Less</>
                                ) : (
                                  <><ChevronDown className="h-3 w-3" /> More</>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Engagement */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleLike(podcast.id)}
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                likedPodcasts.has(podcast.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                              }`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${likedPodcasts.has(podcast.id) ? "fill-current" : ""}`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(podcast.created_at).toLocaleDateString()}
                            </span>
                            <ShareButtons
                              url={`/podcasts?id=${podcast.id}`}
                              title={podcast.title}
                              description={podcast.description || ""}
                              image={podcast.cover_image_url || undefined}
                              variant="dropdown"
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isLoadingMore && (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                )}
                {!hasMore && podcasts.length > 0 && (
                  <p className="text-muted-foreground text-sm">You've seen all media</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Podcasts;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Play, Pause, Clock, Pin, Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";
import { PodcastCardSkeleton } from "@/components/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";

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

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);
  const [likedPodcasts, setLikedPodcasts] = useState<Set<string>>(new Set());
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    fetchPodcasts();
    loadLikedPodcasts();
  }, []);

  const loadLikedPodcasts = () => {
    const liked = localStorage.getItem("liked_podcasts");
    if (liked) {
      setLikedPodcasts(new Set(JSON.parse(liked)));
    }
  };

  const fetchPodcasts = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("podcasts")
      .select("*")
      .eq("is_active", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) {
      setPodcasts(data as Podcast[]);
    }
    setIsLoading(false);
  };

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

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    return null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  const truncateDescription = (text: string | null, maxLength: number = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24">
      <SEOHead 
        title="Podcasts - Ajmal Akhtar Azad"
        description="Listen to podcasts and watch videos from Mayor Ajmal Akhtar Azad"
        url="/podcasts"
      />
      
      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-background to-secondary/50">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">
              <span className="block text-foreground">{t("ourPodcasts").split(" ")[0]}</span>
              <span className="block text-accent">{t("ourPodcasts").split(" ").slice(1).join(" ") || "PODCASTS"}</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-4">
              {t("podcastDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* Podcasts Grid */}
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {[...Array(8)].map((_, i) => (
                <PodcastCardSkeleton key={i} />
              ))}
            </div>
          ) : podcasts.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              {t("noPodcasts")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {podcasts.map((podcast, index) => (
                <div
                  key={podcast.id}
                  className={`transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="glass-card glass-hover rounded-xl border border-border overflow-hidden h-full flex flex-col group">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-primary/5 to-accent/5">
                      {podcast.media_type === "video" && podcast.video_url ? (
                        expandedVideo === podcast.id ? (
                          <div className="w-full h-full bg-black">
                            {getYouTubeEmbedUrl(podcast.video_url) ? (
                              <iframe
                                src={getYouTubeEmbedUrl(podcast.video_url)!}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video controls autoPlay className="w-full h-full object-contain">
                                <source src={podcast.video_url} />
                              </video>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setExpandedVideo(podcast.id)}
                            className="w-full h-full relative group/thumb overflow-hidden"
                          >
                            <img
                              src={podcast.cover_image_url || getYouTubeThumbnail(podcast.video_url) || "/placeholder.svg"}
                              alt={podcast.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary shadow-lg flex items-center justify-center group-hover/thumb:scale-110 transition-all duration-300">
                                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground ml-0.5" fill="currentColor" />
                              </div>
                            </div>
                          </button>
                        )
                      ) : (
                        <div className="w-full h-full relative overflow-hidden">
                          {podcast.cover_image_url ? (
                            <img
                              src={podcast.cover_image_url}
                              alt={podcast.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                <Play className="h-8 w-8 text-primary" />
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => togglePlay(podcast)}
                            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                              {playingId === podcast.id ? (
                                <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" fill="currentColor" />
                              ) : (
                                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground ml-0.5" fill="currentColor" />
                              )}
                            </div>
                          </button>
                          {playingId === podcast.id && (
                            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary animate-pulse w-1/2"></div>
                              </div>
                              <button
                                onClick={() => togglePlay(podcast)}
                                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                              >
                                <Pause className="h-4 w-4 text-primary-foreground" fill="currentColor" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {podcast.is_pinned && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground flex items-center gap-1 shadow-sm">
                            <Pin className="h-3 w-3 fill-current" />
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs shadow-sm ${
                          podcast.media_type === "video" 
                            ? "bg-blue-500 text-white" 
                            : "bg-primary text-primary-foreground"
                        }`}>
                          {podcast.media_type === "video" ? t("video") : t("audio")}
                        </span>
                      </div>
                      
                      {/* Duration */}
                      {podcast.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs bg-black/80 text-white flex items-center gap-1 backdrop-blur-sm">
                          <Clock className="h-3 w-3" />
                          {podcast.duration}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                        {podcast.title}
                      </h3>
                      
                      {/* Description with Read More */}
                      {podcast.description && (
                        <div className="mb-3 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {expandedDesc === podcast.id 
                              ? podcast.description 
                              : truncateDescription(podcast.description, 80)}
                          </p>
                          {podcast.description.length > 80 && (
                            <button
                              onClick={() => setExpandedDesc(expandedDesc === podcast.id ? null : podcast.id)}
                              className="text-xs text-primary hover:underline mt-1 flex items-center gap-0.5"
                            >
                              {expandedDesc === podcast.id ? (
                                <>
                                  {t("showLess")} <ChevronUp className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  {t("readMore")} <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Engagement */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleLike(podcast.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              likedPodcasts.has(podcast.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${likedPodcasts.has(podcast.id) ? "fill-current" : ""}`} />
                          </button>
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Podcasts;

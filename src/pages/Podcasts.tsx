import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Play, Pause, Clock, Pin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShareButtons } from "@/components/ShareButtons";
import { SEOHead } from "@/components/SEOHead";

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
  const [isVisible, setIsVisible] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    const { data } = await supabase
      .from("podcasts")
      .select("*")
      .eq("is_active", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) {
      setPodcasts(data as Podcast[]);
    }
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

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24">
      <SEOHead 
        title="Podcasts - Ajmal Akhtar Azad"
        description="Listen to podcasts and watch videos from Mayor Ajmal Akhtar Azad"
        url="/podcasts"
      />
      
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              <span className="block text-foreground">{t("ourPodcasts").split(" ")[0]}</span>
              <span className="block text-accent">{t("ourPodcasts").split(" ").slice(1).join(" ") || "PODCASTS"}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
              {t("podcastDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* Podcasts Grid */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          {podcasts.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              {t("noPodcasts")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {podcasts.map((podcast, index) => (
                <div
                  key={podcast.id}
                  className={`transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="glass-card glass-hover rounded-xl border border-border overflow-hidden h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      {podcast.media_type === "video" && podcast.video_url ? (
                        expandedVideo === podcast.id ? (
                          <div className="w-full h-full">
                            {getYouTubeEmbedUrl(podcast.video_url) ? (
                              <iframe
                                src={getYouTubeEmbedUrl(podcast.video_url)!}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video controls className="w-full h-full object-cover">
                                <source src={podcast.video_url} />
                              </video>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setExpandedVideo(podcast.id)}
                            className="w-full h-full relative group/thumb"
                          >
                            <img
                              src={podcast.cover_image_url || getYouTubeThumbnail(podcast.video_url) || "/placeholder.svg"}
                              alt={podcast.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/thumb:bg-black/50 transition-colors">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/90 flex items-center justify-center group-hover/thumb:scale-110 transition-transform">
                                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground ml-1" />
                              </div>
                            </div>
                          </button>
                        )
                      ) : (
                        <div className="w-full h-full relative">
                          {podcast.cover_image_url ? (
                            <img
                              src={podcast.cover_image_url}
                              alt={podcast.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <Play className="h-10 w-10 text-primary" />
                            </div>
                          )}
                          <button
                            onClick={() => togglePlay(podcast)}
                            className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors"
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/90 flex items-center justify-center hover:scale-110 transition-transform">
                              {playingId === podcast.id ? (
                                <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                              ) : (
                                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground ml-1" />
                              )}
                            </div>
                          </button>
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {podcast.is_pinned && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-accent/90 text-accent-foreground flex items-center gap-1">
                            <Pin className="h-3 w-3 fill-current" />
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          podcast.media_type === "video" 
                            ? "bg-blue-500/90 text-white" 
                            : "bg-primary/90 text-primary-foreground"
                        }`}>
                          {podcast.media_type === "video" ? t("video") : t("audio")}
                        </span>
                      </div>
                      
                      {/* Duration */}
                      {podcast.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs bg-black/70 text-white flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {podcast.duration}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 line-clamp-2">
                        {podcast.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                        {podcast.description}
                      </p>
                      <div className="flex items-center justify-between">
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
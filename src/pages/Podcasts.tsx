import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Play, Pause, Clock, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
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
      setPodcasts(data);
    }
  };

  const togglePlay = (podcast: Podcast) => {
    if (playingId === podcast.id) {
      audioElements[podcast.id]?.pause();
      setPlayingId(null);
    } else {
      // Pause any currently playing audio
      Object.values(audioElements).forEach((audio) => audio.pause());

      // Create new audio element if doesn't exist
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

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4">
          <div
            className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl lg:text-7xl font-black mb-6">
              <span className="block text-foreground">OUR</span>
              <span className="block text-accent">PODCASTS</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Listen to our latest episodes and stay connected with community discussions.
            </p>
          </div>
        </div>
      </section>

      {/* Podcasts List */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {podcasts.length === 0 ? (
              <div className="text-center text-muted-foreground py-20">
                No podcasts available yet.
              </div>
            ) : (
              podcasts.map((podcast, index) => (
                <div
                  key={podcast.id}
                  className={`transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="glass-card glass-hover p-6 rounded-xl border border-border relative">
                    {podcast.is_pinned && (
                      <div className="absolute top-4 right-4">
                        <Pin className="h-5 w-5 text-accent fill-accent" />
                      </div>
                    )}
                    <div className="flex gap-6 items-start">
                      <div className="flex-shrink-0">
                        {podcast.cover_image_url ? (
                          <img
                            src={podcast.cover_image_url}
                            alt={podcast.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Play className="h-10 w-10 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {podcast.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {podcast.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePlay(podcast)}
                            className="gap-2"
                          >
                            {playingId === podcast.id ? (
                              <>
                                <Pause className="h-4 w-4" /> Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" /> Play
                              </>
                            )}
                          </Button>
                          {podcast.duration && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {podcast.duration}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {new Date(podcast.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Podcasts;
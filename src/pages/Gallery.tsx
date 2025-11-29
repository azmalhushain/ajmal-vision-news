import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Pin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  category: string;
  is_pinned: boolean;
}

const Gallery = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("is_active", true)
      .order("is_pinned", { ascending: false })
      .order("display_order");

    if (data) setImages(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <span className="block text-foreground">PROJECT</span>
              <span className="block text-accent">{t("gallery").toUpperCase()}</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A visual journey through our development initiatives and community programs.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`group relative overflow-hidden rounded-2xl cursor-pointer fade-in-up animate-delay-${
                    (index + 1) * 100
                  }`}
                  onClick={() => setSelectedImage(image.image_url)}
                >
                  {/* Pinned indicator */}
                  {image.is_pinned && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="glass-card px-2 py-1 text-xs font-semibold text-accent rounded-full flex items-center gap-1">
                        <Pin className="w-3 h-3 fill-accent" />
                        {t("pinned")}
                      </span>
                    </div>
                  )}
                  
                  <div className="aspect-[4/3] relative">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="inline-block glass-card px-3 py-1 text-xs font-bold text-accent rounded-full mb-3">
                          {image.category}
                        </span>
                        <h3 className="text-xl font-bold text-foreground">{image.title}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">
              No gallery images available yet.
            </p>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-6xl w-full">
            <img
              src={selectedImage}
              alt="Gallery"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Gallery;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShareButtons } from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { GallerySkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";
import { GalleryBentoGrid } from "@/components/GalleryBentoGrid";
import { SEOHead } from "@/components/SEOHead";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  category: string;
  is_pinned: boolean;
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
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
      <div className="min-h-screen pt-24 bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <GallerySkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title="Photo Gallery - Ajmal Akhtar Azad | Bhokraha Narsingh"
        description="View photos of Mayor Ajmal Akhtar Azad's development projects, community events, and initiatives in Bhokraha Narsingh Municipality."
        url="/gallery"
      />
      <div className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-secondary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-5xl lg:text-7xl font-black mb-6">
                <span className="block text-foreground">{t("projectGallery")}</span>
                <span className="block text-accent">{t("gallery").toUpperCase()}</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t("galleryDescription")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Gallery */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <GalleryBentoGrid images={images} onImageClick={setSelectedImage} />
          </div>
        </section>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-6xl w-full relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 text-foreground"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedImage.title}</h3>
                  <p className="text-muted-foreground">{selectedImage.category}</p>
                </div>
                <ShareButtons
                  url={`/gallery?image=${selectedImage.id}`}
                  title={selectedImage.title}
                  description={`${selectedImage.category} - ${selectedImage.title}`}
                  variant="inline"
                  size="md"
                />
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Gallery;

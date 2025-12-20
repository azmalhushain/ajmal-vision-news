import { motion } from "framer-motion";
import { Pin, X } from "lucide-react";
import { ShareButtons } from "./ShareButtons";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  category: string;
  is_pinned: boolean;
}

interface GalleryBentoGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
}

export const GalleryBentoGrid = ({ images, onImageClick }: GalleryBentoGridProps) => {
  const { t } = useLanguage();

  if (images.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-20">
        {t("noGalleryImages")}
      </p>
    );
  }

  // Create bento grid pattern - repeating pattern of large and small items
  const getGridClass = (index: number) => {
    const pattern = index % 6;
    switch (pattern) {
      case 0: return "md:col-span-2 md:row-span-2"; // Large featured
      case 1: return "md:col-span-1 md:row-span-1"; // Small
      case 2: return "md:col-span-1 md:row-span-2"; // Tall
      case 3: return "md:col-span-1 md:row-span-1"; // Small
      case 4: return "md:col-span-2 md:row-span-1"; // Wide
      case 5: return "md:col-span-1 md:row-span-1"; // Small
      default: return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] sm:auto-rows-[180px]">
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className={`group relative overflow-hidden rounded-xl cursor-pointer ${getGridClass(index)}`}
          onClick={() => onImageClick(image)}
        >
          {/* Image */}
          <img
            src={image.image_url}
            alt={image.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

          {/* Pinned indicator */}
          {image.is_pinned && (
            <div className="absolute top-3 left-3 z-10">
              <span className="glass-card px-2 py-1 text-xs font-semibold text-accent rounded-full flex items-center gap-1">
                <Pin className="w-3 h-3 fill-accent" />
                {t("pinned")}
              </span>
            </div>
          )}

          {/* Share button */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShareButtons
              url={`/gallery?image=${image.id}`}
              title={image.title}
              description={`${image.category} - ${image.title}`}
              variant="dropdown"
              size="sm"
            />
          </div>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-block glass-card px-2 py-0.5 text-[10px] font-bold text-accent rounded-full mb-2 uppercase tracking-wider">
              {image.category}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2">
              {image.title}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
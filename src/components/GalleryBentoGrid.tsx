import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { Pin } from "lucide-react";
import { ShareButtons } from "./ShareButtons";
import { useLanguage } from "@/contexts/LanguageContext";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  category: string;
  is_pinned: boolean;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
}

interface GalleryBentoGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
}

const breakpointCols = {
  default: 4,
  1280: 3,
  768: 2,
  480: 1,
};

export const GalleryBentoGrid = ({ images, onImageClick }: GalleryBentoGridProps) => {
  const { t } = useLanguage();

  if (images.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-20">
        {t("noGalleryImages")}
      </p>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpointCols}
      className="flex w-auto -ml-3 md:-ml-4"
      columnClassName="pl-3 md:pl-4 bg-clip-padding"
    >
      {images.map((image, index) => {
        const ratio =
          image.width && image.height ? image.width / image.height : undefined;
        return (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.4) }}
            className="group relative mb-3 md:mb-4 overflow-hidden rounded-xl cursor-pointer bg-muted"
            style={ratio ? { aspectRatio: String(ratio) } : undefined}
            onClick={() => onImageClick(image)}
          >
            <img
              src={image.image_url}
              alt={image.alt_text || `${image.title} — ${image.category}`}
              loading="lazy"
              decoding="async"
              width={image.width || undefined}
              height={image.height || undefined}
              className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

            {image.is_pinned && (
              <div className="absolute top-3 left-3 z-10">
                <span className="glass-card px-2 py-1 text-xs font-semibold text-accent rounded-full flex items-center gap-1">
                  <Pin className="w-3 h-3 fill-accent" />
                  {t("pinned")}
                </span>
              </div>
            )}

            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <ShareButtons
                url={`/gallery?image=${image.id}`}
                title={image.title}
                description={`${image.category} - ${image.title}`}
                variant="dropdown"
                size="sm"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <span className="inline-block glass-card px-2 py-0.5 text-[10px] font-bold text-accent rounded-full mb-2 uppercase tracking-wider">
                {image.category}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2">
                {image.title}
              </h3>
            </div>
          </motion.div>
        );
      })}
    </Masonry>
  );
};

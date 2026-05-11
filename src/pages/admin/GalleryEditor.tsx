import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pin } from "lucide-react";
import { GalleryBulkUploader } from "@/components/admin/GalleryBulkUploader";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  category: string;
  display_order: number;
  is_active: boolean;
  is_pinned: boolean;
  alt_text: string | null;
  width: number | null;
  height: number | null;
}

const CATEGORIES = ["General", "Development", "Community", "Education", "Health", "Environment"];

const GalleryEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .order("display_order");
    if (data) setImages(data as GalleryImage[]);
    setLoading(false);
  };

  const deleteImage = async (id: string) => {
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) toast({ title: "Error deleting image", variant: "destructive" });
    else {
      toast({ title: "Image deleted" });
      fetchImages();
    }
  };

  const updateImage = async (id: string, field: string, value: string | boolean) => {
    const { error } = await supabase.from("gallery_images").update({ [field]: value }).eq("id", id);
    if (error) toast({ title: "Error updating image", variant: "destructive" });
    else fetchImages();
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Gallery Editor</h1>
        <p className="text-muted-foreground mt-2">
          Bulk upload images. Originals are preserved — manual crop is optional per image.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Bulk upload</CardTitle>
        </CardHeader>
        <CardContent>
          <GalleryBulkUploader
            startingDisplayOrder={images.length}
            onUploaded={fetchImages}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gallery images ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg p-3 space-y-2">
                <div className="bg-muted rounded overflow-hidden aspect-video flex items-center justify-center">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || image.title}
                    loading="lazy"
                    decoding="async"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <Input
                  value={image.title}
                  onChange={(e) => updateImage(image.id, "title", e.target.value)}
                  placeholder="Title"
                />
                <Input
                  value={image.alt_text || ""}
                  onChange={(e) => updateImage(image.id, "alt_text", e.target.value)}
                  placeholder="Alt text"
                />
                <select
                  value={image.category}
                  onChange={(e) => updateImage(image.id, "category", e.target.value)}
                  className="w-full h-9 px-2 border rounded-md bg-background text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={image.is_active}
                        onChange={(e) => updateImage(image.id, "is_active", e.target.checked)}
                      />
                      Active
                    </label>
                    <button
                      onClick={() => updateImage(image.id, "is_pinned", !image.is_pinned)}
                      className={`p-1 rounded ${image.is_pinned ? "text-primary" : "text-muted-foreground"}`}
                      title={image.is_pinned ? "Unpin" : "Pin"}
                    >
                      <Pin className={`h-4 w-4 ${image.is_pinned ? "fill-primary" : ""}`} />
                    </button>
                    {image.width && image.height && (
                      <span className="text-[10px] text-muted-foreground">
                        {image.width}×{image.height}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteImage(image.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {images.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No images yet. Drop some above to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryEditor;

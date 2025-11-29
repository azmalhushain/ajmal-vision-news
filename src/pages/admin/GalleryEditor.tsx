import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, GripVertical, Pin } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  category: string;
  display_order: number;
  is_active: boolean;
  is_pinned: boolean;
}

const GalleryEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const [newImage, setNewImage] = useState({
    title: "",
    category: "General",
    image_url: "",
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .order("display_order");

    if (data) setImages(data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `gallery-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Error uploading image", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    setNewImage({ ...newImage, image_url: urlData.publicUrl });
    setUploading(false);
  };

  const addImage = async () => {
    if (!newImage.image_url || !newImage.title) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("gallery_images").insert({
      ...newImage,
      display_order: images.length,
    });

    if (error) {
      toast({ title: "Error adding image", variant: "destructive" });
    } else {
      toast({ title: "Image added successfully!" });
      setNewImage({ title: "", category: "General", image_url: "" });
      fetchImages();
    }
  };

  const deleteImage = async (id: string) => {
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting image", variant: "destructive" });
    } else {
      toast({ title: "Image deleted successfully!" });
      fetchImages();
    }
  };

  const updateImage = async (id: string, field: string, value: string | boolean) => {
    const { error } = await supabase
      .from("gallery_images")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating image", variant: "destructive" });
    } else {
      fetchImages();
    }
  };

  const categories = ["General", "Development", "Community", "Education", "Health", "Environment"];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Gallery Editor</h1>
        <p className="text-muted-foreground mt-2">Manage gallery images</p>
      </motion.div>

      {/* Add New Image */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                placeholder="Image title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={newImage.category}
                onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                className="w-full h-10 px-3 border rounded-md bg-background"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Image</label>
              <div className="flex gap-2">
                <label className="cursor-pointer flex-1">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 border rounded hover:bg-accent h-10">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : newImage.image_url ? "Change" : "Upload"}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          {newImage.image_url && (
            <img src={newImage.image_url} alt="Preview" className="w-32 h-24 object-cover rounded" />
          )}
          <Button onClick={addImage} disabled={!newImage.image_url || !newImage.title}>
            <Plus className="mr-2 h-4 w-4" /> Add Image
          </Button>
        </CardContent>
      </Card>

      {/* Gallery Images List */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Images ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg p-4 space-y-3">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-32 object-cover rounded"
                />
                <Input
                  value={image.title}
                  onChange={(e) => updateImage(image.id, "title", e.target.value)}
                  placeholder="Title"
                />
                <select
                  value={image.category}
                  onChange={(e) => updateImage(image.id, "category", e.target.value)}
                  className="w-full h-10 px-3 border rounded-md bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={image.is_active}
                        onChange={(e) => updateImage(image.id, "is_active", e.target.checked)}
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    <button
                      onClick={() => updateImage(image.id, "is_pinned", !image.is_pinned)}
                      className={`p-1 rounded ${image.is_pinned ? "text-primary" : "text-muted-foreground"}`}
                      title={image.is_pinned ? "Unpin" : "Pin"}
                    >
                      <Pin className={`h-4 w-4 ${image.is_pinned ? "fill-primary" : ""}`} />
                    </button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteImage(image.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {images.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No images yet. Add your first image above.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryEditor;

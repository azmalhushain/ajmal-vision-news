import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Crop as CropIcon, Loader2, Check } from "lucide-react";
import { CropDialog } from "./CropDialog";

interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: string;
  altText: string;
  width: number;
  height: number;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

const CATEGORIES = ["General", "Development", "Community", "Education", "Health", "Environment"];

const readDimensions = (file: File): Promise<{ w: number; h: number; url: string }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight, url });
    img.onerror = reject;
    img.src = url;
  });

interface Props {
  onUploaded: () => void;
  startingDisplayOrder: number;
}

export const GalleryBulkUploader = ({ onUploaded, startingDisplayOrder }: Props) => {
  const { toast } = useToast();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [compressEnabled, setCompressEnabled] = useState(false);
  const [cropTarget, setCropTarget] = useState<string | null>(null);

  const addFiles = useCallback(async (files: File[]) => {
    const newItems: QueueItem[] = [];
    for (const file of files) {
      try {
        const { w, h, url } = await readDimensions(file);
        const baseTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        newItems.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: url,
          title: baseTitle,
          category: "General",
          altText: "",
          width: w,
          height: h,
          status: "queued",
          progress: 0,
        });
      } catch {
        // skip unreadable file
      }
    }
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: { "image/*": [] },
    multiple: true,
    disabled: isUploading,
  });

  const updateItem = (id: string, patch: Partial<QueueItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const removeItem = (id: string) =>
    setItems((prev) => {
      const it = prev.find((i) => i.id === id);
      if (it) URL.revokeObjectURL(it.previewUrl);
      return prev.filter((i) => i.id !== id);
    });

  const replaceFile = async (id: string, blob: Blob) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const ext = item.file.name.split(".").pop() || "jpg";
    const newFile = new File([blob], item.file.name.replace(/\.[^.]+$/, "") + "-cropped." + ext, {
      type: blob.type || item.file.type,
    });
    URL.revokeObjectURL(item.previewUrl);
    const { w, h, url } = await readDimensions(newFile);
    updateItem(id, { file: newFile, previewUrl: url, width: w, height: h });
  };

  const uploadAll = async () => {
    if (items.length === 0) return;
    setIsUploading(true);
    let order = startingDisplayOrder;
    let successes = 0;

    for (const item of items) {
      if (item.status === "done") continue;
      updateItem(item.id, { status: "uploading", progress: 5 });
      try {
        let toUpload: File | Blob = item.file;
        if (compressEnabled) {
          toUpload = await imageCompression(item.file, {
            maxWidthOrHeight: 2400,
            useWebWorker: true,
            initialQuality: 0.9,
          });
        }
        updateItem(item.id, { progress: 35 });

        const ext = item.file.name.split(".").pop() || "jpg";
        const fileName = `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-images")
          .upload(fileName, toUpload, {
            cacheControl: "31536000",
            upsert: false,
            contentType: item.file.type || "image/jpeg",
          });
        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(fileName);
        updateItem(item.id, { progress: 75 });

        const { error: insErr } = await supabase.from("gallery_images").insert({
          image_url: urlData.publicUrl,
          title: item.title || "Untitled",
          category: item.category,
          alt_text: item.altText || `${item.title} — ${item.category}`,
          width: item.width,
          height: item.height,
          aspect_ratio: item.height ? Number((item.width / item.height).toFixed(4)) : null,
          display_order: order++,
          is_active: true,
        });
        if (insErr) throw insErr;

        updateItem(item.id, { status: "done", progress: 100 });
        successes++;
      } catch (e: any) {
        updateItem(item.id, { status: "error", error: e?.message || "Upload failed" });
      }
    }

    setIsUploading(false);
    toast({ title: `Uploaded ${successes} of ${items.length} images` });
    if (successes > 0) onUploaded();
  };

  const cropItem = items.find((i) => i.id === cropTarget) || null;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-medium">
          {isDragActive ? "Drop images here…" : "Drag & drop images, or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Originals are preserved — no auto-cropping. Use the crop button on any image if you want to adjust it.
        </p>
      </div>

      {items.length > 0 && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={compressEnabled}
                onChange={(e) => setCompressEnabled(e.target.checked)}
                disabled={isUploading}
              />
              Optional: compress to max 2400px @ q=0.9 (off = upload original quality)
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
                  setItems([]);
                }}
                disabled={isUploading}
              >
                Clear queue
              </Button>
              <Button onClick={uploadAll} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…
                  </>
                ) : (
                  <>Upload {items.length} image{items.length === 1 ? "" : "s"}</>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((it) => (
              <div key={it.id} className="border rounded-lg p-3 flex gap-3">
                <div className="relative w-28 h-28 shrink-0 bg-muted rounded overflow-hidden">
                  <img
                    src={it.previewUrl}
                    alt={it.title}
                    className="w-full h-full object-contain"
                  />
                  {it.status === "done" && (
                    <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <Input
                    value={it.title}
                    onChange={(e) => updateItem(it.id, { title: e.target.value })}
                    placeholder="Title"
                    disabled={isUploading}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="h-9 px-2 border rounded-md bg-background text-sm"
                      value={it.category}
                      onChange={(e) => updateItem(it.id, { category: e.target.value })}
                      disabled={isUploading}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground self-center">
                      {it.width}×{it.height}
                    </span>
                  </div>
                  <Input
                    value={it.altText}
                    onChange={(e) => updateItem(it.id, { altText: e.target.value })}
                    placeholder="Alt text (for SEO & screen readers)"
                    disabled={isUploading}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCropTarget(it.id)}
                      disabled={isUploading || it.status === "done"}
                    >
                      <CropIcon className="h-3 w-3 mr-1" /> Crop
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(it.id)}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                  {(it.status === "uploading" || it.status === "done") && (
                    <Progress value={it.progress} className="h-1" />
                  )}
                  {it.status === "error" && (
                    <p className="text-xs text-destructive">{it.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <CropDialog
        open={!!cropTarget}
        imageUrl={cropItem?.previewUrl ?? null}
        onClose={() => setCropTarget(null)}
        onCropComplete={async (blob) => {
          if (cropTarget) await replaceFile(cropTarget, blob);
          setCropTarget(null);
        }}
      />
    </div>
  );
};

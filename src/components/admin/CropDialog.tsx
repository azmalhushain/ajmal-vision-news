import { useState, useCallback, useEffect, useMemo } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

interface CropDialogProps {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onCropComplete: (blob: Blob) => void;
  /** Preset ratios to offer. Defaults to the generic set. */
  presets?: { label: string; value: number | undefined; hint?: string }[];
  /** Ratio we recommend for best-looking output (e.g. 16/9 for post cards). */
  recommendedAspect?: number;
  recommendedLabel?: string;
  /** Show a "Use original" action so cropping stays optional. */
  onUseOriginal?: () => void;
  title?: string;
  description?: string;
}

const DEFAULT_PRESETS: { label: string; value: number | undefined; hint?: string }[] = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1, hint: "Square" },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9, hint: "Card / cover" },
  { label: "3:4", value: 3 / 4 },
];

async function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92));
}

export const CropDialog = ({
  open,
  imageUrl,
  onClose,
  onCropComplete,
  presets,
  recommendedAspect,
  recommendedLabel,
  onUseOriginal,
  title = "Crop image (optional)",
  description,
}: CropDialogProps) => {
  const list = presets ?? DEFAULT_PRESETS;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(recommendedAspect);
  const [pixelArea, setPixelArea] = useState<Area | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAspect(recommendedAspect);
      setPixelArea(null);
      setNatural(null);
    }
  }, [open, imageUrl, recommendedAspect]);

  useEffect(() => {
    if (!open || !imageUrl) return;
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => setNatural({ w: i.naturalWidth, h: i.naturalHeight });
    i.src = imageUrl;
  }, [open, imageUrl]);

  const onComplete = useCallback((_: Area, area: Area) => setPixelArea(area), []);

  const sourceRatio = natural ? natural.w / natural.h : null;
  const ratioStatus = useMemo(() => {
    if (!sourceRatio || !recommendedAspect) return null;
    const off = Math.abs(sourceRatio - recommendedAspect) / recommendedAspect;
    return { off, ok: off <= 0.06 };
  }, [sourceRatio, recommendedAspect]);

  const handleApply = async () => {
    if (!imageUrl || !pixelArea) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(imageUrl, pixelArea);
      onCropComplete(blob);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {ratioStatus && (
          <div
            className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              ratioStatus.ok
                ? "border-primary/30 bg-primary/5"
                : "border-amber-500/40 bg-amber-500/10"
            }`}
          >
            {ratioStatus.ok ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {ratioStatus.ok
                  ? `Ratio looks good for ${recommendedLabel ?? "this slot"}.`
                  : `This image isn't the ideal ratio for ${recommendedLabel ?? "this slot"}.`}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {natural && `Uploaded: ${natural.w}×${natural.h} (${sourceRatio!.toFixed(2)}:1). `}
                Recommended: {recommendedAspect!.toFixed(2)}:1 — the highlighted outline below shows
                exactly how much you can keep.
              </p>
            </div>
          </div>
        )}

        <div className="relative w-full h-[360px] sm:h-[420px] bg-muted rounded-md overflow-hidden">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onComplete}
              objectFit="contain"
              showGrid
              style={{
                cropAreaStyle: {
                  border: "2px solid hsl(var(--primary))",
                  boxShadow: "0 0 0 9999em rgba(0,0,0,0.62), 0 0 24px hsl(var(--primary) / 0.5)",
                },
              }}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {list.map((a) => {
            const isRecommended = recommendedAspect !== undefined && a.value === recommendedAspect;
            return (
              <Button
                key={a.label}
                size="sm"
                variant={aspect === a.value ? "default" : "outline"}
                onClick={() => setAspect(a.value)}
                className="gap-1"
              >
                {isRecommended && <Sparkles className="h-3 w-3" />}
                {a.label}
                {a.hint && <span className="text-[10px] opacity-70">{a.hint}</span>}
              </Button>
            );
          })}
          {recommendedAspect !== undefined && (
            <Badge variant="secondary" className="self-center">
              Recommended: {recommendedLabel ?? `${recommendedAspect.toFixed(2)}:1`}
            </Badge>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm text-muted-foreground">Zoom</label>
          <Slider value={[zoom]} min={1} max={3} step={0.05} onValueChange={(v) => setZoom(v[0])} />
        </div>

        {pixelArea && (
          <p className="text-xs text-muted-foreground">
            Crop output: {Math.round(pixelArea.width)}×{Math.round(pixelArea.height)} px
            {pixelArea.height > 0 && ` (${(pixelArea.width / pixelArea.height).toFixed(2)}:1)`}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {onUseOriginal && (
            <Button variant="outline" onClick={onUseOriginal} disabled={busy}>
              Use original
            </Button>
          )}
          <Button onClick={handleApply} disabled={busy || !pixelArea}>
            {busy ? "Cropping…" : "Apply crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

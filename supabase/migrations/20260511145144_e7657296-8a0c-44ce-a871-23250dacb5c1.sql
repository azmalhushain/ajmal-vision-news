ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS width integer,
  ADD COLUMN IF NOT EXISTS height integer,
  ADD COLUMN IF NOT EXISTS aspect_ratio numeric,
  ADD COLUMN IF NOT EXISTS alt_text text;
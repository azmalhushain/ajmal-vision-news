ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_posts_display_order ON public.posts(display_order);
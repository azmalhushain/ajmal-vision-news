
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS is_live_stream boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS facebook_post_url text;

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS youtube_channel_url text,
  ADD COLUMN IF NOT EXISTS facebook_page_url text;

CREATE INDEX IF NOT EXISTS idx_matches_status_scheduled
  ON public.matches (status, scheduled_at);

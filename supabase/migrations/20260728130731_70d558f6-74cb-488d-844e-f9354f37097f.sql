CREATE TABLE public.share_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL DEFAULT 'post',
  content_id TEXT,
  platform TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'share_click',
  share_url TEXT,
  page_path TEXT,
  device TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.share_events TO anon;
GRANT SELECT, INSERT ON public.share_events TO authenticated;
GRANT ALL ON public.share_events TO service_role;

ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a share event"
ON public.share_events FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view share events"
ON public.share_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_share_events_created_at ON public.share_events (created_at DESC);
CREATE INDEX idx_share_events_platform ON public.share_events (platform);
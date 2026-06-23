
CREATE TABLE IF NOT EXISTS public.site_features (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_features TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_features TO authenticated;
GRANT ALL ON public.site_features TO service_role;

ALTER TABLE public.site_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site features"
  ON public.site_features FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site features"
  ON public.site_features FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site features"
  ON public.site_features FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site features"
  ON public.site_features FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_features (key, enabled) VALUES ('sports', true)
  ON CONFLICT (key) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.site_features;

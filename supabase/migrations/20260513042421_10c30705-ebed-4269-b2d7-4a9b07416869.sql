
CREATE UNIQUE INDEX IF NOT EXISTS uq_social_posts_source_extid
  ON public.social_posts_cache (source, external_id);

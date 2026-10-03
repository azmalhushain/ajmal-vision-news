CREATE TABLE public.user_section_permissions (
  user_id uuid NOT NULL,
  section text NOT NULL,
  permission_level text NOT NULL DEFAULT 'edit' CHECK (permission_level IN ('view', 'edit')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, section)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_section_permissions TO authenticated;
GRANT ALL ON public.user_section_permissions TO service_role;
ALTER TABLE public.user_section_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own section permissions or admins can read all"
  ON public.user_section_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can manage section permissions"
  ON public.user_section_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid,
  actor_name text NOT NULL DEFAULT 'Admin user',
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name text NOT NULL,
  record_id text NOT NULL,
  item_label text NOT NULL DEFAULT 'Content item',
  changed_fields text[] NOT NULL DEFAULT '{}'
);
GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read admin change history"
  ON public.admin_audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.has_section_access(_section text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_section_permissions p
      WHERE p.user_id = auth.uid() AND p.section = _section
    )
  );
$$;
REVOKE ALL ON FUNCTION public.has_section_access(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_section_access(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.has_section_edit(_section text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_section_permissions p
      WHERE p.user_id = auth.uid() AND p.section = _section AND p.permission_level = 'edit'
    )
  );
$$;
REVOKE ALL ON FUNCTION public.has_section_edit(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_section_edit(text) TO authenticated;

CREATE POLICY "Section editors can view all posts" ON public.posts FOR SELECT TO authenticated USING (public.has_section_access('posts'));
CREATE POLICY "Section editors can edit posts" ON public.posts FOR ALL TO authenticated USING (public.has_section_edit('posts')) WITH CHECK (public.has_section_edit('posts'));
CREATE POLICY "Section editors can view gallery images" ON public.gallery_images FOR SELECT TO authenticated USING (public.has_section_access('gallery'));
CREATE POLICY "Section editors can edit gallery images" ON public.gallery_images FOR ALL TO authenticated USING (public.has_section_edit('gallery')) WITH CHECK (public.has_section_edit('gallery'));
CREATE POLICY "Section editors can view podcasts" ON public.podcasts FOR SELECT TO authenticated USING (public.has_section_access('podcasts'));
CREATE POLICY "Section editors can edit podcasts" ON public.podcasts FOR ALL TO authenticated USING (public.has_section_edit('podcasts')) WITH CHECK (public.has_section_edit('podcasts'));
CREATE POLICY "Section editors can view hero content" ON public.hero_content FOR SELECT TO authenticated USING (public.has_section_access('hero'));
CREATE POLICY "Section editors can edit hero content" ON public.hero_content FOR ALL TO authenticated USING (public.has_section_edit('hero')) WITH CHECK (public.has_section_edit('hero'));
CREATE POLICY "Section editors can view vision content" ON public.vision_content FOR SELECT TO authenticated USING (public.has_section_access('vision'));
CREATE POLICY "Section editors can edit vision content" ON public.vision_content FOR ALL TO authenticated USING (public.has_section_edit('vision')) WITH CHECK (public.has_section_edit('vision'));
CREATE POLICY "Section editors can view development areas" ON public.development_areas FOR SELECT TO authenticated USING (public.has_section_access('development-areas'));
CREATE POLICY "Section editors can edit development areas" ON public.development_areas FOR ALL TO authenticated USING (public.has_section_edit('development-areas')) WITH CHECK (public.has_section_edit('development-areas'));
CREATE POLICY "Section editors can view about content" ON public.about_content FOR SELECT TO authenticated USING (public.has_section_access('about'));
CREATE POLICY "Section editors can edit about content" ON public.about_content FOR ALL TO authenticated USING (public.has_section_edit('about')) WITH CHECK (public.has_section_edit('about'));
CREATE POLICY "Section editors can view contact content" ON public.contact_content FOR SELECT TO authenticated USING (public.has_section_access('contact'));
CREATE POLICY "Section editors can edit contact content" ON public.contact_content FOR ALL TO authenticated USING (public.has_section_edit('contact')) WITH CHECK (public.has_section_edit('contact'));
CREATE POLICY "Section editors can view footer content" ON public.footer_content FOR SELECT TO authenticated USING (public.has_section_access('footer'));
CREATE POLICY "Section editors can edit footer content" ON public.footer_content FOR ALL TO authenticated USING (public.has_section_edit('footer')) WITH CHECK (public.has_section_edit('footer'));
CREATE POLICY "Section editors can view sports teams" ON public.teams FOR SELECT TO authenticated USING (public.has_section_access('sports'));
CREATE POLICY "Section editors can edit sports teams" ON public.teams FOR ALL TO authenticated USING (public.has_section_edit('sports')) WITH CHECK (public.has_section_edit('sports'));
CREATE POLICY "Section editors can view sports players" ON public.players FOR SELECT TO authenticated USING (public.has_section_access('sports'));
CREATE POLICY "Section editors can edit sports players" ON public.players FOR ALL TO authenticated USING (public.has_section_edit('sports')) WITH CHECK (public.has_section_edit('sports'));
CREATE POLICY "Section editors can view sports matches" ON public.matches FOR SELECT TO authenticated USING (public.has_section_access('sports'));
CREATE POLICY "Section editors can edit sports matches" ON public.matches FOR ALL TO authenticated USING (public.has_section_edit('sports')) WITH CHECK (public.has_section_edit('sports'));
CREATE POLICY "Section editors can view tournaments" ON public.tournaments FOR SELECT TO authenticated USING (public.has_section_access('sports'));
CREATE POLICY "Section editors can edit tournaments" ON public.tournaments FOR ALL TO authenticated USING (public.has_section_edit('sports')) WITH CHECK (public.has_section_edit('sports'));
CREATE POLICY "Section editors can view sports media" ON public.sports_media FOR SELECT TO authenticated USING (public.has_section_access('sports'));
CREATE POLICY "Section editors can edit sports media" ON public.sports_media FOR ALL TO authenticated USING (public.has_section_edit('sports')) WITH CHECK (public.has_section_edit('sports'));
CREATE POLICY "Section editors can view match innings" ON public.match_innings FOR SELECT TO authenticated USING (public.has_section_access('sports'));
CREATE POLICY "Section editors can edit match innings" ON public.match_innings FOR ALL TO authenticated USING (public.has_section_edit('sports')) WITH CHECK (public.has_section_edit('sports'));
CREATE POLICY "Section editors can view match events" ON public.match_events FOR SELECT TO authenticated USING (public.has_section_access('sports'));
CREATE POLICY "Section editors can edit match events" ON public.match_events FOR ALL TO authenticated USING (public.has_section_edit('sports')) WITH CHECK (public.has_section_edit('sports'));
CREATE POLICY "Section editors can view points overrides" ON public.points_overrides FOR SELECT TO authenticated USING (public.has_section_access('sports'));
CREATE POLICY "Section editors can edit points overrides" ON public.points_overrides FOR ALL TO authenticated USING (public.has_section_edit('sports')) WITH CHECK (public.has_section_edit('sports'));
CREATE POLICY "Section editors can view sports news" ON public.sports_news FOR SELECT TO authenticated USING (public.has_section_access('sports'));
CREATE POLICY "Section editors can edit sports news" ON public.sports_news FOR ALL TO authenticated USING (public.has_section_edit('sports')) WITH CHECK (public.has_section_edit('sports'));

CREATE INDEX user_section_permissions_section_idx ON public.user_section_permissions(section);
CREATE INDEX admin_audit_logs_created_at_idx ON public.admin_audit_logs(created_at DESC);
CREATE INDEX admin_audit_logs_actor_id_idx ON public.admin_audit_logs(actor_id);

CREATE OR REPLACE FUNCTION public.capture_admin_content_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  row_data jsonb;
  old_row jsonb;
  new_row jsonb;
  actor uuid;
  actor_label text;
  item text;
  record_key text;
  changed text[];
BEGIN
  actor := auth.uid();
  old_row := CASE WHEN TG_OP = 'INSERT' THEN '{}'::jsonb ELSE to_jsonb(OLD) END;
  new_row := CASE WHEN TG_OP = 'DELETE' THEN '{}'::jsonb ELSE to_jsonb(NEW) END;
  row_data := CASE WHEN TG_OP = 'DELETE' THEN old_row ELSE new_row END;
  record_key := COALESCE(row_data->>'id', 'unknown');
  item := COALESCE(NULLIF(row_data->>'title', ''), NULLIF(row_data->>'name', ''), NULLIF(row_data->>'slug', ''), NULLIF(row_data->>'tagline', ''), TG_TABLE_NAME);
  SELECT COALESCE(p.full_name, 'Admin user') INTO actor_label FROM public.profiles p WHERE p.id = actor;
  actor_label := COALESCE(actor_label, 'Admin user');
  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(array_agg(key ORDER BY key), ARRAY[]::text[]) INTO changed
      FROM jsonb_object_keys(new_row) AS key
      WHERE key NOT IN ('created_at', 'updated_at');
  ELSIF TG_OP = 'DELETE' THEN
    SELECT COALESCE(array_agg(key ORDER BY key), ARRAY[]::text[]) INTO changed
      FROM jsonb_object_keys(old_row) AS key
      WHERE key NOT IN ('created_at', 'updated_at');
  ELSE
    SELECT COALESCE(array_agg(n.key ORDER BY n.key), ARRAY[]::text[]) INTO changed
      FROM jsonb_each(new_row) n
      JOIN jsonb_each(old_row) o USING (key)
      WHERE n.value IS DISTINCT FROM o.value
        AND n.key NOT IN ('created_at', 'updated_at', 'views', 'likes_count');
  END IF;
  INSERT INTO public.admin_audit_logs(actor_id, actor_name, action, table_name, record_id, item_label, changed_fields)
  VALUES (actor, actor_label, TG_OP, TG_TABLE_NAME, record_key, left(item, 200), changed);
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;
REVOKE ALL ON FUNCTION public.capture_admin_content_change() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'posts', 'gallery_images', 'podcasts', 'hero_content', 'vision_content',
    'development_areas', 'about_content', 'contact_content', 'footer_content',
    'teams', 'players', 'matches', 'tournaments', 'sports_media', 'match_innings',
    'match_events', 'points_overrides', 'sports_news'
  ] LOOP
    EXECUTE format('CREATE TRIGGER audit_admin_change AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.capture_admin_content_change()', target_table);
  END LOOP;
END;
$$;
-- ============================================================
-- KPL3 SPORTS PORTAL — SCHEMA
-- ============================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.match_status AS ENUM ('scheduled','live','completed','abandoned','postponed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.media_source AS ENUM ('upload','youtube','facebook','instagram','external');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.media_kind AS ENUM ('image','video','reel');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.social_source AS ENUM ('facebook','instagram');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TOURNAMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  season text,
  start_date date,
  end_date date,
  venue text,
  banner_url text,
  sponsor_logos jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text,
  status text NOT NULL DEFAULT 'upcoming', -- upcoming|active|completed
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments" ON public.tournaments
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage tournaments" ON public.tournaments
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  short_name text,
  slug text NOT NULL,
  logo_url text,
  jersey_url text,
  home_ground text,
  founded_year integer,
  color_primary text DEFAULT '#000000',
  color_secondary text DEFAULT '#FFFFFF',
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON public.teams(tournament_id);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage teams" ON public.teams
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- PLAYERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  photo_url text,
  role text, -- batter|bowler|all-rounder|wicket-keeper
  jersey_number integer,
  batting_style text,
  bowling_style text,
  dob date,
  is_captain boolean NOT NULL DEFAULT false,
  is_overseas boolean NOT NULL DEFAULT false,
  bio text,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_players_team ON public.players(team_id);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view players" ON public.players
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage players" ON public.players
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_no integer,
  team_a_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  team_b_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  scheduled_at timestamptz,
  venue text,
  status public.match_status NOT NULL DEFAULT 'scheduled',
  toss_winner_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  toss_decision text, -- bat|bowl
  result_text text,
  winner_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  poster_url text,
  highlights_url text,
  commentary_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON public.matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled ON public.matches(scheduled_at);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches" ON public.matches
  FOR SELECT USING (true);
CREATE POLICY "Admins manage matches" ON public.matches
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- MATCH INNINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.match_innings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  innings_no integer NOT NULL DEFAULT 1,
  batting_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  bowling_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  runs integer NOT NULL DEFAULT 0,
  wickets integer NOT NULL DEFAULT 0,
  overs numeric(4,1) NOT NULL DEFAULT 0,
  extras integer NOT NULL DEFAULT 0,
  is_declared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, innings_no)
);
CREATE INDEX IF NOT EXISTS idx_innings_match ON public.match_innings(match_id);
ALTER TABLE public.match_innings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view innings" ON public.match_innings
  FOR SELECT USING (true);
CREATE POLICY "Admins manage innings" ON public.match_innings
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- SPORTS NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sports_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE SET NULL,
  match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  cover_url text,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft', -- draft|published
  published_at timestamptz,
  scheduled_publish_at timestamptz,
  views integer NOT NULL DEFAULT 0,
  is_pinned boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sports_news_status ON public.sports_news(status);
CREATE INDEX IF NOT EXISTS idx_sports_news_tournament ON public.sports_news(tournament_id);
ALTER TABLE public.sports_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published sports news" ON public.sports_news
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage sports news" ON public.sports_news
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- SPORTS MEDIA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sports_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  kind public.media_kind NOT NULL DEFAULT 'image',
  source public.media_source NOT NULL DEFAULT 'upload',
  url text NOT NULL,
  thumbnail_url text,
  caption text,
  alt_text text,
  width integer,
  height integer,
  display_order integer NOT NULL DEFAULT 0,
  is_pinned boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sports_media_tournament ON public.sports_media(tournament_id);
ALTER TABLE public.sports_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sports media" ON public.sports_media
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage sports media" ON public.sports_media
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- SOCIAL POSTS CACHE (Facebook / Instagram)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_posts_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source public.social_source NOT NULL,
  external_id text NOT NULL,
  posted_at timestamptz,
  message text,
  media_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  permalink text,
  raw jsonb,
  is_hidden boolean NOT NULL DEFAULT false,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);
CREATE INDEX IF NOT EXISTS idx_social_posts_posted ON public.social_posts_cache(posted_at DESC);
ALTER TABLE public.social_posts_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-hidden social posts" ON public.social_posts_cache
  FOR SELECT USING (is_hidden = false);
CREATE POLICY "Admins manage social posts" ON public.social_posts_cache
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- updated_at triggers
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tournaments','teams','players','matches','match_innings','sports_news','sports_media'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
  END LOOP;
END $$;

-- ============================================================
-- REALTIME
-- ============================================================
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.match_innings REPLICA IDENTITY FULL;

DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='matches';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.matches';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='match_innings';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.match_innings';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('sports-media','sports-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('sports-logos','sports-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ BEGIN
  CREATE POLICY "Public read sports-media" ON storage.objects
    FOR SELECT USING (bucket_id = 'sports-media');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins write sports-media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'sports-media' AND public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins update sports-media" ON storage.objects
    FOR UPDATE USING (bucket_id = 'sports-media' AND public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins delete sports-media" ON storage.objects
    FOR DELETE USING (bucket_id = 'sports-media' AND public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read sports-logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'sports-logos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins write sports-logos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'sports-logos' AND public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins update sports-logos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'sports-logos' AND public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins delete sports-logos" ON storage.objects
    FOR DELETE USING (bucket_id = 'sports-logos' AND public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- SEED: KPL3 + 7 announced teams
-- ============================================================
INSERT INTO public.tournaments (name, slug, season, start_date, end_date, venue, status, description)
VALUES (
  'Koshi Pride League 3',
  'kpl3',
  '2026',
  '2026-03-21',
  '2026-04-03',
  'Dr. Khalil Azad Cricket Khel Maidan, Bhokraha Narsingh, Sunsari',
  'upcoming',
  'KPL3 — the third season of the Koshi Pride League hosted in Bhokraha Narsingh Municipality.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.teams (tournament_id, name, short_name, slug, color_primary, color_secondary, display_order)
SELECT t.id, x.name, x.short_name, x.slug, x.c1, x.c2, x.ord
FROM public.tournaments t
CROSS JOIN (VALUES
  ('Birtamode Heats',         'BMH', 'birtamode-heats',         '#E63946', '#1D3557', 1),
  ('Everest Thunders',        'EVT', 'everest-thunders',        '#0077B6', '#FFFFFF', 2),
  ('Gorkha Avengers',         'GKA', 'gorkha-avengers',         '#6A040F', '#FFD60A', 3),
  ('BN Koshi Arnas',          'BKA', 'bn-koshi-arnas',          '#02C39A', '#003049', 4),
  ('Namuna Blasters',         'NMB', 'namuna-blasters',         '#FF6B35', '#1A1A2E', 5),
  ('Itahari Adarsh Giants',   'IAG', 'itahari-adarsh-giants',   '#7209B7', '#F72585', 6),
  ('Purbeli Super Kings',     'PSK', 'purbeli-super-kings',     '#FFB703', '#023047', 7)
) AS x(name, short_name, slug, c1, c2, ord)
WHERE t.slug = 'kpl3'
ON CONFLICT (tournament_id, slug) DO NOTHING;
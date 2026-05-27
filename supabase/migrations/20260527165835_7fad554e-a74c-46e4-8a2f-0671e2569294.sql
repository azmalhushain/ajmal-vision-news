CREATE TABLE public.points_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL,
  team_id UUID NOT NULL,
  played_offset INTEGER NOT NULL DEFAULT 0,
  won_offset INTEGER NOT NULL DEFAULT 0,
  lost_offset INTEGER NOT NULL DEFAULT 0,
  no_result_offset INTEGER NOT NULL DEFAULT 0,
  points_offset INTEGER NOT NULL DEFAULT 0,
  nrr_override NUMERIC,
  pinned_rank INTEGER,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, team_id)
);

GRANT SELECT ON public.points_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.points_overrides TO authenticated;
GRANT ALL ON public.points_overrides TO service_role;

ALTER TABLE public.points_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view points overrides"
ON public.points_overrides
FOR SELECT
USING (true);

CREATE POLICY "Admins manage points overrides"
ON public.points_overrides
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_points_overrides_updated_at
BEFORE UPDATE ON public.points_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_points_overrides_tournament ON public.points_overrides(tournament_id);
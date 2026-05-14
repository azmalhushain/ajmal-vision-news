CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  innings_no INTEGER NOT NULL DEFAULT 1,
  over_no INTEGER NOT NULL DEFAULT 0,
  ball_no INTEGER NOT NULL DEFAULT 1,
  runs INTEGER NOT NULL DEFAULT 0,
  is_wicket BOOLEAN NOT NULL DEFAULT false,
  extra_type TEXT,
  extra_runs INTEGER NOT NULL DEFAULT 0,
  batter TEXT,
  bowler TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_events_match ON public.match_events(match_id, innings_no, over_no, ball_no);

ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match events"
  ON public.match_events FOR SELECT
  USING (true);

CREATE POLICY "Admins manage match events"
  ON public.match_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;

CREATE TABLE IF NOT EXISTS public.team_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT team_followers_owner_chk CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS team_followers_user_unique
  ON public.team_followers (team_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS team_followers_session_unique
  ON public.team_followers (team_id, session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS team_followers_team_idx ON public.team_followers (team_id);

ALTER TABLE public.team_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team followers"
  ON public.team_followers FOR SELECT USING (true);

CREATE POLICY "Anyone can follow a team"
  ON public.team_followers FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Owners can unfollow"
  ON public.team_followers FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (auth.uid() IS NULL AND session_id IS NOT NULL
        AND session_id = ((current_setting('request.headers', true))::json ->> 'x-session-id'))
  );

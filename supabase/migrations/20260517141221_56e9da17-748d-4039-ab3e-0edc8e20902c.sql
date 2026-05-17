
CREATE OR REPLACE FUNCTION public.enforce_single_captain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_captain = true AND NEW.team_id IS NOT NULL THEN
    UPDATE public.players
       SET is_captain = false, updated_at = now()
     WHERE team_id = NEW.team_id
       AND id <> NEW.id
       AND is_captain = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_single_captain ON public.players;
CREATE TRIGGER trg_enforce_single_captain
AFTER INSERT OR UPDATE OF is_captain, team_id ON public.players
FOR EACH ROW
WHEN (NEW.is_captain = true)
EXECUTE FUNCTION public.enforce_single_captain();

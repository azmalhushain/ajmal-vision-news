-- Enable RLS on realtime.messages and restrict channel subscriptions
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if rerun
DROP POLICY IF EXISTS "Admins can receive realtime broadcasts" ON realtime.messages;

-- Only admins may receive broadcast / postgres_changes events on these admin-only topics
CREATE POLICY "Admins can receive realtime broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
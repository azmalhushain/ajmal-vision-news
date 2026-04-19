-- 1) Profiles: remove blanket public read; expose profiles only to authenticated users
DROP POLICY IF EXISTS "Anyone can view profiles for display" ON public.profiles;

CREATE POLICY "Authenticated users can view profile display fields"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2) post_likes: prevent any user from deleting other users' session-based likes
DROP POLICY IF EXISTS "Users can remove their own likes" ON public.post_likes;

CREATE POLICY "Users can remove their own likes"
ON public.post_likes
FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (
    auth.uid() IS NULL
    AND session_id IS NOT NULL
    AND session_id = current_setting('request.headers', true)::json->>'x-session-id'
  )
);

-- 3) subscriber_preferences: lock down to admins only (preferences page should go through an edge function)
DROP POLICY IF EXISTS "Anyone can view preferences with valid token" ON public.subscriber_preferences;
DROP POLICY IF EXISTS "Anyone can update preferences with valid token" ON public.subscriber_preferences;
DROP POLICY IF EXISTS "Anyone can insert preferences" ON public.subscriber_preferences;

CREATE POLICY "Admins can manage subscriber preferences"
ON public.subscriber_preferences
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Remove sensitive tables from realtime publication to prevent broadcasting recipient data
ALTER PUBLICATION supabase_realtime DROP TABLE public.email_analytics;
ALTER PUBLICATION supabase_realtime DROP TABLE public.scheduled_emails;
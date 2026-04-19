-- 1) push_subscriptions: scope reads and deletes to the requester's endpoint
DROP POLICY IF EXISTS "Anyone can view their subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.push_subscriptions;

CREATE POLICY "Owners can view their subscription by endpoint"
ON public.push_subscriptions
FOR SELECT
USING (
  endpoint = current_setting('request.headers', true)::json->>'x-endpoint'
);

CREATE POLICY "Owners can delete their subscription by endpoint"
ON public.push_subscriptions
FOR DELETE
USING (
  endpoint = current_setting('request.headers', true)::json->>'x-endpoint'
);

-- 2) email_analytics: only service_role may insert tracking rows
DROP POLICY IF EXISTS "Anyone can insert analytics (for tracking pixels)" ON public.email_analytics;

CREATE POLICY "Service role can insert analytics"
ON public.email_analytics
FOR INSERT
TO service_role
WITH CHECK (true);

-- 3) post_likes: stop exposing user_id correlations to the public
DROP POLICY IF EXISTS "Anyone can view likes count" ON public.post_likes;

-- Authenticated users can see their own like rows
CREATE POLICY "Users can view their own likes"
ON public.post_likes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public reads are blocked entirely; the trigger-maintained posts.likes_count
-- column already provides the public aggregate count safely.
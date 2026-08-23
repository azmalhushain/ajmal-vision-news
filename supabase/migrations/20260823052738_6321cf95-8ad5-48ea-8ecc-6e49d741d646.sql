-- 1. Profiles: remove blanket read access for all signed-in users
DROP POLICY IF EXISTS "Authenticated users can view profile display fields" ON public.profiles;

-- 2. Push subscriptions: remove header-based access to encryption keys
DROP POLICY IF EXISTS "Owners can view their subscription by endpoint" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Owners can delete their subscription by endpoint" ON public.push_subscriptions;

-- 3. Session-header based deletes -> verified auth ownership only
DROP POLICY IF EXISTS "Users can remove their own likes" ON public.post_likes;
CREATE POLICY "Users can remove their own likes"
ON public.post_likes FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can unfollow" ON public.team_followers;
CREATE POLICY "Owners can unfollow"
ON public.team_followers FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 4. SECURITY DEFINER functions: revoke public execute where not needed
REVOKE EXECUTE ON FUNCTION public.auto_publish_scheduled_posts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_otps() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_ab_test_counter(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_single_captain() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.auto_publish_scheduled_posts() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otps() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_ab_test_counter(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
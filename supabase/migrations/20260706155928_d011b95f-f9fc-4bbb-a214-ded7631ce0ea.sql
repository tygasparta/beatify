
DROP POLICY "Anyone can log a play" ON public.plays;
CREATE POLICY "Signed-in users can log plays" ON public.plays FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

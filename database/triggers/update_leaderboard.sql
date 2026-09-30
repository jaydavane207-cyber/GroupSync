-- Leaderboard cache or view refresh notification
CREATE OR REPLACE FUNCTION public.handle_leaderboard_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify realtime clients of leaderboard score adjustments
  PERFORM pg_notify('leaderboard_updated', json_build_object('user_id', NEW.id, 'xp', NEW.xp)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_leaderboard_refresh ON public.profiles;
CREATE TRIGGER trigger_leaderboard_refresh
  AFTER UPDATE OF xp ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_leaderboard_update();

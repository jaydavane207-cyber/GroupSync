-- Cleanup read notifications older than 60 days
CREATE OR REPLACE FUNCTION public.cleanup_stale_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE read = true AND created_at < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;

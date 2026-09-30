-- Maintenance trigger/function for expiring stale pending invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE public.friends
  SET status = 'expired'
  WHERE status = 'pending' AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Processes member application into group
CREATE OR REPLACE FUNCTION public.process_application(
  p_group_id BIGINT,
  p_user_id UUID,
  p_accept BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_accept THEN
    INSERT INTO public.group_members (group_id, profile_id, role)
    VALUES (p_group_id, p_user_id, 'member')
    ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

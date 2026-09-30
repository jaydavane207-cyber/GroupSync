-- Verifies user certificate and updates credibility score
CREATE OR REPLACE FUNCTION public.verify_certificate(cert_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  target_user UUID;
BEGIN
  UPDATE public.certificates
  SET verified = true
  WHERE id = cert_uuid
  RETURNING user_id INTO target_user;

  IF target_user IS NOT NULL THEN
    PERFORM public.calculate_credibility_score(target_user);
    RETURN true;
  END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculates credibility score dynamically based on verified skills, certificates, and completed projects
CREATE OR REPLACE FUNCTION public.calculate_credibility_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  skills_count INTEGER;
  cert_count INTEGER;
  project_count INTEGER;
  calculated_score INTEGER;
BEGIN
  SELECT count(*) INTO skills_count FROM public.user_skills WHERE user_id = user_uuid AND verified = true;
  SELECT count(*) INTO cert_count FROM public.certificates WHERE user_id = user_uuid AND verified = true;
  SELECT count(*) INTO project_count FROM public.projects WHERE owner_id = user_uuid AND status = 'completed';

  calculated_score := 50 + (skills_count * 10) + (cert_count * 15) + (project_count * 5);
  IF calculated_score > 100 THEN
    calculated_score := 100;
  END IF;

  UPDATE public.profiles SET credibility_score = calculated_score WHERE id = user_uuid;
  RETURN calculated_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

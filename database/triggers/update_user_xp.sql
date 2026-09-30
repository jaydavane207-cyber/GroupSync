-- Trigger: Award XP on completed action
CREATE OR REPLACE FUNCTION public.handle_xp_gain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.passed = true AND (OLD IS NULL OR OLD.passed = false) THEN
    UPDATE public.profiles
    SET xp = xp + 50
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_quiz_xp ON public.quiz_attempts;
CREATE TRIGGER trigger_quiz_xp
  AFTER INSERT OR UPDATE ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.handle_xp_gain();

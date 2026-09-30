-- Processes quiz submission, calculates score, and updates user skill/XP
CREATE OR REPLACE FUNCTION public.submit_quiz(
  p_user_id UUID,
  p_quiz_id UUID,
  p_score INTEGER,
  p_answers JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_passing_score INTEGER;
  v_skill TEXT;
  v_passed BOOLEAN;
  v_xp_reward INTEGER := 50;
BEGIN
  SELECT passing_score, skill INTO v_passing_score, v_skill
  FROM public.quizzes
  WHERE id = p_quiz_id;

  v_passed := (p_score >= v_passing_score);

  INSERT INTO public.quiz_attempts (user_id, quiz_id, score, passed, answers)
  VALUES (p_user_id, p_quiz_id, p_score, v_passed, p_answers);

  IF v_passed THEN
    UPDATE public.profiles SET xp = xp + v_xp_reward WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'passed', v_passed,
    'score', p_score,
    'xp_earned', CASE WHEN v_passed THEN v_xp_reward ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

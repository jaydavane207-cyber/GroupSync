-- Calculates matchmaking compatibility score between user skills and team required tags
CREATE OR REPLACE FUNCTION public.generate_match_score(
  p_user_skills TEXT[],
  p_team_tags TEXT[]
)
RETURNS INTEGER AS $$
DECLARE
  matches INTEGER := 0;
  tag TEXT;
BEGIN
  IF array_length(p_team_tags, 1) IS NULL OR array_length(p_team_tags, 1) = 0 THEN
    RETURN 50;
  END IF;

  FOREACH tag IN ARRAY p_team_tags LOOP
    IF tag = ANY(p_user_skills) THEN
      matches := matches + 1;
    END IF;
  END LOOP;

  RETURN LEAST(100, (matches * 100) / array_length(p_team_tags, 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

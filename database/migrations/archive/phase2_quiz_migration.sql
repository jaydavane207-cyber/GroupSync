-- ============================================================================
-- GroupSync: Skill Verification & Quiz System Migration
-- Run in Supabase Dashboard → SQL Editor
-- Safe to re-run (all statements are idempotent)
-- ============================================================================

-- ─── TABLE 1: QUIZZES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quizzes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  skill_name       TEXT NOT NULL,
  description      TEXT,
  difficulty       TEXT NOT NULL DEFAULT 'intermediate', -- beginner/intermediate/advanced
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  total_questions  INTEGER NOT NULL DEFAULT 10,
  passing_score    INTEGER NOT NULL DEFAULT 70, -- percentage
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  tags             TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published quizzes viewable by everyone" ON public.quizzes;
DROP POLICY IF EXISTS "Published quizzes viewable by authenticated users" ON public.quizzes;
CREATE POLICY "Published quizzes viewable by everyone"
  ON public.quizzes FOR SELECT
  USING (is_published = true);

CREATE INDEX IF NOT EXISTS idx_quizzes_skill ON public.quizzes (skill_name);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON public.quizzes (difficulty);


-- ─── TABLE 2: QUIZ_QUESTIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id          UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text    TEXT NOT NULL,
  question_type    TEXT NOT NULL DEFAULT 'mcq', -- mcq/true_false/short_answer/code
  options          JSONB,   -- [{"label":"A","text":"..."}, ...] for MCQ
  correct_answer   TEXT NOT NULL, -- 'A'/'B'/etc for MCQ, 'true'/'false' for TF, text for SA
  explanation      TEXT,
  question_order   INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Questions viewable by everyone" ON public.quiz_questions;
DROP POLICY IF EXISTS "Questions viewable by authenticated users" ON public.quiz_questions;
CREATE POLICY "Questions viewable by everyone"
  ON public.quiz_questions FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions (quiz_id, question_order);


-- ─── TABLE 3: QUIZ_ATTEMPTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id             UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score               INTEGER,        -- raw correct count
  percentage          NUMERIC(5,2),   -- 0.00 - 100.00
  passed              BOOLEAN,
  status              TEXT NOT NULL DEFAULT 'in_progress', -- in_progress/paused/completed
  time_taken_minutes  NUMERIC(6,2),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ,
  paused_at           TIMESTAMPTZ,
  time_remaining_secs INTEGER,        -- saved when paused
  current_question    INTEGER DEFAULT 0
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view own attempts"
  ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own attempts" ON public.quiz_attempts;
CREATE POLICY "Users can create own attempts"
  ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own attempts" ON public.quiz_attempts;
CREATE POLICY "Users can update own attempts"
  ON public.quiz_attempts FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.quiz_attempts (user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.quiz_attempts (user_id, status);


-- ─── TABLE 4: QUIZ_ANSWERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id        UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id       UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  user_answer       TEXT,
  is_correct        BOOLEAN,
  time_spent_secs   INTEGER,
  answered_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(attempt_id, question_id)
);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own answers" ON public.quiz_answers;
DROP POLICY IF EXISTS "Users can view own answers" ON public.quiz_answers;
DROP POLICY IF EXISTS "Users can insert own answers" ON public.quiz_answers;
DROP POLICY IF EXISTS "Users can update own answers" ON public.quiz_answers;

CREATE POLICY "Users can view own answers"
  ON public.quiz_answers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert own answers"
  ON public.quiz_answers FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own answers"
  ON public.quiz_answers FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_answers_attempt ON public.quiz_answers (attempt_id);


-- ─── TABLE 5: CERTIFICATES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificates (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certificate_name        TEXT NOT NULL,
  issuing_organization    TEXT NOT NULL,
  issue_date              DATE NOT NULL,
  expiration_date         DATE,
  credential_id           TEXT,
  credential_url          TEXT,
  certificate_file_url    TEXT,
  category                TEXT DEFAULT 'professional', -- professional/academic/technical
  verification_status     TEXT NOT NULL DEFAULT 'pending', -- pending/verified/rejected
  is_featured             BOOLEAN DEFAULT false,
  rejection_reason        TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own certificates" ON public.certificates;
CREATE POLICY "Users can create own certificates"
  ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own certificates" ON public.certificates;
CREATE POLICY "Users can update own certificates"
  ON public.certificates FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own certificates" ON public.certificates;
CREATE POLICY "Users can delete own certificates"
  ON public.certificates FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates (user_id, created_at DESC);


-- ─── TABLE 6: SKILL_BADGES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skill_badges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type    TEXT NOT NULL DEFAULT 'quiz', -- quiz/certificate/endorsement
  badge_name    TEXT NOT NULL,
  skill_name    TEXT NOT NULL,
  badge_tier    TEXT, -- bronze/silver/gold/platinum
  quiz_score    NUMERIC(5,2),
  earned_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
  quiz_id       UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
  attempt_id    UUID REFERENCES public.quiz_attempts(id) ON DELETE SET NULL,
  metadata      JSONB DEFAULT '{}'
);

ALTER TABLE public.skill_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Badges viewable by everyone" ON public.skill_badges;
CREATE POLICY "Badges viewable by everyone"
  ON public.skill_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own badges" ON public.skill_badges;
CREATE POLICY "Users can create own badges"
  ON public.skill_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_badges_user ON public.skill_badges (user_id, earned_date DESC);
CREATE INDEX IF NOT EXISTS idx_badges_skill ON public.skill_badges (skill_name);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'skill_badges'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.skill_badges;
  END IF;
END $$;


-- ─── TABLE 7: USER_SKILLS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_skills (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name        TEXT NOT NULL,
  proficiency_level TEXT NOT NULL DEFAULT 'beginner', -- beginner/intermediate/expert
  is_verified       BOOLEAN DEFAULT false,
  verified_via      TEXT, -- 'quiz' | 'certificate' | 'endorsement'
  credibility_score NUMERIC(5,2) DEFAULT 0,
  endorsement_count INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User skills viewable by everyone" ON public.user_skills;
CREATE POLICY "User skills viewable by everyone"
  ON public.user_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own skills" ON public.user_skills;
CREATE POLICY "Users can manage own skills"
  ON public.user_skills FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_skills_user ON public.user_skills (user_id);


-- ─── EXTEND PROFILES & HELPER FUNCTIONS ──────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credibility_score NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_xp(user_id_input UUID, xp_delta INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET xp = COALESCE(xp, 0) + xp_delta
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── SEED: SAMPLE QUIZZES ────────────────────────────────────────────────────
INSERT INTO public.quizzes (title, skill_name, description, difficulty, duration_minutes, total_questions, passing_score, is_published, tags)
SELECT * FROM (VALUES
  ('JavaScript Fundamentals', 'JavaScript', 'Test your JavaScript knowledge: variables, functions, closures, and ES6+ features.', 'beginner', 20, 10, 60, true, ARRAY['javascript','frontend','web']),
  ('React Hooks & State', 'React', 'Advanced quiz on React hooks: useState, useEffect, useCallback, useMemo, and custom hooks.', 'intermediate', 25, 10, 70, true, ARRAY['react','frontend','hooks']),
  ('Python Data Structures', 'Python', 'Lists, dicts, sets, tuples — test your Python fundamentals and algorithmic thinking.', 'beginner', 20, 10, 60, true, ARRAY['python','data-structures','algorithms']),
  ('SQL & Database Design', 'SQL', 'Relational database design, normalization, complex queries, JOINs, and indexes.', 'intermediate', 30, 10, 70, true, ARRAY['sql','database','backend']),
  ('System Design Basics', 'System Design', 'Scalability, CAP theorem, load balancing, caching, and distributed systems concepts.', 'advanced', 35, 10, 75, true, ARRAY['system-design','backend','architecture'])
) AS seed(title, skill_name, description, difficulty, duration_minutes, total_questions, passing_score, is_published, tags)
WHERE NOT EXISTS (SELECT 1 FROM public.quizzes LIMIT 1);


-- ─── SEED: SAMPLE QUESTIONS (JavaScript Fundamentals) ────────────────────────
WITH quiz_row AS (SELECT id FROM public.quizzes WHERE skill_name = 'JavaScript' LIMIT 1)
INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, question_order)
SELECT
  quiz_row.id,
  q.question_text, q.question_type, q.options::jsonb, q.correct_answer, q.explanation, q.q_order
FROM quiz_row, (VALUES
  ('What does `typeof null` return in JavaScript?', 'mcq', '[{"label":"A","text":"null"},{"label":"B","text":"object"},{"label":"C","text":"undefined"},{"label":"D","text":"string"}]', 'B', 'This is a famous JavaScript bug — typeof null returns ''object'' due to a legacy error in the original implementation.', 1),
  ('Which of the following correctly declares a constant in JavaScript?', 'mcq', '[{"label":"A","text":"var x = 5"},{"label":"B","text":"let x = 5"},{"label":"C","text":"const x = 5"},{"label":"D","text":"constant x = 5"}]', 'C', 'const declares a block-scoped constant that cannot be reassigned.', 2),
  ('JavaScript is a statically typed language.', 'true_false', null, 'false', 'JavaScript is dynamically typed — variable types are determined at runtime.', 3),
  ('What is the output of `0.1 + 0.2 === 0.3` in JavaScript?', 'mcq', '[{"label":"A","text":"true"},{"label":"B","text":"false"},{"label":"C","text":"NaN"},{"label":"D","text":"undefined"}]', 'B', 'Due to floating-point precision issues, 0.1 + 0.2 equals 0.30000000000000004, not 0.3.', 4),
  ('Which array method returns a new array with all elements that pass a test function?', 'mcq', '[{"label":"A","text":"map()"},{"label":"B","text":"reduce()"},{"label":"C","text":"filter()"},{"label":"D","text":"find()"}]', 'C', 'filter() creates a new array with all elements that pass the provided test function.', 5),
  ('Arrow functions have their own `this` binding.', 'true_false', null, 'false', 'Arrow functions do not have their own this — they inherit this from the enclosing lexical scope.', 6),
  ('What does the spread operator (...) do in JavaScript?', 'short_answer', null, 'expand', 'The spread operator expands an iterable (array, string, object) into individual elements.', 7),
  ('Which method is used to add elements to the END of an array?', 'mcq', '[{"label":"A","text":"unshift()"},{"label":"B","text":"push()"},{"label":"C","text":"concat()"},{"label":"D","text":"splice()"}]', 'B', 'push() adds one or more elements to the end of an array and returns the new length.', 8),
  ('`let` and `const` are function-scoped in JavaScript.', 'true_false', null, 'false', 'let and const are block-scoped, not function-scoped. var is function-scoped.', 9),
  ('What is a closure in JavaScript?', 'short_answer', null, 'function', 'A closure is a function that retains access to its outer scope even after the outer function has returned.', 10)
) AS q(question_text, question_type, options, correct_answer, explanation, q_order)
WHERE NOT EXISTS (SELECT 1 FROM public.quiz_questions qqs JOIN public.quizzes qz ON qqs.quiz_id = qz.id WHERE qz.skill_name = 'JavaScript' LIMIT 1);


-- ─── SEED: SAMPLE QUESTIONS (React Hooks & State) ────────────────────────────
WITH quiz_row AS (SELECT id FROM public.quizzes WHERE skill_name = 'React' LIMIT 1)
INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, question_order)
SELECT
  quiz_row.id, q.question_text, q.question_type, q.options::jsonb, q.correct_answer, q.explanation, q.q_order
FROM quiz_row, (VALUES
  ('Which hook is used to manage local component state?', 'mcq', '[{"label":"A","text":"useEffect"},{"label":"B","text":"useState"},{"label":"C","text":"useRef"},{"label":"D","text":"useContext"}]', 'B', 'useState is the primary hook for adding local state to functional components.', 1),
  ('useEffect with an empty dependency array runs on every render.', 'true_false', null, 'false', 'useEffect with [] runs only once after the initial render (equivalent to componentDidMount).', 2),
  ('What is the correct way to update state based on the previous state in React?', 'mcq', '[{"label":"A","text":"setState(state + 1)"},{"label":"B","text":"setState(prev => prev + 1)"},{"label":"C","text":"state = state + 1"},{"label":"D","text":"setState({state: state + 1})"}]', 'B', 'Always use the functional form setState(prev => ...) when the new state depends on the previous state to avoid stale closures.', 3),
  ('Which hook memoizes a callback function?', 'mcq', '[{"label":"A","text":"useMemo"},{"label":"B","text":"useCallback"},{"label":"C","text":"useRef"},{"label":"D","text":"useReducer"}]', 'B', 'useCallback returns a memoized version of the callback that only changes if one of its dependencies has changed.', 4),
  ('React components must return only one root element.', 'true_false', null, 'true', 'React components must return a single root element. Use fragments (<></>) to wrap multiple elements without adding a DOM node.', 5),
  ('What does the `key` prop do in React lists?', 'short_answer', null, 'identify', 'The key prop helps React identify which items in a list have changed, been added, or removed, for efficient re-rendering.', 6),
  ('Which hook allows you to access the DOM directly?', 'mcq', '[{"label":"A","text":"useState"},{"label":"B","text":"useContext"},{"label":"C","text":"useRef"},{"label":"D","text":"useEffect"}]', 'C', 'useRef returns a mutable ref object whose .current property is initialized to the argument and persists for the full lifetime of the component.', 7),
  ('useMemo is used to memoize expensive computations.', 'true_false', null, 'true', 'useMemo returns a memoized value, recomputing only when one of the dependencies changes — useful for expensive calculations.', 8),
  ('What is the purpose of React Context?', 'short_answer', null, 'share', 'React Context provides a way to share data (like theme, user, locale) between components without passing props at every level.', 9),
  ('Which of the following is NOT a valid React hook?', 'mcq', '[{"label":"A","text":"useEffect"},{"label":"B","text":"useLoop"},{"label":"C","text":"useReducer"},{"label":"D","text":"useLayoutEffect"}]', 'B', 'useLoop is not a valid React hook. The valid hooks are useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef, useLayoutEffect, etc.', 10)
) AS q(question_text, question_type, options, correct_answer, explanation, q_order)
WHERE NOT EXISTS (SELECT 1 FROM public.quiz_questions qqs JOIN public.quizzes qz ON qqs.quiz_id = qz.id WHERE qz.skill_name = 'React' LIMIT 1);


-- ─── NOTIFY POSTGREST SCHEMA CACHE RELOAD ────────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ─── VERIFY ───────────────────────────────────────────────────────────────────
SELECT table_name, (
  SELECT COUNT(*) FROM information_schema.columns c
  WHERE c.table_name = t.table_name AND c.table_schema = 'public'
) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('quizzes','quiz_questions','quiz_attempts','quiz_answers','certificates','skill_badges','user_skills')
ORDER BY table_name;

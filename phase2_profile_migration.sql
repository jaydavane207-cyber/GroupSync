-- ============================================================================
-- GroupSync: Phase 2 Task 4 — Profile & Endorsements Migration Script
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- Safe to re-run (all statements are idempotent)
-- ============================================================================

-- ─── EXTEND PROFILES TABLE ───────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Campus Campus';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Available for Hackathons';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credibility_score NUMERIC(5,2) DEFAULT 0;

-- ─── TABLE: ENDORSEMENTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.endorsements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endorser_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name    TEXT NOT NULL,
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endorser_id, skill_name)
);

ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='endorsements' AND policyname='Endorsements viewable by everyone') THEN
    CREATE POLICY "Endorsements viewable by everyone"
      ON public.endorsements FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='endorsements' AND policyname='Authenticated users can endorse skills') THEN
    CREATE POLICY "Authenticated users can endorse skills"
      ON public.endorsements FOR INSERT
      WITH CHECK (auth.uid() = endorser_id AND auth.uid() <> user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='endorsements' AND policyname='Endorsers can delete own endorsements') THEN
    CREATE POLICY "Endorsers can delete own endorsements"
      ON public.endorsements FOR DELETE
      USING (auth.uid() = endorser_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_endorsements_user ON public.endorsements (user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_skill ON public.endorsements (user_id, skill_name);

ALTER PUBLICATION supabase_realtime ADD TABLE public.endorsements;

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('avatar_url', 'location', 'availability', 'personality_type', 'credibility_score');

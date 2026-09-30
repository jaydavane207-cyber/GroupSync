-- ============================================================================
-- GroupSync: Phase 2 Task 3 — Team Management Migration Script
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- Safe to re-run (all statements are idempotent)
-- ============================================================================

-- ─── TABLE 1: TEAMS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'hackathon', -- hackathon | project | research | competition | study
  skills          TEXT[] DEFAULT '{}',
  max_members     INTEGER NOT NULL DEFAULT 4,
  current_members INTEGER NOT NULL DEFAULT 1,
  privacy         TEXT NOT NULL DEFAULT 'public',    -- public | private
  status          TEXT NOT NULL DEFAULT 'recruiting', -- recruiting | full | archived
  banner_url      TEXT,
  banner_emoji    TEXT DEFAULT '🚀',
  leader_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chat_group_id   BIGINT REFERENCES public.groups(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='teams' AND policyname='Public teams are viewable by everyone') THEN
    CREATE POLICY "Public teams are viewable by everyone"
      ON public.teams FOR SELECT
      USING (privacy = 'public' OR auth.uid() = leader_id OR EXISTS (
        SELECT 1 FROM public.team_members WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='teams' AND policyname='Authenticated users can create teams') THEN
    CREATE POLICY "Authenticated users can create teams"
      ON public.teams FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='teams' AND policyname='Team leaders can update their teams') THEN
    CREATE POLICY "Team leaders can update their teams"
      ON public.teams FOR UPDATE
      USING (auth.uid() = leader_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='teams' AND policyname='Team leaders can delete their teams') THEN
    CREATE POLICY "Team leaders can delete their teams"
      ON public.teams FOR DELETE
      USING (auth.uid() = leader_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teams_category ON public.teams (category);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams (status);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON public.teams (leader_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;

-- ─── TABLE 2: TEAM_MEMBERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member', -- leader | co-leader | member
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='Team members viewable by everyone') THEN
    CREATE POLICY "Team members viewable by everyone"
      ON public.team_members FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='Authenticated users can join teams') THEN
    CREATE POLICY "Authenticated users can join teams"
      ON public.team_members FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='Team leaders or self can remove members') THEN
    CREATE POLICY "Team leaders or self can remove members"
      ON public.team_members FOR DELETE
      USING (
        auth.uid() = user_id OR EXISTS (
          SELECT 1 FROM public.teams WHERE teams.id = team_members.team_id AND teams.leader_id = auth.uid()
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members (user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;

-- ─── TABLE 3: TEAM_APPLICATIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  applicant_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message       TEXT,
  skills        TEXT[] DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | rejected
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at   TIMESTAMPTZ,
  UNIQUE(team_id, applicant_id)
);

ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_applications' AND policyname='Applicants or leaders can view applications') THEN
    CREATE POLICY "Applicants or leaders can view applications"
      ON public.team_applications FOR SELECT
      USING (
        auth.uid() = applicant_id OR EXISTS (
          SELECT 1 FROM public.teams WHERE teams.id = team_applications.team_id AND teams.leader_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_applications' AND policyname='Authenticated users can apply') THEN
    CREATE POLICY "Authenticated users can apply"
      ON public.team_applications FOR INSERT
      WITH CHECK (auth.uid() = applicant_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_applications' AND policyname='Leaders or applicant can update applications') THEN
    CREATE POLICY "Leaders or applicant can update applications"
      ON public.team_applications FOR UPDATE
      USING (
        auth.uid() = applicant_id OR EXISTS (
          SELECT 1 FROM public.teams WHERE teams.id = team_applications.team_id AND teams.leader_id = auth.uid()
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_applications_team ON public.team_applications (team_id);
CREATE INDEX IF NOT EXISTS idx_team_applications_applicant ON public.team_applications (applicant_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_applications;

-- ─── TABLE 4: TEAM_INVITATIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  inviter_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | declined
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, invitee_id)
);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_invitations' AND policyname='Invitees and inviters can view invitations') THEN
    CREATE POLICY "Invitees and inviters can view invitations"
      ON public.team_invitations FOR SELECT
      USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_invitations' AND policyname='Team leaders can invite members') THEN
    CREATE POLICY "Team leaders can invite members"
      ON public.team_invitations FOR INSERT
      WITH CHECK (auth.uid() = inviter_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_invitations' AND policyname='Invitees or inviters can update invitations') THEN
    CREATE POLICY "Invitees or inviters can update invitations"
      ON public.team_invitations FOR UPDATE
      USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON public.team_invitations (team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee ON public.team_invitations (invitee_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_invitations;

-- ─── SEED SAMPLE TEAMS ───────────────────────────────────────────────────────
INSERT INTO public.teams (name, description, category, skills, max_members, current_members, privacy, status, banner_emoji, leader_id)
SELECT 
  'Neural Knights', 
  'Building an autonomous computer vision system for real-time traffic obstacle avoidance in edge IoT devices.',
  'hackathon', 
  ARRAY['Python', 'PyTorch', 'OpenCV', 'FastAPI'], 
  4, 1, 'public', 'recruiting', '🤖', p.id
FROM public.profiles p LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.teams (name, description, category, skills, max_members, current_members, privacy, status, banner_emoji, leader_id)
SELECT 
  'DeFi Matrix', 
  'Developing a gas-optimized algorithmic yield aggregator and cross-chain liquidity bridge on Layer-2 networks.',
  'project', 
  ARRAY['Solidity', 'React', 'Node.js', 'Web3.js'], 
  5, 1, 'public', 'recruiting', '⚡', p.id
FROM public.profiles p LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.teams (name, description, category, skills, max_members, current_members, privacy, status, banner_emoji, leader_id)
SELECT 
  'EcoSphere Campus', 
  'Deploying campus-wide smart bin sensor arrays with predictive recycling analytics and live gamified leaderboards.',
  'competition', 
  ARRAY['IoT', 'React Native', 'Data Visualization', 'Python'], 
  4, 1, 'public', 'recruiting', '🌱', p.id
FROM public.profiles p LIMIT 1
ON CONFLICT DO NOTHING;

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT table_name, (
  SELECT COUNT(*) FROM information_schema.columns c
  WHERE c.table_name = t.table_name AND c.table_schema = 'public'
) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('teams', 'team_members', 'team_applications', 'team_invitations')
ORDER BY table_name;

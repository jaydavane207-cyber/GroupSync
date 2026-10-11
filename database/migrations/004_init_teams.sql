-- 004_init_teams.sql
-- Groups & Teams Schema (Phase 2 Team Management)

-- ============================================================================
-- 1. CREATE ALL TABLES FIRST (Resolves forward-referencing dependencies)
-- ============================================================================

-- ─── GROUPS (Legacy Chat Channels) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  banner_gradient TEXT,
  tags TEXT[] DEFAULT '{}',
  max_members INTEGER DEFAULT 10,
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  role TEXT DEFAULT 'member',
  UNIQUE (group_id, profile_id)
);

-- ─── TEAMS ───────────────────────────────────────────────────────────────────
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
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ─── TEAM_MEMBERS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member', -- leader | co-leader | member
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(team_id, user_id)
);

-- ─── TEAM_APPLICATIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  applicant_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message       TEXT,
  skills        TEXT[] DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | rejected
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  reviewed_at   TIMESTAMPTZ,
  UNIQUE(team_id, applicant_id)
);

-- ─── TEAM_INVITATIONS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  inviter_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | declined
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(team_id, invitee_id)
);

-- ============================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. POLICIES (Created after ALL referenced tables exist)
-- ============================================================================

-- Groups & Members
DROP POLICY IF EXISTS "Groups viewable by authenticated users" ON public.groups;
CREATE POLICY "Groups viewable by authenticated users"
  ON public.groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT WITH CHECK (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Group members viewable by all" ON public.group_members;
CREATE POLICY "Group members viewable by all"
  ON public.group_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Teams
DROP POLICY IF EXISTS "Public teams are viewable by everyone" ON public.teams;
CREATE POLICY "Public teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (privacy = 'public' OR auth.uid() = leader_id OR EXISTS (
    SELECT 1 FROM public.team_members WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team leaders can update their teams" ON public.teams;
CREATE POLICY "Team leaders can update their teams"
  ON public.teams FOR UPDATE
  USING (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Team leaders can delete their teams" ON public.teams;
CREATE POLICY "Team leaders can delete their teams"
  ON public.teams FOR DELETE
  USING (auth.uid() = leader_id);

-- Team Members
DROP POLICY IF EXISTS "Team members viewable by everyone" ON public.team_members;
CREATE POLICY "Team members viewable by everyone"
  ON public.team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can join teams" ON public.team_members;
CREATE POLICY "Authenticated users can join teams"
  ON public.team_members FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Team leaders or self can remove members" ON public.team_members;
CREATE POLICY "Team leaders or self can remove members"
  ON public.team_members FOR DELETE
  USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.teams WHERE teams.id = team_members.team_id AND teams.leader_id = auth.uid()
    )
  );

-- Team Applications
DROP POLICY IF EXISTS "Applicants or leaders can view applications" ON public.team_applications;
CREATE POLICY "Applicants or leaders can view applications"
  ON public.team_applications FOR SELECT
  USING (
    auth.uid() = applicant_id OR EXISTS (
      SELECT 1 FROM public.teams WHERE teams.id = team_applications.team_id AND teams.leader_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can apply" ON public.team_applications;
CREATE POLICY "Authenticated users can apply"
  ON public.team_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Leaders or applicant can update applications" ON public.team_applications;
CREATE POLICY "Leaders or applicant can update applications"
  ON public.team_applications FOR UPDATE
  USING (
    auth.uid() = applicant_id OR EXISTS (
      SELECT 1 FROM public.teams WHERE teams.id = team_applications.team_id AND teams.leader_id = auth.uid()
    )
  );

-- Team Invitations
DROP POLICY IF EXISTS "Invitees and inviters can view invitations" ON public.team_invitations;
CREATE POLICY "Invitees and inviters can view invitations"
  ON public.team_invitations FOR SELECT
  USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Team leaders can invite members" ON public.team_invitations;
CREATE POLICY "Team leaders can invite members"
  ON public.team_invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Invitees or inviters can update invitations" ON public.team_invitations;
CREATE POLICY "Invitees or inviters can update invitations"
  ON public.team_invitations FOR UPDATE
  USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

-- ============================================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_teams_category ON public.teams (category);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams (status);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON public.teams (leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members (user_id);
CREATE INDEX IF NOT EXISTS idx_team_applications_team ON public.team_applications (team_id);
CREATE INDEX IF NOT EXISTS idx_team_applications_applicant ON public.team_applications (applicant_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON public.team_invitations (team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee ON public.team_invitations (invitee_id);

-- ============================================================================
-- 5. REALTIME PUBLICATION
-- ============================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.team_applications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.team_invitations;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

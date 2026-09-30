-- ============================================================================
-- GroupSync: Features Migration — Projects, Friendships, Notifications
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- Safe to re-run (all statements are idempotent)
-- ============================================================================

-- ─── TABLE 1: PROJECTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  domain        TEXT NOT NULL DEFAULT 'web',
  difficulty    TEXT NOT NULL DEFAULT 'intermediate',
  timeline      TEXT NOT NULL DEFAULT 'hackathon',
  deadline      DATE,
  prize_pool    TEXT,
  team_size     TEXT DEFAULT '2-4',
  skills        TEXT[] DEFAULT '{}',
  image         TEXT DEFAULT '🚀',
  organizer_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organizer_name TEXT,
  spots_left    INTEGER DEFAULT 3,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='Projects viewable by everyone') THEN
    CREATE POLICY "Projects viewable by everyone"
      ON public.projects FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='Authenticated users can create projects') THEN
    CREATE POLICY "Authenticated users can create projects"
      ON public.projects FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='Organizers can update their projects') THEN
    CREATE POLICY "Organizers can update their projects"
      ON public.projects FOR UPDATE
      USING (auth.uid() = organizer_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='Organizers can delete their projects') THEN
    CREATE POLICY "Organizers can delete their projects"
      ON public.projects FOR DELETE
      USING (auth.uid() = organizer_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_deadline ON public.projects (deadline ASC);
CREATE INDEX IF NOT EXISTS idx_projects_domain   ON public.projects (domain);
CREATE INDEX IF NOT EXISTS idx_projects_organizer ON public.projects (organizer_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;


-- ─── TABLE 2: PROJECT APPLICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  applicant_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'accepted' | 'rejected'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, applicant_id)
);

ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_applications' AND policyname='Applicants can view own applications') THEN
    CREATE POLICY "Applicants can view own applications"
      ON public.project_applications FOR SELECT
      USING (auth.uid() = applicant_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_applications' AND policyname='Project organizers can view applications') THEN
    CREATE POLICY "Project organizers can view applications"
      ON public.project_applications FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.projects
          WHERE projects.id = project_applications.project_id
            AND projects.organizer_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_applications' AND policyname='Authenticated users can apply to projects') THEN
    CREATE POLICY "Authenticated users can apply to projects"
      ON public.project_applications FOR INSERT
      WITH CHECK (auth.uid() = applicant_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_applications' AND policyname='Organizers can update application status') THEN
    CREATE POLICY "Organizers can update application status"
      ON public.project_applications FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.projects
          WHERE projects.id = project_applications.project_id
            AND projects.organizer_id = auth.uid()
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proj_app_applicant ON public.project_applications (applicant_id);
CREATE INDEX IF NOT EXISTS idx_proj_app_project   ON public.project_applications (project_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.project_applications;


-- ─── TABLE 3: FRIENDSHIPS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.friendships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'accepted' | 'declined'
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='friendships' AND policyname='Users can view their own friendships') THEN
    CREATE POLICY "Users can view their own friendships"
      ON public.friendships FOR SELECT
      USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='friendships' AND policyname='Authenticated users can send friend requests') THEN
    CREATE POLICY "Authenticated users can send friend requests"
      ON public.friendships FOR INSERT
      WITH CHECK (auth.uid() = requester_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='friendships' AND policyname='Users can update their own friend requests') THEN
    CREATE POLICY "Users can update their own friend requests"
      ON public.friendships FOR UPDATE
      USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='friendships' AND policyname='Users can remove their own friendships') THEN
    CREATE POLICY "Users can remove their own friendships"
      ON public.friendships FOR DELETE
      USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships (requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships (addressee_id, status);

ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;


-- ─── TABLE 4: NOTIFICATIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'teams',
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  icon          TEXT DEFAULT '🔔',
  read          BOOLEAN NOT NULL DEFAULT false,
  action_label  TEXT,
  action_path   TEXT,
  reference_id  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications"
      ON public.notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Authenticated users can insert notifications') THEN
    CREATE POLICY "Authenticated users can insert notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications"
      ON public.notifications FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can delete own notifications') THEN
    CREATE POLICY "Users can delete own notifications"
      ON public.notifications FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user    ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON public.notifications (user_id, read) WHERE read = false;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;


-- ─── SEED: Add starter projects so the page isn't empty ──────────────────────
-- Only inserts if there are no projects yet (safe to keep)
INSERT INTO public.projects (title, description, domain, difficulty, timeline, deadline, prize_pool, team_size, skills, image, organizer_name, spots_left)
SELECT * FROM (VALUES
  ('AI Chat Bot Challenge',
   'Build an intelligent contextual assistant using state-of-the-art LLMs, RAG architecture, and agentic workflows.',
   'ai-ml', 'intermediate', 'hackathon',
   (now() + interval '12 days')::date, '$5,000', '2-4',
   ARRAY['Python','NLP','Machine Learning','FastAPI'], '🤖', 'AI Innovation Club', 3),
  ('Web3 Decentralized Social Network',
   'Create a censorship-resistant decentralized social network with verifiable on-chain reputation and ZK identity.',
   'web', 'advanced', 'project',
   (now() + interval '28 days')::date, '$10,000', '4-6',
   ARRAY['React','Node.js','Solidity','Smart Contracts','IPFS'], '🌐', 'Blockchain Vanguard', 2),
  ('Real-time Climate & Weather Tracker',
   'Build an intuitive mobile application for localized real-time hyper-accurate weather warnings and air quality maps.',
   'mobile', 'beginner', 'hackathon',
   (now() + interval '17 days')::date, '$2,000', '2-3',
   ARRAY['React Native','Tailwind CSS','REST APIs','UI/UX'], '📱', 'Mobile Dev Society', 1),
  ('Campus Analytics & Predictive Dashboard',
   'Analyze campus data patterns, study group utilization, and event metrics with interactive visualization and ML forecasting.',
   'data', 'intermediate', 'competition',
   (now() + interval '25 days')::date, '$3,500', '3-5',
   ARRAY['Python','SQL','Data Visualization','Pandas','Streamlit'], '📊', 'Data Science Club', 4),
  ('Immersive VR Campus Tour Experience',
   'Design and prototype a 3D interactive virtual campus experience for prospective students and international visitors.',
   'design', 'intermediate', 'project',
   (now() + interval '42 days')::date, '$4,000', '3-4',
   ARRAY['Three.js','Figma','UI/UX Design','WebGL'], '🎨', 'Creative Media Lab', 2),
  ('Cybersecurity Threat Detection Engine',
   'Develop an automated packet inspection and anomaly detection system for spotting zero-day threats in real time.',
   'ai-ml', 'advanced', 'competition',
   (now() + interval '27 days')::date, '$7,500', '2-4',
   ARRAY['Python','Network Security','Wireshark','Anomaly Detection'], '🛡️', 'Cyber Security Guild', 3)
) AS seed(title, description, domain, difficulty, timeline, deadline, prize_pool, team_size, skills, image, organizer_name, spots_left)
WHERE NOT EXISTS (SELECT 1 FROM public.projects LIMIT 1);


-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT table_name, (
  SELECT COUNT(*) FROM information_schema.columns c
  WHERE c.table_name = t.table_name AND c.table_schema = 'public'
) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('projects','project_applications','friendships','notifications')
ORDER BY table_name;

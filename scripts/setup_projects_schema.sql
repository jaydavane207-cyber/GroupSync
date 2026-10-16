-- ============================================================================
-- GroupSync: Fix Missing Projects Table & Schema Cache
-- Run this in Supabase Dashboard → SQL Editor:
-- https://supabase.com/dashboard/project/eaukxgiwfzajxcpbfgfq/sql/new
-- Safe to re-run (all statements are idempotent)
-- ============================================================================

-- 1. Create or update the projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  domain         TEXT NOT NULL DEFAULT 'web',
  difficulty     TEXT NOT NULL DEFAULT 'intermediate',
  timeline       TEXT NOT NULL DEFAULT 'hackathon',
  deadline       DATE,
  prize_pool     TEXT,
  team_size      TEXT DEFAULT '2-4',
  skills         TEXT[] DEFAULT '{}',
  tags           TEXT[] DEFAULT '{}',
  image          TEXT DEFAULT '🚀',
  status         TEXT DEFAULT 'active',
  github_url     TEXT,
  demo_url       TEXT,
  organizer_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organizer_name TEXT,
  owner_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  spots_left     INTEGER DEFAULT 3,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Ensure all columns exist even if table was partially created previously
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'web';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'intermediate';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS timeline TEXT NOT NULL DEFAULT 'hackathon';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS prize_pool TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_size TEXT DEFAULT '2-4';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '🚀';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS demo_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS organizer_name TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS spots_left INTEGER DEFAULT 3;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
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
      USING (auth.uid() = organizer_id OR auth.uid() = owner_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='Organizers can delete their projects') THEN
    CREATE POLICY "Organizers can delete their projects"
      ON public.projects FOR DELETE
      USING (auth.uid() = organizer_id OR auth.uid() = owner_id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON public.projects (deadline ASC);
CREATE INDEX IF NOT EXISTS idx_projects_domain   ON public.projects (domain);
CREATE INDEX IF NOT EXISTS idx_projects_organizer ON public.projects (organizer_id);


-- 2. Create project applications table
CREATE TABLE IF NOT EXISTS public.project_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  applicant_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'accepted' | 'rejected'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
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
            AND (projects.organizer_id = auth.uid() OR projects.owner_id = auth.uid())
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
            AND (projects.organizer_id = auth.uid() OR projects.owner_id = auth.uid())
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proj_app_applicant ON public.project_applications (applicant_id);
CREATE INDEX IF NOT EXISTS idx_proj_app_project   ON public.project_applications (project_id);


-- 3. Create notifications table if missing
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'projects',
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  icon          TEXT DEFAULT '🔔',
  read          BOOLEAN NOT NULL DEFAULT false,
  action_label  TEXT,
  action_path   TEXT,
  reference_id  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
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

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, created_at DESC);


-- 4. Enable Realtime Publications
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_applications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;


-- 5. Seed initial projects if none exist
INSERT INTO public.projects (title, description, domain, difficulty, timeline, deadline, prize_pool, team_size, skills, tags, image, organizer_name, spots_left, status)
SELECT * FROM (VALUES
  ('AI Chat Bot Challenge',
   'Build an intelligent contextual assistant using state-of-the-art LLMs, RAG architecture, and agentic workflows.',
   'ai-ml', 'intermediate', 'hackathon',
   (now() + interval '12 days')::date, '$5,000', '2-4',
   ARRAY['Python','NLP','Machine Learning','FastAPI'], ARRAY['Python','NLP','Machine Learning','FastAPI'], '🤖', 'AI Innovation Club', 3, 'active'),
  ('Web3 Decentralized Social Network',
   'Create a censorship-resistant decentralized social network with verifiable on-chain reputation and ZK identity.',
   'web', 'advanced', 'project',
   (now() + interval '28 days')::date, '$10,000', '4-6',
   ARRAY['React','Node.js','Solidity','Smart Contracts','IPFS'], ARRAY['React','Node.js','Solidity','Smart Contracts','IPFS'], '🌐', 'Blockchain Vanguard', 2, 'active'),
  ('Real-time Climate & Weather Tracker',
   'Build an intuitive mobile application for localized real-time hyper-accurate weather warnings and air quality maps.',
   'mobile', 'beginner', 'hackathon',
   (now() + interval '17 days')::date, '$2,000', '2-3',
   ARRAY['React Native','Tailwind CSS','REST APIs','UI/UX'], ARRAY['React Native','Tailwind CSS','REST APIs','UI/UX'], '📱', 'Mobile Dev Society', 1, 'active'),
  ('Campus Analytics & Predictive Dashboard',
   'Analyze campus data patterns, study group utilization, and event metrics with interactive visualization and ML forecasting.',
   'data', 'intermediate', 'competition',
   (now() + interval '25 days')::date, '$3,500', '3-5',
   ARRAY['Python','SQL','Data Visualization','Pandas','Streamlit'], ARRAY['Python','SQL','Data Visualization','Pandas','Streamlit'], '📊', 'Data Science Club', 4, 'active'),
  ('Immersive VR Campus Tour Experience',
   'Design and prototype a 3D interactive virtual campus experience for prospective students and international visitors.',
   'design', 'intermediate', 'project',
   (now() + interval '42 days')::date, '$4,000', '3-4',
   ARRAY['Three.js','Figma','UI/UX Design','WebGL'], ARRAY['Three.js','Figma','UI/UX Design','WebGL'], '🎨', 'Creative Media Lab', 2, 'active'),
  ('Cybersecurity Threat Detection Engine',
   'Develop an automated packet inspection and anomaly detection system for spotting zero-day threats in real time.',
   'ai-ml', 'advanced', 'competition',
   (now() + interval '27 days')::date, '$7,500', '2-4',
   ARRAY['Python','Network Security','Wireshark','Anomaly Detection'], ARRAY['Python','Network Security','Wireshark','Anomaly Detection'], '🛡️', 'Cyber Security Guild', 3, 'active')
) AS seed(title, description, domain, difficulty, timeline, deadline, prize_pool, team_size, skills, tags, image, organizer_name, spots_left, status)
WHERE NOT EXISTS (SELECT 1 FROM public.projects LIMIT 1);


-- 6. Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

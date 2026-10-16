-- 003_init_projects.sql
-- Projects & Hackathons table, Project Applications, and RLS policies

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

CREATE TABLE IF NOT EXISTS public.project_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  applicant_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending',
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

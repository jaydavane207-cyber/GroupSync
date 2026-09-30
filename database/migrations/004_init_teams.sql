-- 004_init_teams.sql
-- Groups / Teams schema

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

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

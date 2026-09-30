-- 002_init_profiles.sql
-- Profiles table for GroupSync student and developer identities

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year TEXT,
  faction TEXT,
  avatar TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  online BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  email TEXT,
  dob TEXT,
  college TEXT,
  course TEXT,
  branch TEXT,
  cgpa TEXT,
  bio TEXT,
  social_links JSONB DEFAULT '{}',
  phone TEXT,
  xp INTEGER DEFAULT 100,
  credibility_score INTEGER DEFAULT 75
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

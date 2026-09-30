-- ============================================================================
-- GroupSync: InsForge → Supabase Migration Script
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. PROFILES TABLE
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
  phone TEXT
);

CREATE TABLE IF NOT EXISTS public.user_secrets (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  password TEXT NOT NULL
);

ALTER TABLE public.user_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own secret"
  ON public.user_secrets FOR INSERT
  WITH CHECK (auth.uid() = id);

-- No SELECT policy added. No one (not even the user) can fetch these through the API.
-- Only the database admin can view this table directly in the Supabase Dashboard.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- 2. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  event TEXT,
  type TEXT,
  description TEXT,
  skills TEXT[] DEFAULT '{}',
  members INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 4,
  privacy TEXT DEFAULT 'public',
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups are viewable by everyone"
  ON public.groups FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Group admins can update their groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = admin_id);


-- 3. GROUP_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (group_id, profile_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members are viewable by everyone"
  ON public.group_members FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


-- 4. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id BIGINT REFERENCES public.groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  text TEXT,
  media JSONB,
  is_poll BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages are viewable by everyone"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Message senders can update their messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Enable realtime for messages table (for Supabase Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;


-- 5. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id BIGINT REFERENCES public.groups(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  text TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by everyone"
  ON public.tasks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tasks"
  ON public.tasks FOR DELETE
  USING (auth.role() = 'authenticated');


-- 6. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Authenticated users can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = profile_id);


-- ============================================================================
-- 7. OPTIONAL: SAMPLE DATA (SEEDING)
-- ============================================================================

-- NOTE: To insert groups, you might need a valid admin_id (profile_id). 
-- If admin_id is NULL, it's still valid according to the schema.

/*
INSERT INTO public.groups (name, event, type, description, skills, members, max_members, privacy) VALUES
('Quantum Hackers', 'Spring Hackathon', 'Hackathon', 'Building a quantum-resistant chat app using post-quantum cryptography.', '{"React", "Python", "Cryptography"}', 3, 4, 'public'),
('Design Wizards', 'UI/UX Challenge', 'Cultural', 'Redesigning the campus portal for better accessibility and modern aesthetics.', '{"Figma", "UI/UX", "Accessibility"}', 2, 3, 'public'),
('AI Models R Us', 'AI Summit', 'Technical', 'Training local LLMs on student-specific data for personalized study assistants.', '{"ML", "Python", "PyTorch"}', 4, 4, 'private'),
('Chain Breakers', 'Web3 Weekend', 'Hackathon', 'Decentralized voting app for campus elections using Ethereum smart contracts.', '{"Solidity", "Node.js", "React"}', 1, 4, 'public'),
('Game Jam Team', '48h Game Jam', 'Technical', 'Making a 2D platformer with procedurally generated levels and unique mechanics.', '{"C++", "Unity", "UI/UX"}', 2, 5, 'public'),
('Cloud Pioneers', 'AWS Innovate', 'Technical', 'Deploying serverless architectures for scalable student management systems.', '{"AWS", "Terraform", "Node.js"}', 1, 4, 'public'),
('Eco Warriors', 'Green Campus', 'Cultural', 'Organizing campus-wide environmental awareness and cleanup strategy.', '{"Leadership", "Event Management"}', 4, 10, 'public'),
('Data Ninjas', 'Data Science Fest', 'Technical', 'Real-time traffic analysis using Scikit-learn and streaming data pipelines.', '{"Python", "Pandas", "Spark"}', 2, 4, 'public'),
('Mobile Mavericks', 'App-a-thon', 'Hackathon', 'Building a cross-platform food delivery app tailored for late-night study sessions.', '{"Flutter", "Firebase", "Dart"}', 3, 4, 'public'),
('Secure Bytes', 'CyberSec Meetup', 'Technical', 'Penetration testing and security auditing of internal college network portals.', '{"Cybersecurity", "Linux", "Networking"}', 2, 3, 'public');
*/

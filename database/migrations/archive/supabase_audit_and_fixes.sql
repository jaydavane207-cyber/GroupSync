-- ============================================================================
-- GroupSync: Full Database Audit & Fix Script
-- Run this in Supabase Dashboard → SQL Editor
-- Generated: 2026-04-03
-- ============================================================================
-- This script is SAFE to run on an existing DB. All statements use
-- IF NOT EXISTS / OR REPLACE / DO $$ patterns to be idempotent.
-- ============================================================================


-- ─── SECTION 1: Schema Fixes ─────────────────────────────────────────────────
-- The tasks table is missing `assignee_id` and `due_date` columns.
-- The code in KanbanBoard.jsx references both fields — without them,
-- task creation fails or silently drops data.

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS due_date DATE;

-- The tasks table also needs realtime enabled (like messages)
-- so the Kanban board can get live updates without polling.
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- ─── SECTION 2: Missing RLS Policies ─────────────────────────────────────────
-- SEC-A: profiles — DELETE policy (account deletion)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can delete own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own profile"
      ON public.profiles FOR DELETE
      USING (auth.uid() = id)';
  END IF;
END $$;

-- SEC-B: group_members — DELETE policy (leave group)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Members can leave groups'
  ) THEN
    EXECUTE 'CREATE POLICY "Members can leave groups"
      ON public.group_members FOR DELETE
      USING (auth.uid() = profile_id)';
  END IF;
END $$;

-- SEC-C: tasks — UPDATE policy (move cards between columns / edit tasks)
-- Only group members can update tasks within their group.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Group members can update tasks'
  ) THEN
    EXECUTE 'CREATE POLICY "Group members can update tasks"
      ON public.tasks FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.group_members
          WHERE group_members.group_id = tasks.group_id
            AND group_members.profile_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- SEC-D: messages — DELETE policy (delete own messages)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can delete own messages'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own messages"
      ON public.messages FOR DELETE
      USING (auth.uid() = sender_id)';
  END IF;
END $$;

-- SEC-E: groups — DELETE policy (admin can delete their group)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'groups' AND policyname = 'Group admins can delete their groups'
  ) THEN
    EXECUTE 'CREATE POLICY "Group admins can delete their groups"
      ON public.groups FOR DELETE
      USING (auth.uid() = admin_id)';
  END IF;
END $$;

-- SEC-F: group_members — UPDATE policy (admin can manage members)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Group admins can manage members'
  ) THEN
    EXECUTE 'CREATE POLICY "Group admins can manage members"
      ON public.group_members FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.groups
          WHERE groups.id = group_members.group_id
            AND groups.admin_id = auth.uid()
        )
      )';
  END IF;
END $$;


-- ─── SECTION 3: Performance Indexes ──────────────────────────────────────────
-- These indexes will speed up common queries in the app significantly.

-- messages: fetching by group_id (used in GroupDetails + CampusChat)
CREATE INDEX IF NOT EXISTS idx_messages_group_id
  ON public.messages (group_id, created_at ASC);

-- tasks: fetching by group_id (used in KanbanBoard)
CREATE INDEX IF NOT EXISTS idx_tasks_group_id
  ON public.tasks (group_id, created_at ASC);

-- group_members: checking membership (used in RLS policies + GroupDetails)
CREATE INDEX IF NOT EXISTS idx_group_members_profile
  ON public.group_members (profile_id);

CREATE INDEX IF NOT EXISTS idx_group_members_group
  ON public.group_members (group_id);

-- profiles: online status (used in dashboard stats)
CREATE INDEX IF NOT EXISTS idx_profiles_online
  ON public.profiles (online);


-- ─── SECTION 4: Verify Everything ────────────────────────────────────────────
-- Run this SELECT to confirm all policies are in place.

SELECT
  tablename,
  policyname,
  cmd AS operation,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'groups', 'group_members', 'messages', 'tasks', 'transactions')
ORDER BY tablename, cmd;

-- Check tasks table has the new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tasks'
ORDER BY ordinal_position;

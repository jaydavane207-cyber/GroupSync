-- ============================================================================
-- Fix: Campus General Channel — Message Send Failure
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================
-- Root cause:
--   The `fix_dm_rls.sql` script (run in a previous session) replaced the
--   permissive INSERT policy ("Authenticated users can send messages") with:
--
--     CREATE POLICY "Group members can send messages" WITH CHECK (
--       auth.uid() = sender_id AND EXISTS (
--         SELECT 1 FROM group_members WHERE ... profile_id = auth.uid()
--       )
--     );
--
--   This is correct for DMs, but the Campus General group was created WITHOUT
--   auto-enrolling every authenticated user as a group_member row. So any user
--   who opens the General channel for the first time has no group_members row
--   → the EXISTS check fails → insert is blocked with an RLS error (PGRST301).
--
-- Fix 1 (SQL): Backfill all existing profiles into the General group's
--   group_members table so they already have a row when they try to message.
-- Fix 2 (code): CampusChat.jsx now upserts the user into group_members
--   every time they open the General channel (idempotent, safe to repeat).
-- ============================================================================

-- Step 1: Find the Campus General group id
-- (Used in the backfill below — verify this returns a row first)
SELECT id, name, type FROM public.groups WHERE type = 'General' OR name = 'Campus General';

-- Step 2: Backfill ALL existing profiles into the General group's membership.
-- Change the group_id if Step 1 returns a different value than expected.
-- This INSERT … ON CONFLICT DO NOTHING is safe to run multiple times.
DO $$
DECLARE
  general_group_id BIGINT;
BEGIN
  SELECT id INTO general_group_id
  FROM public.groups
  WHERE type = 'General' OR name = 'Campus General'
  LIMIT 1;

  IF general_group_id IS NULL THEN
    RAISE NOTICE 'Campus General group not found — skipping backfill.';
    RETURN;
  END IF;

  INSERT INTO public.group_members (group_id, profile_id)
  SELECT general_group_id, p.id
  FROM public.profiles p
  ON CONFLICT (group_id, profile_id) DO NOTHING;

  RAISE NOTICE 'Backfill complete for group_id = %', general_group_id;
END $$;

-- Step 3 (optional): Verify the INSERT policy is still correct for messages.
-- It should require sender_id = auth.uid() AND group membership.
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'messages' AND schemaname = 'public';

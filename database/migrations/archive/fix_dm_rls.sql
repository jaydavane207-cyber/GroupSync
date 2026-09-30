-- ============================================================================
-- DM Messages RLS Fix
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================
-- The core issue: if the `messages` table has RLS enabled but only has a
-- policy like "sender can read own messages", then User B (recipient) is
-- blocked from reading messages sent BY User A.
-- The correct policy: any member of the group can read all messages in it.
-- ============================================================================

-- Step 1: Drop any over-restrictive existing SELECT policies on messages
-- (They may only allow sender_id = auth.uid())
DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
DROP POLICY IF EXISTS "Allow users to read messages they sent" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Members can read group messages" ON public.messages;

-- Step 2: Create the correct policy:
-- A user can SELECT a message if they are a member of the group it belongs to.
-- This covers both Campus General AND private DM groups.
CREATE POLICY "Group members can read messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.group_members
      WHERE group_members.group_id = messages.group_id
        AND group_members.profile_id = auth.uid()
    )
  );

-- Step 3: Ensure the INSERT policy also uses group membership (not just sender_id)
-- This lets any group member send messages (not just the group admin).
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Allow users to send messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;

CREATE POLICY "Group members can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1
      FROM public.group_members
      WHERE group_members.group_id = messages.group_id
        AND group_members.profile_id = auth.uid()
    )
  );

-- Step 4: Ensure Campus General group members can also read
-- (The general group is 'public' type, so we also need a fallback for public groups)
CREATE POLICY "Anyone can read public group messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.groups
      WHERE groups.id = messages.group_id
        AND groups.privacy = 'public'
        AND auth.uid() IS NOT NULL
    )
  );

-- Step 5: Ensure group_members SELECT is open so the RLS JOIN above works
-- (If group_members itself blocks reads, the USING EXISTS check fails silently)
DROP POLICY IF EXISTS "Group members can view memberships" ON public.group_members;
CREATE POLICY "Group members can view memberships"
  ON public.group_members
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Step 6: Verify - run this to see all message policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'messages' AND schemaname = 'public';

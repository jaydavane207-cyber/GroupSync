-- ============================================================
-- GroupSync QA Audit: Missing RLS Policy Fixes
-- Run these in Supabase Dashboard → SQL Editor
-- ============================================================

-- SEC-2: profiles table — add DELETE policy
-- Allows users to delete their own profile row (e.g. account deletion)
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- SEC-3: group_members table — add DELETE policy
-- Allows members to leave a group (removes their own row)
CREATE POLICY "Members can leave groups"
  ON public.group_members FOR DELETE
  USING (auth.uid() = profile_id);

-- SEC-4: tasks table — add UPDATE policy
-- Allows members of a group to update tasks within their group
CREATE POLICY "Group members can update tasks"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = tasks.group_id
        AND group_members.profile_id = auth.uid()
    )
  );

-- SEC-5: messages table — add DELETE policy
-- Allows a user to delete their own messages
CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================================
-- OPTIONAL: Verify all policies are in place
-- ============================================================
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'groups', 'group_members', 'messages', 'tasks', 'transactions')
ORDER BY tablename, cmd;

-- Team and group membership RLS policies
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Groups viewable by all authenticated" ON public.groups;
CREATE POLICY "Groups viewable by all authenticated"
  ON public.groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users create groups" ON public.groups;
CREATE POLICY "Authenticated users create groups"
  ON public.groups FOR INSERT WITH CHECK (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Admins edit groups" ON public.groups;
CREATE POLICY "Admins edit groups"
  ON public.groups FOR UPDATE USING (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Group members select policy" ON public.group_members;
CREATE POLICY "Group members select policy"
  ON public.group_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users join groups policy" ON public.group_members;
CREATE POLICY "Users join groups policy"
  ON public.group_members FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users leave groups policy" ON public.group_members;
CREATE POLICY "Users leave groups policy"
  ON public.group_members FOR DELETE USING (auth.uid() = profile_id);

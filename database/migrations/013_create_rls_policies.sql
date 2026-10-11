-- 013_create_rls_policies.sql
-- Comprehensive Row Level Security (RLS) policies

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups & Members
CREATE POLICY "Groups viewable by authenticated users"
  ON public.groups FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update groups"
  ON public.groups FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Group members viewable by all"
  ON public.group_members FOR SELECT USING (true);

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can leave groups or admin remove"
  ON public.group_members FOR DELETE USING (auth.uid() = profile_id);

-- Chat & Direct Messages
CREATE POLICY "Chat messages readable by everyone"
  ON public.chat_messages FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send chat messages"
  ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view direct messages sent to or from them"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send direct messages"
  ON public.direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Friendships
CREATE POLICY "Users can view their own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Authenticated users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own friend requests"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can remove their own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

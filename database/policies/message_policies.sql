-- Message RLS policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chat messages readable by everyone" ON public.chat_messages;
CREATE POLICY "Chat messages readable by everyone"
  ON public.chat_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users send chat messages" ON public.chat_messages;
CREATE POLICY "Authenticated users send chat messages"
  ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Direct messages participants view" ON public.direct_messages;
CREATE POLICY "Direct messages participants view"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users send direct messages" ON public.direct_messages;
CREATE POLICY "Users send direct messages"
  ON public.direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

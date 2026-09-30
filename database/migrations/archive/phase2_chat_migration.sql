-- ============================================================================
-- GroupSync: Phase 2 Task 1 — Group Chat Enhancement Migration
-- Run ONCE in Supabase Dashboard → SQL Editor
-- Safe to re-run (all statements are idempotent)
-- ============================================================================

-- ─── EXTEND: MESSAGES TABLE ─────────────────────────────────────────────────
-- Add new columns for edit/delete/file features
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'; -- 'text' | 'image' | 'file'
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_size BIGINT; -- bytes
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_id BIGINT REFERENCES public.messages(id) ON DELETE SET NULL;

-- Update existing messages RLS: senders can soft-delete their own messages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Message senders can delete their messages') THEN
    CREATE POLICY "Message senders can delete their messages"
      ON public.messages FOR DELETE
      USING (auth.uid() = sender_id);
  END IF;
END $$;

-- Performance index for pagination
CREATE INDEX IF NOT EXISTS idx_messages_group_created ON public.messages (group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages (sender_id);

-- ─── TABLE: MESSAGE_REACTIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id    BIGINT NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji         TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='message_reactions' AND policyname='Reactions viewable by everyone') THEN
    CREATE POLICY "Reactions viewable by everyone"
      ON public.message_reactions FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='message_reactions' AND policyname='Authenticated users can add reactions') THEN
    CREATE POLICY "Authenticated users can add reactions"
      ON public.message_reactions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='message_reactions' AND policyname='Users can remove own reactions') THEN
    CREATE POLICY "Users can remove own reactions"
      ON public.message_reactions FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reactions_message ON public.message_reactions (message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.message_reactions (user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- ─── TABLE: READ_RECEIPTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.read_receipts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id               BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_message_id  BIGINT REFERENCES public.messages(id) ON DELETE SET NULL,
  last_read_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

ALTER TABLE public.read_receipts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='read_receipts' AND policyname='Read receipts viewable by chat members') THEN
    CREATE POLICY "Read receipts viewable by chat members"
      ON public.read_receipts FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.group_members
          WHERE group_members.group_id = read_receipts.chat_id
            AND group_members.profile_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='read_receipts' AND policyname='Users can upsert own read receipts') THEN
    CREATE POLICY "Users can upsert own read receipts"
      ON public.read_receipts FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='read_receipts' AND policyname='Users can update own read receipts') THEN
    CREATE POLICY "Users can update own read receipts"
      ON public.read_receipts FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_read_receipts_chat ON public.read_receipts (chat_id);
CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON public.read_receipts (user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.read_receipts;

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT
  table_name,
  (
    SELECT COUNT(*) FROM information_schema.columns c
    WHERE c.table_name = t.table_name AND c.table_schema = 'public'
  ) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('messages', 'message_reactions', 'read_receipts')
ORDER BY table_name;

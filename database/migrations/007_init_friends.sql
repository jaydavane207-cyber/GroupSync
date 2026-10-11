-- 007_init_friends.sql
-- Friendships and peer connections

CREATE TABLE IF NOT EXISTS public.friendships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'accepted' | 'declined'
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Row Level Security policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Users can view their own friendships') THEN
    CREATE POLICY "Users can view their own friendships"
      ON public.friendships FOR SELECT
      USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Authenticated users can send friend requests') THEN
    CREATE POLICY "Authenticated users can send friend requests"
      ON public.friendships FOR INSERT
      WITH CHECK (auth.uid() = requester_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Users can update their own friend requests') THEN
    CREATE POLICY "Users can update their own friend requests"
      ON public.friendships FOR UPDATE
      USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Users can remove their own friendships') THEN
    CREATE POLICY "Users can remove their own friendships"
      ON public.friendships FOR DELETE
      USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships (requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships (addressee_id, status);

-- Enable Realtime
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Backward compatibility view for any legacy queries referencing public.friends
CREATE OR REPLACE VIEW public.friends AS
  SELECT id, requester_id AS user_id, addressee_id AS friend_id, status, created_at
  FROM public.friendships;

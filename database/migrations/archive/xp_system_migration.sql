-- ============================================================
-- GroupSync XP System Migration
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. Add XP column to profiles (safe – skips if already exists)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;

-- 2. Event Results table — one row per placement per event
CREATE TABLE IF NOT EXISTS event_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id      UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  placement    TEXT    NOT NULL CHECK (placement IN ('1st','2nd','3rd','participant')),
  xp_awarded   INTEGER NOT NULL DEFAULT 0,
  awarded_by   UUID    REFERENCES profiles(id),   -- admin who awarded
  awarded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)                       -- one result per user per event
);

-- 3. Activity Logs table — feeds the Live Ticker
CREATE TABLE IF NOT EXISTS activity_logs (
  id         BIGSERIAL PRIMARY KEY,
  message    TEXT        NOT NULL,
  type       TEXT        NOT NULL DEFAULT 'xp'
               CHECK (type IN ('xp','rank','achievement')),
  user_id    UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  faction    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Trigger function: when a row is inserted into event_results,
--    (a) add xp to the user's profile
--    (b) write a message to activity_logs
CREATE OR REPLACE FUNCTION handle_event_result_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_user_name  TEXT;
  v_faction    TEXT;
  v_event_name TEXT;
  v_emoji      TEXT;
BEGIN
  -- Fetch user info
  SELECT name, faction INTO v_user_name, v_faction
    FROM profiles WHERE id = NEW.user_id;

  -- Fetch event/group name
  SELECT name INTO v_event_name
    FROM groups WHERE id = NEW.group_id;

  -- Award XP: increment profile xp
  UPDATE profiles
    SET xp = xp + NEW.xp_awarded
    WHERE id = NEW.user_id;

  -- Choose emoji by placement
  v_emoji := CASE NEW.placement
    WHEN '1st'         THEN '🥇'
    WHEN '2nd'         THEN '🥈'
    WHEN '3rd'         THEN '🥉'
    ELSE                    '⚡'
  END;

  -- Log the activity
  INSERT INTO activity_logs (message, type, user_id, faction)
  VALUES (
    v_emoji || ' ' || COALESCE(v_user_name, 'A student') ||
    ' placed ' || NEW.placement ||
    ' in ' || COALESCE(v_event_name, 'an event') ||
    ' — +' || NEW.xp_awarded || ' XP!',
    'xp',
    NEW.user_id,
    v_faction
  );

  RETURN NEW;
END;
$$;

-- Attach trigger (drop first to allow re-runs)
DROP TRIGGER IF EXISTS on_event_result_insert ON event_results;
CREATE TRIGGER on_event_result_insert
  AFTER INSERT ON event_results
  FOR EACH ROW EXECUTE PROCEDURE handle_event_result_insert();

-- ============================================================
-- 5. Row Level Security (RLS)
-- ============================================================

-- event_results: anyone authenticated can read; only admins
-- should insert (enforced at app level + policy below)
ALTER TABLE event_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_results_select" ON event_results;
CREATE POLICY "event_results_select"
  ON event_results FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "event_results_insert" ON event_results;
CREATE POLICY "event_results_insert"
  ON event_results FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- activity_logs: anyone authenticated can read; only the trigger
-- (service role) can insert (app-level writes blocked by policy)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_logs_select" ON activity_logs;
CREATE POLICY "activity_logs_select"
  ON activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert (the trigger runs as the
-- calling user; to use service role instead, remove this policy
-- and call the trigger via a Supabase Edge Function)
DROP POLICY IF EXISTS "activity_logs_insert" ON activity_logs;
CREATE POLICY "activity_logs_insert"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 6. Enable Realtime on the new tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE event_results;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;

-- ============================================================
-- 7. XP award values (for reference — used in the app code)
--    1st place  → 500 XP
--    2nd place  → 300 XP
--    3rd place  → 150 XP
--    Participant→  50 XP
-- ============================================================

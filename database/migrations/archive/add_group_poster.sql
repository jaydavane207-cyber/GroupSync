-- ============================================================
-- Migration: Add poster_url to groups table
-- Run this in Supabase SQL Editor → Run
-- ============================================================

-- 1. Add poster_url column (nullable text, stores public CDN URL)
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS poster_url TEXT DEFAULT NULL;

-- ============================================================
-- 2. Create the 'group-assets' storage bucket (public read)
-- Run via Supabase Dashboard → Storage → New Bucket
--   Name:   group-assets
--   Public: ✅ enabled (so poster URLs work without auth headers)
-- OR run the insert below if using service role:
-- ============================================================

-- (Optional: only works with service_role key, not anon)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('group-assets', 'group-assets', true)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Storage RLS policy: allow authenticated users to upload
-- ============================================================
-- In Supabase Dashboard → Storage → group-assets → Policies → Add policy:
--
--  Policy name : "Allow authenticated uploads"
--  Operation   : INSERT
--  Target roles: authenticated
--  Expression  : true
--
--  Policy name : "Allow public reads"
--  Operation   : SELECT
--  Target roles: (leave empty = public)
--  Expression  : true
-- ============================================================

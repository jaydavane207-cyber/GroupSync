-- ============================================================================
-- GroupSync: Cleanup Replicate Teams and Replicate Linked Groups
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eaukxgiwfzajxcpbfgfq/sql/new
-- ============================================================================

-- 1. Identify and delete replicate squads from public.teams, keeping the newest one for each (lower(name), leader_id)
WITH duplicates_to_delete AS (
  SELECT id, chat_group_id,
         ROW_NUMBER() OVER (
           PARTITION BY lower(trim(name)), leader_id
           ORDER BY created_at DESC
         ) AS rank
  FROM public.teams
)
DELETE FROM public.teams
WHERE id IN (
  SELECT id FROM duplicates_to_delete WHERE rank > 1
);

-- 2. Delete replicate Team groups with identical name and admin
WITH group_duplicates_to_delete AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY lower(trim(name)), admin_id
           ORDER BY created_at DESC
         ) AS rank
  FROM public.groups
  WHERE type = 'Team'
)
DELETE FROM public.groups
WHERE id IN (
  SELECT id FROM group_duplicates_to_delete WHERE rank > 1
);

-- 3. Verification query: Check remaining teams and groups
SELECT id, name, category, created_at, leader_id, chat_group_id FROM public.teams ORDER BY created_at DESC;
SELECT id, name, type, created_at, admin_id FROM public.groups WHERE type = 'Team' ORDER BY created_at DESC;

-- ============================================================================
-- PROPOSED performance indexes — REVIEW BEFORE APPLYING. NOT auto-applied.
-- ============================================================================
-- This file lives under docs/ (NOT supabase/migrations/) on purpose, so
-- `supabase db push` will NOT run it. To apply after review:
--   1. Copy into a new migration:
--      supabase/migrations/<timestamp>_perf_indexes.sql
--   2. Verify against the live schema (column names/types) first.
--   3. Prefer running CREATE INDEX CONCURRENTLY on a busy prod table so it
--      does not take a long ACCESS EXCLUSIVE lock. (CONCURRENTLY cannot run
--      inside a transaction, and the Supabase migration runner wraps files in
--      one — so for prod, run these by hand in the SQL editor, or split each
--      into its own transaction-less migration.)
--
-- All statements use IF NOT EXISTS and are non-destructive.
--
-- CONTEXT: most hot-path indexes ALREADY EXIST in the schema and are NOT
-- repeated here:
--   community_messages_community_created_idx  (community_id, created_at)  -- chat
--   community_members_community_user_idx      (community_id, user_id)
--   community_members_user_idx                (user_id)
--   community_polls_community_id_idx          (community_id)
--   community_poll_votes_option_id_idx / _community_poll_id_idx
--   poll_votes (poll_id, voter_key)                                       -- vote dedupe
--   chat_reports_status_idx                   (status)
-- Only the genuine gaps below are proposed.
-- ============================================================================

-- 1) poll_votes(user_id)  — HIGH VALUE
-- get_profile_stats() runs `... from public.poll_votes where user_id = p_user_id`
-- on every profile view. The only poll_votes index is (poll_id, voter_key),
-- which does NOT serve a user_id filter, so this is currently a seq scan that
-- grows with total votes. This is the single most launch-relevant gap.
CREATE INDEX IF NOT EXISTS poll_votes_user_id_idx
  ON public.poll_votes (user_id);

-- 2) user_avatar_inventory(user_id)  — MEDIUM
-- Inventory/store/profile load the current user's owned avatars filtered by
-- user_id. Confirm the table does not already have a PRIMARY KEY / UNIQUE
-- starting with user_id (e.g. PK (user_id, avatar_id)); if it does, that
-- already serves the filter and this index is redundant — skip it.
CREATE INDEX IF NOT EXISTS user_avatar_inventory_user_id_idx
  ON public.user_avatar_inventory (user_id);

-- 3) chat_reports(status, created_at desc)  — LOW (admin only)
-- The moderation queue filters by status and orders by created_at desc. The
-- existing chat_reports_status_idx covers the filter but not the ordering, so
-- Postgres still sorts. A composite index serves both. Admin-only path, low
-- traffic — nice-to-have, not launch-critical.
CREATE INDEX IF NOT EXISTS chat_reports_status_created_idx
  ON public.chat_reports (status, created_at DESC);

-- 4) community_polls(community_id, created_at desc)  — LOW / OPTIONAL
-- community_polls_community_id_idx already exists; adding created_at only helps
-- if a single community accumulates many polls and they are ordered by recency.
-- Skip unless EXPLAIN on the community-polls query shows a sort step.
CREATE INDEX IF NOT EXISTS community_polls_community_created_idx
  ON public.community_polls (community_id, created_at DESC);

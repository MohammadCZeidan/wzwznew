-- No-op placeholder. This migration was renamed to
-- 20260607120151_avatar_rewards.sql (a different timestamp, which is the
-- actual version identifier Supabase tracks). If the remote project already
-- recorded this original version as applied before the rename, its absence
-- breaks migration-history reconciliation ("remote migration versions not
-- found in local migrations directory"). Restoring an empty file with the
-- same version marker fixes that without re-running any schema changes.
SELECT 1;

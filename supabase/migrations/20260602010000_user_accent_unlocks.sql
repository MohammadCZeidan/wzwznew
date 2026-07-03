-- No-op placeholder. This migration was superseded by
-- 20260602114657_user_accent_unlocks.sql and its file was deleted from the
-- repo ("Drop superseded 20260602010000 user_accent_unlocks migration
-- file"). If the remote Supabase project already recorded this version as
-- applied before the file was deleted, its absence breaks migration-history
-- reconciliation ("remote migration versions not found in local migrations
-- directory"). Restoring an empty file with the same version marker fixes
-- that without re-running any schema changes.
SELECT 1;

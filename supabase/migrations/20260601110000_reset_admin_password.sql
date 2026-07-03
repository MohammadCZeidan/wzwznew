-- No-op placeholder. This migration's original file was added and later
-- removed from the repo on `main` (see "Harden public API and Supabase
-- access"). If the remote Supabase project already recorded this version as
-- applied before the file was deleted, its absence breaks migration-history
-- reconciliation ("remote migration versions not found in local migrations
-- directory"). Restoring an empty file with the same version marker fixes
-- that without re-running any schema changes.
SELECT 1;

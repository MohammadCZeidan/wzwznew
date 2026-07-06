-- No-op placeholder. This migration was part of a moderation feature that
-- was later fully reverted on `main` ("Revert 'Add appeals/cookie-policy
-- pages, route legal pages, hide moderated messages'"). If the remote
-- Supabase project already recorded this version as applied before the file
-- was deleted, its absence breaks migration-history reconciliation ("remote
-- migration versions not found in local migrations directory"). Restoring
-- an empty file with the same version marker fixes that without re-running
-- any schema changes.
SELECT 1;

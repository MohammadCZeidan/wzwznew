-- No-op placeholder. This migration was a duplicate superseded by
-- 20260623120100_submit_community_request_rpc.sql and its file was deleted
-- from the repo ("fix(migrations): delete original duplicate
-- 20260623120000_submit_community_request_rpc.sql"). If the remote Supabase
-- project already recorded this version as applied before the file was
-- deleted, its absence breaks migration-history reconciliation ("remote
-- migration versions not found in local migrations directory"). Restoring
-- an empty file with the same version marker fixes that without re-running
-- any schema changes.
SELECT 1;

-- One-time data reset (requested by project owner):
-- - Clear all chat messages, community polls (and their options/votes via
--   cascade), and chat reports across every community.
-- - Delete every user account except 'admin' and 'mhdzz2'. Every FK
--   referencing users.id elsewhere in the schema is ON DELETE CASCADE or
--   ON DELETE SET NULL, so this does not fail on foreign key constraints.
--
-- This is a destructive, irreversible data migration. Not a schema change.

DELETE FROM public.community_messages;
DELETE FROM public.community_polls;
DELETE FROM public.chat_reports;

DELETE FROM public.users
WHERE lower(username) NOT IN ('admin', 'mhdzz2');

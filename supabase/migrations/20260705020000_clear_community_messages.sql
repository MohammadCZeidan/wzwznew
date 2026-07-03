-- One-time cleanup (requested by project owner): wipe all chat text messages
-- across every community for a fresh, empty start. Communities, memberships,
-- and polls are intentionally left untouched.
--
-- Destructive, irreversible data migration — not a schema change.

DELETE FROM public.community_messages;

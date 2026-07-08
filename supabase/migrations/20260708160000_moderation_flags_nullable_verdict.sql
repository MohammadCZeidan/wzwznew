-- Auto-flags start life unreviewed, so verdict must be nullable.
--
-- The live moderation_flags.verdict column was NOT NULL with no default, which
-- blocked inserting a freshly auto-flagged message (verdict is only decided when
-- an admin reviews it: 'violation' / 'ok' / 'unclear'). Make it nullable so the
-- chat send path can record a flag with verdict = null (= needs review).

alter table public.moderation_flags
  alter column verdict drop not null;

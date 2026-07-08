-- Make the banned_words table accept what the admin UI actually offers.
--
-- The live table predates the current auto-moderation UI:
--   * category was NOT NULL, but the UI marks it "optional" -> null insert 400.
--   * banned_words_action_check only allowed the old lowercase set
--     (block/hold/warn) and rejected 'flag'/'shadow', so every add via the
--     Flag/Block/Shadow dropdown failed with a 23514 check violation.
--
-- Allow the current action vocabulary (block/flag/shadow) while keeping the
-- legacy hold/warn values so existing seed rows stay valid, and let category be
-- optional. Actions/categories are stored lowercase (the admin handler is fixed
-- to stop upper-casing; the frontend upper-cases only for the badge display).

alter table public.banned_words
  alter column category drop not null;

alter table public.banned_words
  drop constraint if exists banned_words_action_check;

alter table public.banned_words
  add constraint banned_words_action_check
  check (action in ('block', 'flag', 'shadow', 'hold', 'warn'));

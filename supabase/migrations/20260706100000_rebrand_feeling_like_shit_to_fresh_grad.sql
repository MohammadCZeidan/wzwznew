-- Re-theme the "I'm feeling like shit" venting room into "Fresh Grad",
-- a celebration space for new graduates. Same row/id (keeping the primary
-- key avoids touching community_members / community_messages / community_polls
-- foreign keys), just new identity + optimized cover art. Mirrors how c6/c7/c8
-- were re-themed in 20260705010000.

UPDATE public.communities SET
  abbr = 'FG',
  title = 'Fresh Grad',
  description = 'Caps off. First jobs, next moves, nerves, and wins after graduation.',
  topic = 'Just graduated — what''s next for you?',
  logo_url = '/assets/community-covers/fresh-grad.webp'
WHERE id = 'feeling-like-shit';

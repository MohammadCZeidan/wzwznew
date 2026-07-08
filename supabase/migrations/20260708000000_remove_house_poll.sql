-- Remove the "Would you want to live in this kind of house?" poll (instagram-poll-087)
-- from any already-seeded database. The seed migration no longer inserts it.
DELETE FROM public.poll_votes   WHERE poll_id = 'instagram-poll-087';
DELETE FROM public.poll_options WHERE poll_id = 'instagram-poll-087';
DELETE FROM public.polls        WHERE id      = 'instagram-poll-087';

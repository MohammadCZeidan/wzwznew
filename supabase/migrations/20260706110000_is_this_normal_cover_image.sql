-- Swap the "Is This Normal?" community cover to the new optimized webp art.
-- Cover-only change; the seed migration (20260612210000) already ran on prod.

UPDATE public.communities
SET logo_url = '/assets/community-covers/is-this-normal.webp'
WHERE id = 'is-this-normal';

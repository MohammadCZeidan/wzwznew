-- Point community cover images at the optimized .webp assets.
-- The .png files under /assets/community-covers/ now have smaller .webp
-- equivalents; swap any png cover to its webp counterpart. Idempotent and
-- scoped to community-cover paths only (svg/gif/remote covers untouched).

UPDATE public.communities
SET logo_url = replace(logo_url, '.png', '.webp')
WHERE logo_url LIKE '/assets/community-covers/%.png';

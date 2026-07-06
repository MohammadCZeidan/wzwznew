-- Serve avatar catalog images as optimized .webp. The numeric /avatars/N.png
-- originals were ~68MB total (up to 2.4MB each); the .webp versions are ~4MB
-- total. Only flips numeric /avatars/N.png paths — svg/webp/other image_url
-- values are untouched. The .png files remain on disk as a fallback, and every
-- active numeric avatar has a matching .webp, so no avatar can 404.
UPDATE public.avatar_catalog
SET image_url = regexp_replace(image_url, '^/avatars/([0-9]+)\.png$', '/avatars/\1.webp')
WHERE image_url ~ '^/avatars/[0-9]+\.png$';

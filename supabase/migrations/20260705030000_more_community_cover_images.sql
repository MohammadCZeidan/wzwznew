-- Swap in real photo covers for 7 more communities.

UPDATE public.communities SET logo_url = '/assets/community-covers/bizniz-minded.png'       WHERE id = 'bizniz-minded';
UPDATE public.communities SET logo_url = '/assets/community-covers/match-maker.png'         WHERE id = 'match-maker';
UPDATE public.communities SET logo_url = '/assets/community-covers/best-story.png'          WHERE id = 'best-story';
UPDATE public.communities SET logo_url = '/assets/community-covers/lebanese-initiatives.png' WHERE id = 'li';
UPDATE public.communities SET logo_url = '/assets/community-covers/gamer-gang.png'          WHERE id = 'gamer-gang';
UPDATE public.communities SET logo_url = '/assets/community-covers/fucking-bored.png'       WHERE id = 'fucking-bored';
UPDATE public.communities SET logo_url = '/assets/community-covers/mancave.png'             WHERE id = 'mancave';

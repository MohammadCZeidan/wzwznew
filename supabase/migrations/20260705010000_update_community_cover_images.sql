-- Swap in real photo covers for The Ick / Am I Evil? / My Weirdest Thoughts,
-- and re-theme three generic placeholder communities (c6, c7, c8) into
-- Single Mom, Job Hunter, and Graduated using new cover art.

UPDATE public.communities SET logo_url = '/assets/community-covers/the-ick.png' WHERE id = 'the-ick';
UPDATE public.communities SET logo_url = '/assets/community-covers/am-i-evil.png' WHERE id = 'am-i-evil';
UPDATE public.communities SET logo_url = '/assets/community-covers/weirdest-thoughts.png' WHERE id = 'weirdest-thoughts';

UPDATE public.communities SET
  abbr = 'SML',
  title = 'Single Mom Life',
  description = 'Real talk for single moms — the juggling act, the exhaustion, the wins nobody sees, and the support that actually helps.',
  topic = 'What''s something about single mom life nobody warns you about?',
  status = 'Active',
  locked = false,
  logo_url = '/assets/community-covers/single-mom.png'
WHERE id = 'c6';

UPDATE public.communities SET
  abbr = 'JH',
  title = 'Job Hunter',
  description = 'The job hunt, honestly — rejections, ghosting, interview nerves, and the small wins that keep you going.',
  topic = 'How''s the job hunt actually going for you right now?',
  status = 'Active',
  locked = false,
  logo_url = '/assets/community-covers/job-hunter.png'
WHERE id = 'c7';

UPDATE public.communities SET
  abbr = 'GNW',
  title = 'Graduated... Now What?',
  description = 'Life after graduation — the pressure, the uncertainty, and figuring out what actually comes next.',
  topic = 'What does life after graduation actually look like for you?',
  status = 'Active',
  locked = false,
  logo_url = '/assets/community-covers/graduated.png'
WHERE id = 'c8';

-- Let a new 'moderator' role (in addition to 'admin') warn, timeout, ban, or
-- unban users. Timeouts are temporary bans: status='banned' + banned_until in
-- the future. When banned_until has passed, server code treats the user as
-- active again (and lazily clears the flag on next check).

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'admin', 'member', 'moderator'));

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS banned_until TIMESTAMPTZ;

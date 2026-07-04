-- Backing store for the landing page waitlist (FinalCTA / early-access form).
-- POST /api/waitlist was a stub that returned 202 without persisting, so every
-- signup was silently dropped while the UI showed success. Writes go only
-- through the service-role endpoint, so no anon/authenticated grants.

CREATE TABLE IF NOT EXISTS public.landing_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'provider', 'user')),
  owner_name text,
  community_name text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS landing_waitlist_created_idx
  ON public.landing_waitlist (created_at DESC);

ALTER TABLE public.landing_waitlist ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.landing_waitlist FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';

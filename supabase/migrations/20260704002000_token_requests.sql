-- Stores user-submitted "Request Tokens" forms from the dashboard (real token
-- purchases aren't live, so users ask for a top-up instead). Writes go only
-- through the service-role /api/token-requests endpoint; no public grants.

CREATE TABLE IF NOT EXISTS public.token_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  username text,
  price_usd integer NOT NULL CHECK (price_usd IN (5, 10, 20, 50, 100)),
  reasons text[] NOT NULL DEFAULT '{}',
  note text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'fulfilled', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS token_requests_status_created_idx
  ON public.token_requests (status, created_at DESC);

ALTER TABLE public.token_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.token_requests FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';

-- Backing store for the landing page's "ask an anonymous question" section.
-- The frontend (AnonQuestionSection) POSTs to /api/anon-questions, which was
-- shipped without a table or endpoint — every submission errored. Writes go
-- only through the service-role endpoint, so no anon/authenticated grants.

CREATE TABLE IF NOT EXISTS public.anon_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected')),
  page_url text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS anon_questions_status_created_idx
  ON public.anon_questions (status, created_at DESC);

ALTER TABLE public.anon_questions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.anon_questions FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';

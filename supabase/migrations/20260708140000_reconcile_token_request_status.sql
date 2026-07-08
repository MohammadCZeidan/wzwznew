-- Reconcile the legacy status constraint on token_requests.
--
-- The live table's old `token_requests_status_check` only allowed
-- ('new','rejected','fulfilled'). The admin approval route bumps a 'new'
-- request to 'pending' before crediting (approve_token_request_atomic), so the
-- 'pending' write hit a 23514 check violation -> admin dashboard "Could not
-- update token request" (400). Reject worked only because 'rejected' was allowed.
--
-- Allow the full set of statuses the admin code actually writes:
--   new / pending  -> awaiting review (UI shows "pending")
--   approved / fulfilled -> credited (UI shows "approved")
--   rejected -> declined
--
-- token_requests is owned by welkhazen/merginggggg; applied from the linked repo
-- because that repo is not linked to this Supabase project.

alter table public.token_requests
  drop constraint if exists token_requests_status_check;

alter table public.token_requests
  add constraint token_requests_status_check
  check (status in ('new', 'pending', 'approved', 'rejected', 'fulfilled'));

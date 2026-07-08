-- Relax the legacy price cap on token_requests.
--
-- The live table still carried an old `token_requests_price_usd_check` that only
-- allowed price_usd <= 10, so every package above $10 ($18/$40/$85) failed the
-- insert with a 23514 check violation -> the /api/token-requests 500.
--
-- Replace it with a positive range so all wallet packages (5, 10, 18, 40, 85)
-- and any future custom amount are accepted. ponytail: single upper bound as a
-- sanity guard; widen if larger custom packages are ever offered.
--
-- token_requests is owned by welkhazen/merginggggg; applied from the linked repo
-- because that repo is not linked to this Supabase project.

alter table public.token_requests
  drop constraint if exists token_requests_price_usd_check;

alter table public.token_requests
  add constraint token_requests_price_usd_check
  check (price_usd > 0 and price_usd <= 100000);

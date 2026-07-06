-- Track repeated link/phone-number spam attempts in chat so the send API can
-- auto-ban repeat offenders and raise an admin-visible report (chat_reports
-- already has realtime enabled for the admin dashboard).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS spam_strikes INT NOT NULL DEFAULT 0;

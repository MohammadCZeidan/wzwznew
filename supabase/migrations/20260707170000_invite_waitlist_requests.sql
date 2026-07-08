create table if not exists public.invite_waitlist_requests (
  id uuid primary key default gen_random_uuid(),
  contact text not null,
  note text not null default '',
  source text not null default 'signup_modal',
  submitted_at timestamptz not null default now(),
  status text not null default 'pending',
  constraint invite_waitlist_requests_contact_not_blank check (length(btrim(contact)) > 0),
  constraint invite_waitlist_requests_status_valid check (status in ('pending', 'contacted', 'sent_code', 'closed'))
);

create index if not exists invite_waitlist_requests_submitted_at_idx
  on public.invite_waitlist_requests (submitted_at desc);

alter table public.invite_waitlist_requests enable row level security;

create policy "Anyone can request an invite"
  on public.invite_waitlist_requests
  for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read invite waitlist requests"
  on public.invite_waitlist_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
        and users.status <> 'banned'
    )
  );

create policy "Admins can update invite waitlist requests"
  on public.invite_waitlist_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
        and users.status <> 'banned'
    )
  );

grant insert on public.invite_waitlist_requests to anon, authenticated;
grant select, update on public.invite_waitlist_requests to authenticated;

-- Token top-up requests: a user who is out of tokens submits a request for a
-- package; an admin reviews it in the admin dashboard and grants the tokens.
-- Both apps share this Supabase project, so the request row and the grant RPC
-- are the contract between the user app and the admin dashboard.

create table if not exists public.token_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  username text not null default '',
  tokens int not null,
  price numeric(10,2) not null,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id),
  -- Only the known wallet packages may be requested, so nobody can ask for an
  -- arbitrary amount by posting a crafted insert.
  constraint token_requests_tokens_valid check (tokens in (50, 100, 200, 500, 1000)),
  constraint token_requests_status_valid check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists token_requests_status_idx
  on public.token_requests (status, requested_at desc);
create index if not exists token_requests_user_idx
  on public.token_requests (user_id, requested_at desc);

alter table public.token_requests enable row level security;

-- Users (anon session, like the invite waitlist) can submit a request.
create policy "Users can request tokens"
  on public.token_requests
  for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read token requests"
  on public.token_requests
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

create policy "Admins can update token requests"
  on public.token_requests
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

grant insert on public.token_requests to anon, authenticated;
grant select, update on public.token_requests to authenticated;

-- Admin action: grant the requested tokens to the user and mark the request
-- approved. SECURITY DEFINER so it can credit users.token_balance, but it
-- verifies the caller is an admin first. The admin dashboard calls this.
create or replace function public.approve_token_request(p_request_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req record;
  v_balance int;
begin
  if not exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and status <> 'banned'
  ) then
    return json_build_object('ok', false, 'error', 'not_admin');
  end if;

  select * into v_req from public.token_requests where id = p_request_id for update;
  if not found then
    return json_build_object('ok', false, 'error', 'not_found');
  end if;
  if v_req.status <> 'pending' then
    return json_build_object('ok', false, 'error', 'already_reviewed');
  end if;

  update public.users
    set token_balance = token_balance + v_req.tokens
    where id = v_req.user_id
    returning token_balance into v_balance;
  if v_balance is null then
    return json_build_object('ok', false, 'error', 'user_not_found');
  end if;

  update public.token_requests
    set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
    where id = p_request_id;

  return json_build_object('ok', true, 'balance', v_balance);
end;
$$;

grant execute on function public.approve_token_request(uuid) to authenticated;

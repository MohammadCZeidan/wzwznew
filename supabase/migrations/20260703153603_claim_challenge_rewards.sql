create or replace function public.claim_challenge_reward(
  p_source text,
  p_claim_key text,
  p_xp_amount integer,
  p_token_amount integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_uid uuid := public.current_user_id();
  v_claim_id uuid;
  v_award json;
  v_progress public.user_progress%rowtype;
  v_balance integer := 0;
begin
  if v_uid is null then
    return jsonb_build_object(
      'awarded', false,
      'xp', 0,
      'level', 1,
      'leveled_up', false,
      'token_balance', 0,
      'error', 'unauthorized'
    );
  end if;

  insert into public.user_xp_claims (user_id, source, claim_key, amount)
  values (v_uid, p_source, p_claim_key, greatest(0, p_xp_amount))
  on conflict (user_id, source, claim_key) do nothing
  returning id into v_claim_id;

  if v_claim_id is null then
    select * into v_progress from public.user_progress where user_id = v_uid;
    if not found then
      insert into public.user_progress (user_id) values (v_uid) on conflict (user_id) do nothing;
      select * into v_progress from public.user_progress where user_id = v_uid;
    end if;

    select token_balance into v_balance from public.users where id = v_uid;

    return jsonb_build_object(
      'awarded', false,
      'xp', coalesce(v_progress.xp, 0),
      'level', coalesce(v_progress.level, 1),
      'leveled_up', false,
      'token_balance', coalesce(v_balance, 0)
    );
  end if;

  v_award := public.award_xp(greatest(0, p_xp_amount));

  update public.users
     set token_balance = token_balance + greatest(0, p_token_amount)
   where id = v_uid
   returning token_balance into v_balance;

  return jsonb_build_object(
    'awarded', true,
    'xp', (v_award->>'xp')::integer,
    'level', (v_award->>'level')::integer,
    'leveled_up', (v_award->>'leveled_up')::boolean,
    'token_balance', coalesce(v_balance, 0)
  );
end;
$function$;

revoke execute on function public.claim_challenge_reward(text, text, integer, integer) from public;
grant execute on function public.claim_challenge_reward(text, text, integer, integer) to authenticated, service_role;

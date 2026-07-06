-- The 20260705000000 reset deletes every user except admin and mhdzz2.
-- Recreate the seeded moderator account after that reset so the documented
-- moder / moder123! login keeps working in environments that replay migrations.

DO $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id
  FROM public.users
  WHERE lower(username) = 'moder'
  LIMIT 1;

  IF v_id IS NULL THEN
    v_id := public.create_user_with_password('moder', 'moder123!');
  END IF;

  UPDATE public.users
  SET role = 'moderator',
      status = 'active'
  WHERE id = v_id;
END $$;

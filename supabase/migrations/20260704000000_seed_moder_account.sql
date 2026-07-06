-- Seed a "moder" moderator account (username: moder, password: moder123!)
-- so there is a real moderator user to test the moderator role/tools with.

DO $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE lower(username) = 'moder') THEN
    v_id := public.create_user_with_password('moder', 'moder123!');
    UPDATE public.users SET role = 'moderator' WHERE id = v_id;
  END IF;
END $$;

-- ============================================================
-- V6: Idempotent replacement of handle_new_user trigger
-- Target instance: klxzihjdnpkogwuqcuau
-- Scope: Enforce trigger-layer transaction isolation to prevent
--        auth ingress 400 errors caused by downstream schema failures
-- ============================================================

-- Step 1: Drop existing trigger first (depends on function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Reconstruct function with full exception isolation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

  -- Idempotent insert: ON CONFLICT (id) DO NOTHING prevents duplicate key
  -- violations on re-entrant trigger execution (e.g. admin user imports)
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Log full error context to Postgres server log without surfacing
    -- to the caller. RETURN NEW is unconditional — this exception block
    -- must never re-raise, ensuring the parent auth.users transaction
    -- commits regardless of public schema state.
    RAISE WARNING
      '[ethos_stream] handle_new_user failed for user id=% email=% | SQLSTATE=% | SQLERRM=%',
      NEW.id,
      NEW.email,
      SQLSTATE,
      SQLERRM;

    RETURN NEW;

END;
$$;

-- Step 4: Re-attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Backfill any auth.users rows missing from public.users
-- (repairs users created before this migration or during prior trigger failures)
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Diagnostic verification queries (review output after execution)
SELECT
  'auth.users'   AS schema_table,
  COUNT(*)       AS row_count
FROM auth.users
UNION ALL
SELECT
  'public.users' AS schema_table,
  COUNT(*)       AS row_count
FROM public.users;

-- Any non-zero result here indicates users still missing their public mirror row
-- after the backfill — investigate those specific IDs manually.
SELECT
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;

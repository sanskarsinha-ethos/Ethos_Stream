-- ============================================================
-- V7: Remediate auth trigger — idempotent replacement
-- Target instance: klxzihjdnpkogwuqcuau
-- Note: Written as V7 — V5 (rls_policies) and V6 (previous
--       trigger fix from this session) already occupy those slots.
--       Flyway will reject duplicate version numbers with a
--       checksum collision error.
-- ============================================================

-- Step 1: Drop existing trigger (depends on function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Reconstruct function with full exception isolation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.created_at, NOW())
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING
            'CRITICAL_SIDE_EFFECT_SUPPRESSED: Profile mirror insertion bypassed for UID %. Error state: %, Description: %',
            NEW.id,
            SQLSTATE,
            SQLERRM;
        RETURN NEW;
END;
$$;

-- Step 3: Re-attach trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Backfill any orphaned auth.users rows
INSERT INTO public.users (id, email, created_at)
SELECT
    au.id,
    au.email,
    COALESCE(au.created_at, NOW())
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verification
SELECT
    'auth.users'   AS schema_table,
    COUNT(*)       AS row_count
FROM auth.users
UNION ALL
SELECT
    'public.users' AS schema_table,
    COUNT(*)       AS row_count
FROM public.users;

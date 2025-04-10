-- Function to check database connection and return PostgreSQL version
CREATE OR REPLACE FUNCTION public.check_database_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN jsonb_build_object(
        'connected', true,
        'version', current_setting('server_version')
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'connected', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to get user details from auth.users table (requires admin)
CREATE OR REPLACE FUNCTION public.get_user_details(user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_data jsonb;
BEGIN
    -- Check if calling user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (
            raw_app_meta_data->>'is_admin' = 'true'
            OR raw_app_meta_data->>'admin' = 'true'
            OR is_admin = true
        )
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Get user data
    SELECT jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'phone', u.phone,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'last_sign_in_at', u.last_sign_in_at,
        'confirmed_at', u.confirmed_at,
        'email_confirmed_at', u.email_confirmed_at,
        'is_confirmed', u.is_confirmed,
        'banned_until', u.banned_until,
        'reauthentication_token', u.reauthentication_token,
        'is_sso_user', u.is_sso_user,
        'is_admin', COALESCE(u.is_admin, false),
        'email_change_token_new', u.email_change_token_new,
        'email_change', u.email_change,
        'role', u.role,
        'raw_app_meta_data', u.raw_app_meta_data,
        'raw_user_meta_data', u.raw_user_meta_data
    )
    INTO user_data
    FROM auth.users u
    WHERE u.id = user_id;

    IF user_data IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    RETURN user_data;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error fetching user details: %', SQLERRM;
END;
$$;

-- Function to toggle admin status in auth.users table (requires admin)
CREATE OR REPLACE FUNCTION public.toggle_admin_status(target_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_user_admin boolean;
BEGIN
    -- Check if calling user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (
            raw_app_meta_data->>'is_admin' = 'true'
            OR raw_app_meta_data->>'admin' = 'true'
            OR is_admin = true
        )
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Get current admin status
    SELECT COALESCE(is_admin, false) INTO is_user_admin
    FROM auth.users
    WHERE id = target_user_id;

    -- Toggle admin status
    UPDATE auth.users
    SET 
        is_admin = NOT is_user_admin,
        raw_app_meta_data = raw_app_meta_data || jsonb_build_object('is_admin', NOT is_user_admin)
    WHERE id = target_user_id;

    -- Also update public.profiles to keep in sync
    UPDATE public.profiles
    SET 
        is_admin = NOT is_user_admin,
        role = CASE WHEN NOT is_user_admin THEN 'admin' ELSE 'user' END
    WHERE id = target_user_id;

    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error toggling admin status: %', SQLERRM;
END;
$$;

-- GRANT permissions to make these functions callable
GRANT EXECUTE ON FUNCTION public.check_database_connection() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_admin_status(UUID) TO authenticated; 
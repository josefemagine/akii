-- Create a more robust version of the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Check if the required columns exist in profiles table
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'company'
  ) INTO column_exists;

  -- If the company column exists, do a full insert with all fields
  IF column_exists THEN
    INSERT INTO public.profiles (
      id, 
      email,
      role,
      status, 
      first_name,
      last_name,
      company,
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      'user',
      'active',
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'company',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      updated_at = NOW();
  ELSE
    -- Fall back to a simpler insert without the company field
    INSERT INTO public.profiles (
      id, 
      email,
      role,
      status, 
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      'user',
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      updated_at = NOW();
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error and continue (don't block user creation)
  RAISE NOTICE 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
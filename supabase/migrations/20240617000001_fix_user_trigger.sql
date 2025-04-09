-- Fix the handle_new_user function to use first_name and last_name instead of full_name

-- First get the current function definition
CREATE OR REPLACE FUNCTION fix_handle_new_user()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Drop the existing function with CASCADE to also drop dependencies
  DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
  
  -- Create a new properly structured function
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
  BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url, status)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'avatar_url',
      'active' -- Default status for new users
    ) 
    ON CONFLICT (id) DO UPDATE 
    SET email = NEW.email,
        first_name = NEW.raw_user_meta_data->>'first_name',
        last_name = NEW.raw_user_meta_data->>'last_name',
        avatar_url = NEW.raw_user_meta_data->>'avatar_url';
    
    RETURN NEW;
  END;
  $function$;
  
  -- Re-create the trigger
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    
  RAISE NOTICE 'handle_new_user function fixed to use first_name and last_name';
END;
$$;

-- Run the function to fix everything
SELECT fix_handle_new_user();

-- Drop the temporary function
DROP FUNCTION IF EXISTS fix_handle_new_user(); 
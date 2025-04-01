-- Create a simple version of the handle_new_user function with minimal fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert only the essential fields
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

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error and continue (don't block user creation)
  RAISE NOTICE 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- Add status column to profiles table for user status management (active/inactive/banned)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned', 'pending'));

-- Add index on status column for better query performance
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);

-- Add comment to column
COMMENT ON COLUMN profiles.status IS 'User account status: active, inactive, banned, or pending';

-- Update existing users to have active status
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- Update auth triggering function to include status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'active' -- Default status for new users
  ) 
  ON CONFLICT (id) DO UPDATE 
  SET email = NEW.email,
      full_name = NEW.raw_user_meta_data->>'full_name',
      avatar_url = NEW.raw_user_meta_data->>'avatar_url';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
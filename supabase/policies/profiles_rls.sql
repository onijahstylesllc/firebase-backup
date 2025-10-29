-- Enable Row Level Security for profiles table
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
CREATE POLICY "users_select_own_profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
DROP POLICY IF EXISTS "users_delete_own_profile" ON public.profiles;
CREATE POLICY "users_delete_own_profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

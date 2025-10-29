-- DEPRECATED: This file is kept for backward compatibility.
-- Please use supabase/policies/profiles_rls.sql for the complete RLS policies.

-- Enable RLS for the profiles table
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to read their own profile
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
CREATE POLICY "Enable read access for own profile" 
ON public.profiles
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);
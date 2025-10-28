-- Enable RLS for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to read their own profile
CREATE POLICY "Enable read access for own profile" 
ON public.profiles
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);
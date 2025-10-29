-- Enable Row Level Security for usage table
ALTER TABLE IF EXISTS public.usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usage data
DROP POLICY IF EXISTS "users_select_own_usage" ON public.usage;
CREATE POLICY "users_select_own_usage"
  ON public.usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own usage data
DROP POLICY IF EXISTS "users_insert_own_usage" ON public.usage;
CREATE POLICY "users_insert_own_usage"
  ON public.usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own usage data
DROP POLICY IF EXISTS "users_update_own_usage" ON public.usage;
CREATE POLICY "users_update_own_usage"
  ON public.usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own usage data
DROP POLICY IF EXISTS "users_delete_own_usage" ON public.usage;
CREATE POLICY "users_delete_own_usage"
  ON public.usage
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

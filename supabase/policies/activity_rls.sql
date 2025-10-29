-- Enable Row Level Security for activity table
ALTER TABLE IF EXISTS public.activity ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity
DROP POLICY IF EXISTS "users_select_own_activity" ON public.activity;
CREATE POLICY "users_select_own_activity"
  ON public.activity
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own activity
DROP POLICY IF EXISTS "users_insert_own_activity" ON public.activity;
CREATE POLICY "users_insert_own_activity"
  ON public.activity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own activity
DROP POLICY IF EXISTS "users_update_own_activity" ON public.activity;
CREATE POLICY "users_update_own_activity"
  ON public.activity
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own activity
DROP POLICY IF EXISTS "users_delete_own_activity" ON public.activity;
CREATE POLICY "users_delete_own_activity"
  ON public.activity
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

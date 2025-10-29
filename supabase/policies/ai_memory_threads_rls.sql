-- Enable Row Level Security for ai_memory_threads table
ALTER TABLE IF EXISTS public.ai_memory_threads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own memory threads
DROP POLICY IF EXISTS "users_select_own_memory_threads" ON public.ai_memory_threads;
CREATE POLICY "users_select_own_memory_threads"
  ON public.ai_memory_threads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own memory threads
DROP POLICY IF EXISTS "users_insert_own_memory_threads" ON public.ai_memory_threads;
CREATE POLICY "users_insert_own_memory_threads"
  ON public.ai_memory_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own memory threads
DROP POLICY IF EXISTS "users_update_own_memory_threads" ON public.ai_memory_threads;
CREATE POLICY "users_update_own_memory_threads"
  ON public.ai_memory_threads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own memory threads
DROP POLICY IF EXISTS "users_delete_own_memory_threads" ON public.ai_memory_threads;
CREATE POLICY "users_delete_own_memory_threads"
  ON public.ai_memory_threads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

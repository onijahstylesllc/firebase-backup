-- Enable Row Level Security for ai_messages table
ALTER TABLE IF EXISTS public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in their own threads
DROP POLICY IF EXISTS "users_select_own_ai_messages" ON public.ai_messages;
CREATE POLICY "users_select_own_ai_messages"
  ON public.ai_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_memory_threads
      WHERE ai_memory_threads.id = ai_messages.thread_id
      AND ai_memory_threads.user_id = auth.uid()
    )
  );

-- Policy: Users can insert messages in their own threads
DROP POLICY IF EXISTS "users_insert_own_ai_messages" ON public.ai_messages;
CREATE POLICY "users_insert_own_ai_messages"
  ON public.ai_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_memory_threads
      WHERE ai_memory_threads.id = ai_messages.thread_id
      AND ai_memory_threads.user_id = auth.uid()
    )
  );

-- Policy: Users can update messages in their own threads
DROP POLICY IF EXISTS "users_update_own_ai_messages" ON public.ai_messages;
CREATE POLICY "users_update_own_ai_messages"
  ON public.ai_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_memory_threads
      WHERE ai_memory_threads.id = ai_messages.thread_id
      AND ai_memory_threads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_memory_threads
      WHERE ai_memory_threads.id = ai_messages.thread_id
      AND ai_memory_threads.user_id = auth.uid()
    )
  );

-- Policy: Users can delete messages in their own threads
DROP POLICY IF EXISTS "users_delete_own_ai_messages" ON public.ai_messages;
CREATE POLICY "users_delete_own_ai_messages"
  ON public.ai_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_memory_threads
      WHERE ai_memory_threads.id = ai_messages.thread_id
      AND ai_memory_threads.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Supabase RLS Policies - Complete Migration
-- ============================================================================
-- This script applies Row-Level Security policies to all tables in the app
-- Run this script via Supabase CLI or SQL Editor to enable RLS protection
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
CREATE POLICY "users_select_own_profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_delete_own_profile" ON public.profiles;
CREATE POLICY "users_delete_own_profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================================
-- 2. DOCUMENTS TABLE
-- ============================================================================

ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_documents" ON public.documents;
CREATE POLICY "users_select_own_documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_documents" ON public.documents;
CREATE POLICY "users_insert_own_documents"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_documents" ON public.documents;
CREATE POLICY "users_update_own_documents"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_documents" ON public.documents;
CREATE POLICY "users_delete_own_documents"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. AI_MEMORY_THREADS TABLE
-- ============================================================================

ALTER TABLE IF EXISTS public.ai_memory_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_memory_threads" ON public.ai_memory_threads;
CREATE POLICY "users_select_own_memory_threads"
  ON public.ai_memory_threads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_memory_threads" ON public.ai_memory_threads;
CREATE POLICY "users_insert_own_memory_threads"
  ON public.ai_memory_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_memory_threads" ON public.ai_memory_threads;
CREATE POLICY "users_update_own_memory_threads"
  ON public.ai_memory_threads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_memory_threads" ON public.ai_memory_threads;
CREATE POLICY "users_delete_own_memory_threads"
  ON public.ai_memory_threads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. AI_MESSAGES TABLE
-- ============================================================================

ALTER TABLE IF EXISTS public.ai_messages ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- 5. ACTIVITY TABLE
-- ============================================================================

ALTER TABLE IF EXISTS public.activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_activity" ON public.activity;
CREATE POLICY "users_select_own_activity"
  ON public.activity
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_activity" ON public.activity;
CREATE POLICY "users_insert_own_activity"
  ON public.activity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_activity" ON public.activity;
CREATE POLICY "users_update_own_activity"
  ON public.activity
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_activity" ON public.activity;
CREATE POLICY "users_delete_own_activity"
  ON public.activity
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. USAGE TABLE
-- ============================================================================

ALTER TABLE IF EXISTS public.usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_usage" ON public.usage;
CREATE POLICY "users_select_own_usage"
  ON public.usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_usage" ON public.usage;
CREATE POLICY "users_insert_own_usage"
  ON public.usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_usage" ON public.usage;
CREATE POLICY "users_update_own_usage"
  ON public.usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_usage" ON public.usage;
CREATE POLICY "users_delete_own_usage"
  ON public.usage
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after applying the policies to verify everything is set up correctly

-- Check RLS is enabled on all tables
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('documents', 'ai_messages', 'ai_memory_threads', 'activity', 'usage', 'profiles');

-- List all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

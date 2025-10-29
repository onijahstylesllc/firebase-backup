-- Enable Row Level Security for documents table
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own documents
DROP POLICY IF EXISTS "users_select_own_documents" ON public.documents;
CREATE POLICY "users_select_own_documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own documents
DROP POLICY IF EXISTS "users_insert_own_documents" ON public.documents;
CREATE POLICY "users_insert_own_documents"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own documents
DROP POLICY IF EXISTS "users_update_own_documents" ON public.documents;
CREATE POLICY "users_update_own_documents"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own documents
DROP POLICY IF EXISTS "users_delete_own_documents" ON public.documents;
CREATE POLICY "users_delete_own_documents"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

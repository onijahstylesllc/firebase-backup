import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabaseEnv'
import type { Database } from '@/types/supabase'

let browserClient: SupabaseClient<Database> | null = null

export const createClient = (): SupabaseClient<Database> => {
  if (!browserClient) {
    browserClient = createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  return browserClient
}

export const supabase = createClient()

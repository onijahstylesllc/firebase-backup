import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please update your environment configuration.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please update your environment configuration.')
}

let browserClient: SupabaseClient | null = null

export const createClient = (): SupabaseClient => {
  if (!browserClient) {
    browserClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  }

  return browserClient
}

export const supabase = createClient()

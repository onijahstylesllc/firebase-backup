import { createClient } from '@supabase/supabase-js'

const FALLBACK_SUPABASE_URL = 'http://localhost:54321'
const FALLBACK_SUPABASE_ANON_KEY = 'public-anon-key'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Using fallback values. Supabase features may not function.');
}

export const supabase = createClient(
  supabaseUrl ?? FALLBACK_SUPABASE_URL,
  supabaseKey ?? FALLBACK_SUPABASE_ANON_KEY
)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

import { createClient } from '@supabase/supabase-js'

const FALLBACK_SUPABASE_URL = 'https://pszmwgpjwuprytrahkro.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzem13Z3Bqd3Vwcnl0cmFoa3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTM2MDYsImV4cCI6MjA3NjQ2OTYwNn0.56OQIcwoz7UwQMpaEuRfP4k7qEE1ZobPmn-aTbONLwI'

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

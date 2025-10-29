'use server'

import { cookies, headers } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'
import {
  createRouteHandlerClient as createSupabaseRouteHandlerClient,
  createServerComponentClient as createSupabaseServerComponentClient,
  createMiddlewareClient as createSupabaseMiddlewareClient,
} from '@supabase/auth-helpers-nextjs'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabaseEnv'
import type { Database } from '@/types/supabase'

const resolveRequestHeaders = (): Record<string, string> => {
  try {
    const headerList = headers()
    const result: Record<string, string> = {}

    headerList.forEach((value, key) => {
      result[key] = value
    })

    return result
  } catch {
    return {}
  }
}

const createServerClientConfig = () => ({
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_ANON_KEY,
  options: {
    global: {
      headers: resolveRequestHeaders(),
    },
  },
})

export const createServerComponentClient = () =>
  createSupabaseServerComponentClient<Database>({ cookies }, createServerClientConfig())

export const createRouteHandlerClient = () =>
  createSupabaseRouteHandlerClient<Database>({ cookies }, createServerClientConfig())

export const createMiddlewareClient = (req: NextRequest, res: NextResponse) =>
  createSupabaseMiddlewareClient<Database>({ req, res }, {
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
  })

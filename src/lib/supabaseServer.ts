'use server'

import { cookies, headers } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'
import {
  createRouteHandlerClient as createSupabaseRouteHandlerClient,
  createServerComponentClient as createSupabaseServerComponentClient,
  createMiddlewareClient as createSupabaseMiddlewareClient,
} from '@supabase/auth-helpers-nextjs'

export const createServerComponentClient = () =>
  createSupabaseServerComponentClient({ cookies })

export const createRouteHandlerClient = () =>
  createSupabaseRouteHandlerClient({ cookies, headers })

export const createMiddlewareClient = (req: NextRequest, res: NextResponse) =>
  createSupabaseMiddlewareClient({ req, res })

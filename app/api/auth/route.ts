import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabaseRouteServer } from '@/tools/server'
import { abspath, qstring } from '@/tools/helper'
import { Route } from '@/tools/config'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = supabaseRouteServer()
    await supabase.auth.exchangeCodeForSession(code)

    return NextResponse.redirect(abspath(Route.wedding))
  }

  return NextResponse.redirect(
    qstring(
      {
        code: 'forbidden-error',
        status: 401,
      },
      abspath(Route.accountSignin)
    )
  )
}

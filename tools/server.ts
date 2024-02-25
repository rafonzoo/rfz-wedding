import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import type { Database } from '@/type-supabase'
import { cache } from 'react'
import { type NextRequest } from 'next/server'
import { cookies, headers } from 'next/headers'
import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { getTranslations } from 'next-intl/server'
import {
  createRouteHandlerClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'
import { default as ZodID } from 'zod-i18n-map/locales/id/zod.json'
import { zodI18nMap } from 'zod-i18n-map'
import i18next from 'i18next'

export const supabaseServer = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
})

export const supabaseRouteServer = cache(() => {
  const cookieStore = cookies()
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
})

export const supabaseService = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>(
    { cookies: () => cookieStore },
    { supabaseKey: process.env.NEXT_PRIVATE_SUPABASE_SERVICE }
  )
})

export const zodLocale = cache(async (request: NextRequest) => {
  const requestUrl = new URL(request.url)
  const locale = requestUrl.searchParams.get('locale') ?? 'en'

  i18next.init({
    compatibilityJSON: 'v3',
    lng: locale ?? 'id',
    resources: {
      id: { zod: ZodID },
    },
  })

  z.setErrorMap(zodI18nMap)

  return {
    z,
    t: await getTranslations({ locale }),
  }
})

export const getCookie = (cookieName: string): RequestCookie | undefined => {
  const allCookiesAsString = headers().get('Set-Cookie')

  if (!allCookiesAsString) {
    return cookies().get(cookieName)
  }

  const allCookiesAsObjects = allCookiesAsString
    .split(', ')
    .map((singleCookieAsString) => parseCookie(singleCookieAsString.trim()))

  const targetCookieAsObject = allCookiesAsObjects.find(
    (singleCookieAsObject) =>
      typeof singleCookieAsObject.get(cookieName) == 'string'
  )

  if (!targetCookieAsObject) {
    return cookies().get(cookieName)
  }

  return {
    name: cookieName,
    value: targetCookieAsObject.get(cookieName) ?? '',
  }
}

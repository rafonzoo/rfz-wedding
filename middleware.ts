import type { NextRequest } from 'next/server'
import { default as createMiddleware } from 'next-intl/middleware'
import { RouteCookie, DefaultLocale as defaultLocale } from '@/tools/config'
import { localePrefix, locales, pathnames } from '@/locale/config'

export const middleware = async (req: NextRequest) => {
  const response = createMiddleware({
    defaultLocale,
    locales,
    pathnames,
    localePrefix,
    localeDetection: false,
  })(req)

  if (req.cookies.has(RouteCookie.csrf)) {
    response.cookies.delete(RouteCookie.csrf)
  }

  const token = crypto.randomUUID()
  response.cookies.set(RouteCookie.csrf, token, {
    sameSite: 'strict',
    httpOnly: true,
    path: '/',
  })

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}

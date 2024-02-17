import { type NextRequest } from 'next/server'
import { default as createMiddleware } from 'next-intl/middleware'
import { tokenize } from '@/tools/lib'
import { RouteHeader, DefaultLocale as defaultLocale } from '@/tools/config'
import { localePrefix, locales, pathnames } from '@/locale/config'
import { v4 as uuid } from 'uuid'

export const middleware = async (req: NextRequest) => {
  const response = createMiddleware({
    defaultLocale,
    locales,
    pathnames,
    localePrefix,
    localeDetection: false,
  })(req)

  tokenize.value = uuid()
  response.headers.set(RouteHeader.path, req.nextUrl.pathname)
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}

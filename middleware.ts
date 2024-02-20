import { type NextRequest } from 'next/server'
import { default as createMiddleware } from 'next-intl/middleware'
import { DefaultLocale as defaultLocale } from '@/tools/config'
import { localePrefix, locales, pathnames } from '@/locale/config'

export const middleware = async (req: NextRequest) => {
  const response = createMiddleware({
    defaultLocale,
    locales,
    pathnames,
    localePrefix,
    localeDetection: false,
  })(req)

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}

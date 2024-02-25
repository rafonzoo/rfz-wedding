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

  const locale = response.headers.get('x-middleware-request-x-next-intl-locale')
  response.headers.set(
    'X-URL-PATH',
    response.headers
      .get('x-middleware-rewrite')
      ?.replace(process.env.NEXT_PUBLIC_SITE_URL ?? '', '')
      ?.replace(`/${locale}` ?? '', '') || '/'
  )

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}

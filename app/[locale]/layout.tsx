import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { tw } from '@/tools/lib'
import { RouteDarkMode } from '@/tools/config'
import { locales } from '@/locale/config'
import { QueryProvider } from '@/components/Provider'
import Header from './header'
import Footer from './footer'
import './style.css'

// Track missmatch due to invariant time.
// process.env.TZ = 'America/Denver'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  preload: true,
})

const metadata: Metadata = {
  title: 'RFZ Wedding App',
  description: 'The best app to create your wedding invitation.',
}

const RootLayout = async ({
  children,
  ...props
}: {
  children: ReactNode
  params: { locale: string }
}) => {
  if (!locales.includes(props.params.locale)) notFound()
  const messages = await getMessages()
  const pathname = headers().get('X-URL-PATH') ?? ''

  return (
    <html
      lang={props.params.locale}
      className={tw(
        'antialiased',
        RouteDarkMode.some((path) => path === pathname) && 'dark'
      )}
    >
      <body
        className={tw(
          inter.variable,
          'min-w-[320px] font-inter text-base -tracking-base text-black [.dark_&]:bg-black [.dark_&]:text-white'
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <Header />
            {children}
            <Footer />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export { metadata }

export default RootLayout

import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { tw } from '@/tools/lib'
import { locales } from '@/locale/config'
import { QueryProvider } from '@/components/Provider'

import '@formatjs/intl-pluralrules/polyfill'
import './style.css'

// Track missmatch due to invariant time.
process.env.TZ = 'America/Denver'

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

  return (
    <html lang={props.params.locale} className='antialiased'>
      <body
        className={tw(
          inter.variable,
          'min-w-[320px] font-inter text-base -tracking-base text-black [.dark_&]:bg-black [.dark_&]:text-white'
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export { metadata }

export default RootLayout

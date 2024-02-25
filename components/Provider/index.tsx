'use client'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useMountedEffect, useRouterEffect } from '@/tools/hook'
import { iOSVersion } from '@/tools/helpers'
import { RouteDarkMode } from '@/tools/config'

export const QueryProvider: RFZ = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            enabled: false,
            retry: false,
          },
        },
      })
  )

  useMountedEffect(() => {
    const ver = iOSVersion()
    const isIOS12 = ver && ver.array[0] <= 12

    document.body.classList.toggle('ios-12', isIOS12)
  })

  useRouterEffect((pathname) => {
    document.documentElement.classList.toggle(
      'dark',
      RouteDarkMode.includes(pathname)
    )
  })

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

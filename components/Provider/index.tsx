'use client'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useMountedEffect } from '@/tools/hook'
import { iOSVersion } from '@/tools/helpers'

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

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

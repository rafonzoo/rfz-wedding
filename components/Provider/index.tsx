'use client'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useMountedEffect } from '@/tools/hook'

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
    document.body.classList.toggle(
      'pointer-not-support',
      !(window.onpointerdown !== undefined)
    )
  })

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

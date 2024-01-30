'use client'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

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
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// import type {
//   DialogMascotOption,
//   DialogMascotType,
// } from '@/WILL_DELETE/Mascot'
// import dynamic from 'next/dynamic'

// // const DialogMascot = dynamic(() => import('@/components/Dialog/Mascot'), {
// //   ssr: false,
// // })

// // const DialogAlert = dynamic(() => import('@/components/Dialog/Alert'), {
// //   ssr: false,
// // })

// export type StoreDialogAlert = {
//   severity: `${Severity}`
//   text: string
//   isShow?: boolean
//   isClosing?: boolean
// }

// export type StoreState = {
//   dialog: {
//     mascot: StoreDialogMascot
//     alert: StoreDialogAlert[]
//   }
// }

// export type StoreDialogMascot = {
//   type?: DialogMascotType
//   option?: DialogMascotOption
// }

// export const initialValue: StoreState = {
//   loading: 'idle',
//   dialog: {
//     mascot: {},
//     alert: [],
//   },
// }

// export const StoreContext = createContext<
//   [StoreState, Dispatch<SetStateAction<StoreState>>]
// >(undefined!)

// export const StoreProvider: RFZ = ({ children }) => {
//   const [state, setState] = useState(initialValue)

//   return (
//     <StoreContext.Provider value={[state, setState]}>
//       {children}
//       {/* Portal */}
//       {/* <DialogMascot />
//       <DialogAlert /> */}
//     </StoreContext.Provider>
//   )
// }

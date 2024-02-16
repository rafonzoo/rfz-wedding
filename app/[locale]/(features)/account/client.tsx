'use client'

import { useMutation, useQueryClient } from 'react-query'
import { QueryWedding } from '@wedding/config'
import { QueryAccount } from '@account/config'
import { supabaseClient, tw } from '@/tools/lib'
import { useLocaleRouter } from '@/locale/config'
import dynamic from 'next/dynamic'

const Alert = dynamic(() => import('@/components/Notification/Alert'), {
  ssr: false,
  loading: () => (
    <button className='flex h-11 w-full items-center px-3 text-red-500'>
      Keluar
    </button>
  ),
})

const AccountPageClient = () => {
  const queryClient = useQueryClient()
  const router = useLocaleRouter()
  const { mutate: signout } = useMutation({
    mutationKey: QueryAccount.accountLogout,
    mutationFn: () => supabaseClient().auth.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(QueryAccount.accountSession, void 0)
      queryClient.setQueryData(QueryWedding.weddingDetail, void 0)
      queryClient.setQueryData(QueryWedding.weddingGetAll, void 0)
      queryClient.setQueryData(QueryWedding.weddingGalleries, void 0)
      queryClient.setQueryData(QueryWedding.weddingGuests, void 0)
      queryClient.setQueryData(QueryWedding.weddingComments, void 0)
      router.refresh()
    },
  })

  return (
    <main>
      <div>
        <Alert
          title={{ children: 'Keluar dari akun?' }}
          description={{
            children: 'Anda akan keluar dari sesi ini. Lanjutkan?',
          }}
          cancel={{ children: 'Batal' }}
          action={{
            children: 'Logout',
            className: tw('bg-red-600'),
            onClick: () => signout(),
          }}
          trigger={{
            asChild: true,
            children: (
              <button className='flex h-11 w-full items-center px-3 text-red-500'>
                Keluar
              </button>
            ),
          }}
        />
      </div>
    </main>
  )
}

export default AccountPageClient

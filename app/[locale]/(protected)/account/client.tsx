'use client'

import { useMutation, useQueryClient } from 'react-query'
import { QueryWedding } from '@wedding/config'
import { QueryAccount } from '@account/config'
import { supabaseClient } from '@/tools/lib'
import { useLocaleRouter } from '@/locale/config'

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
    <div>
      <button onClick={() => signout()}>Logout</button>
    </div>
  )
}

export default AccountPageClient

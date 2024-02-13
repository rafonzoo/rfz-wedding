'use client'

import { useMutation, useQueryClient } from 'react-query'
import { supabaseClient } from '@/tools/lib'
import { Queries } from '@/tools/config'
import { useLocaleRouter } from '@/locale/config'

const AccountPageClient = () => {
  const queryClient = useQueryClient()
  const router = useLocaleRouter()
  const { mutate: signout } = useMutation({
    mutationKey: Queries.accountLogout,
    mutationFn: () => supabaseClient().auth.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(Queries.weddingGetAll, void 0)
      queryClient.setQueryData(Queries.accountSession, void 0)
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

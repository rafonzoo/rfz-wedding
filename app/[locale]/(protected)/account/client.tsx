'use client'

import { useMutation, useQueryClient } from 'react-query'
import { supabaseClient } from '@/tools/lib'
import { Queries } from '@/tools/config'
import { useLocaleRouter } from '@/locale/config'

const AccountPageClient = () => {
  const query = useQueryClient()
  const router = useLocaleRouter()
  const { mutate: signout } = useMutation({
    mutationKey: Queries.accountLogout,
    mutationFn: () => supabaseClient().auth.signOut(),
    onSuccess: () => {
      query.setQueryData(Queries.weddingGetAll, void 0)
      query.setQueryData(Queries.accountVerify, void 0)
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

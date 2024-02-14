'use client'

import type { Wedding } from '@wedding/schema'
import type { Session } from '@supabase/auth-helpers-nextjs'
import { useQuery } from 'react-query'
import { detailWeddingQuery } from '@wedding/query'
import { QueryWedding } from '@wedding/config'
import { authorizationQuery } from '@account/query'
import { QueryAccount } from '@account/config'
import { supabaseClient } from '@/tools/lib'
import { exact } from '@/tools/helpers'
import { Route } from '@/tools/config'
import { useLocaleRouter } from '@/locale/config'
import WeddingTemplate from '@wedding/components/Template'

const WeddingPageClient: RFZ<{
  wedding: Wedding
  session?: Session
  csrfToken?: string
}> = ({ wedding, session, csrfToken }) => {
  const router = useLocaleRouter()
  const detail = useQuery({
    initialData: wedding,
    queryKey: QueryWedding.weddingDetail,
    queryFn: () => detailWeddingQuery(supabaseClient(), wedding.wid),
    onError: () => router.replace(Route.notFound),
  })

  useQuery({
    initialData: session,
    queryKey: QueryAccount.accountSession,
    queryFn: () => authorizationQuery(supabaseClient()),
  })

  return <WeddingTemplate {...exact(detail.data)} csrfToken={csrfToken} />
}

export default WeddingPageClient

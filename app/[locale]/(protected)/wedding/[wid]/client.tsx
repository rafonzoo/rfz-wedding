'use client'

import type { Wedding } from '@wedding/schema'
import type { Session } from '@supabase/auth-helpers-nextjs'
import { useQuery } from 'react-query'
import { detailWeddingQuery } from '@wedding/query'
import { supabaseClient } from '@/tools/lib'
import { exact } from '@/tools/helper'
import { Queries, Route } from '@/tools/config'
import { useLocaleRouter } from '@/locale/config'
import WeddingTemplate from '@wedding/components/Template'

const WeddingEditorPageClient: RFZ<{ wedding: Wedding; session: Session }> = ({
  wedding,
  session,
}) => {
  const router = useLocaleRouter()
  const detail = useQuery({
    initialData: wedding,
    queryKey: Queries.weddingDetail,
    queryFn: () => detailWeddingQuery(supabaseClient(), wedding.wid),
    onError: () => router.replace(Route.notFound),
  })

  useQuery({
    initialData: session,
    queryKey: Queries.accountVerify,
  })

  return <WeddingTemplate {...exact(detail.data)} />
}

export default WeddingEditorPageClient

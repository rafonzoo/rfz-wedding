'use client'

import type { Wedding } from '@wedding/schema'
import type { Session } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { detailWeddingQuery } from '@wedding/query'
import { supabaseClient } from '@/tools/lib'
import { Queries, Route } from '@/tools/config'
import { useLocaleRouter } from '@/locale/config'
import WeddingTemplate from '@wedding/components/Template'

const WeddingEditorPageClient: RFZ<{ wedding: Wedding; session: Session }> = ({
  wedding,
  session,
}) => {
  const router = useLocaleRouter()
  const queryClient = useQueryClient()
  const detail = useQuery({
    initialData: wedding,
    queryKey: Queries.weddingDetail,
    queryFn: () => detailWeddingQuery(supabaseClient(), wedding.wid),
    onError: () => router.replace(Route.notFound),
  })

  const detailData = detail.data ?? wedding

  useQuery({
    initialData: session,
    queryKey: Queries.accountVerify,
  })

  useEffect(() => {
    queryClient.setQueryData<Wedding[] | undefined>(
      Queries.weddingGetAll,
      (prev) => {
        return !prev
          ? prev
          : prev.map((p) => (p.wid === detailData.wid ? detailData : p))
      }
    )
  }, [detailData, queryClient])

  return <WeddingTemplate {...detailData} />
}

export default WeddingEditorPageClient

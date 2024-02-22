import { detailWeddingQuery } from '@wedding/query'
import { RouteWedding } from '@wedding/config'
import { supabaseServer } from '@/tools/server'
import { Route } from '@/tools/config'
import { localeRedirect } from '@/locale/config'
import withAuthServer from '@/components/WrapperHoc/withAuthServer'
import WeddingEditorPageClient from './client'

const WeddingEditorPage = withAuthServer<{ wid: string }>(
  async ({ params, searchParams, session }) => {
    const wedding = await detailWeddingQuery(supabaseServer(), params.wid)
    const isDeleted = searchParams.isDeleted

    if (isDeleted) {
      return localeRedirect(RouteWedding.weddingList)
    }

    return wedding ? (
      <WeddingEditorPageClient wedding={wedding} session={session} />
    ) : (
      localeRedirect(Route.notFound)
    )
  }
)

export default WeddingEditorPage

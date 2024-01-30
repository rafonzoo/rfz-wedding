import { detailWeddingQuery } from '@wedding/query'
import { supabaseServer } from '@/tools/server'
import { Route } from '@/tools/config'
import { localeRedirect } from '@/locale/config'
import withAuthServer from '@/components/HoC/withAuthServer'
import WeddingEditorPageClient from './client'

const WeddingEditorPage = withAuthServer<{ wid: string }>(
  async ({ params, session }) => {
    const wedding = await detailWeddingQuery(supabaseServer(), params.wid)

    return wedding ? (
      <WeddingEditorPageClient wedding={wedding} session={session} />
    ) : (
      localeRedirect(Route.notFound)
    )
  }
)

export default WeddingEditorPage

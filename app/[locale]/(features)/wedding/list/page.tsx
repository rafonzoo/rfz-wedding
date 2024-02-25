import { getAllWeddingQuery } from '@wedding/query'
import { supabaseServer } from '@/tools/server'
import { Route } from '@/tools/config'
import { localeRedirect } from '@/locale/config'
import withAuthServer from '@/components/WrapperHoc/withAuthServer'
import MyWeddingPageClient from './client'

const MyWeddingPage = withAuthServer(async ({ session }) => {
  const myWedding = await getAllWeddingQuery(supabaseServer(), session.user.id)

  return !myWedding ? (
    localeRedirect(Route.notFound)
  ) : (
    <MyWeddingPageClient myWedding={myWedding} user={session.user} />
  )
})

export const metadata = {
  title: 'Undangan · Dasbor · RFZ',
}

export default MyWeddingPage

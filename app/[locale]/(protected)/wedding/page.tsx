import { getAllWeddingQuery } from '@wedding/query'
import { supabaseServer } from '@/tools/server'
import { Route } from '@/tools/config'
import { localeRedirect } from '@/locale/config'
import withAuthServer from '@/components/HoC/withAuthServer'
import MyWeddingPageClient from './client'

const MyWeddingPage = withAuthServer(async () => {
  const myWedding = await getAllWeddingQuery(supabaseServer())

  return !myWedding ? (
    localeRedirect(Route.notFound)
  ) : (
    <MyWeddingPageClient myWedding={myWedding} />
  )
})

export default MyWeddingPage

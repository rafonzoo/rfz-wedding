import { getAllWeddingQuery } from '@wedding/query'
import { supabaseServer } from '@/tools/server'
import { Route } from '@/tools/config'
import { localeRedirect } from '@/locale/config'
import withAuthServer from '@/components/WrapperHoc/withAuthServer'
import TransactionPageClient from './client'

const TransactionPage = withAuthServer(async ({ session }) => {
  const myWedding = await getAllWeddingQuery(supabaseServer(), session.user.id)
  const transaction = myWedding?.map((wedding) => wedding.payment)

  if (!myWedding || !transaction) {
    return localeRedirect(Route.notFound)
  }

  const transactions = myWedding.map((item) =>
    item.payment
      ? item.payment.map((itm) => ({
          ...itm,
          wid: item.wid,
          name: item.name,
        }))
      : []
  )

  return (
    <main>
      <TransactionPageClient transactions={transactions.flat()} />
    </main>
  )
})

export default TransactionPage

'use client'

import type { Wedding } from '@wedding/schema'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { addNewWeddingQuery, getAllWeddingQuery } from '@wedding/query'
import { supabaseClient } from '@/tools/lib'
import { Queries, Route } from '@/tools/config'
import { LocaleLink, useLocaleRouter } from '@/locale/config'

const AddNewWeddingButton = () => {
  const query = useQueryClient()
  const router = useLocaleRouter()
  const { isLoading, mutate: addNewWedding } = useMutation({
    mutationKey: Queries.weddingAddNew,
    mutationFn: addNewWeddingQuery,
    onSuccess: (data) => {
      query.setQueryData<Wedding[]>(Queries.weddingGetAll, (prev) => [
        ...(!prev ? [] : prev),
        data,
      ])

      router.push({
        pathname: Route.weddingEditor,
        params: { wid: data.wid },
      })
    },
  })

  return (
    <button onClick={() => addNewWedding()}>
      {isLoading ? 'Loading...' : 'Create new invitation'}
    </button>
  )
}

const MyWeddingPageClient: RFZ<{ myWedding: Wedding[] }> = ({ myWedding }) => {
  const { data: updatedMyWedding } = useQuery({
    queryKey: Queries.weddingGetAll,
    queryFn: () => getAllWeddingQuery(supabaseClient()),
    initialData: myWedding,
  })

  return (
    <div>
      {(updatedMyWedding ?? myWedding).map(({ wid, name, loadout }) => (
        <div key={wid}>
          <LocaleLink
            // onClick={(e) => e.preventDefault()}
            prefetch={false}
            href={{
              pathname: Route.weddingEditor,
              params: { wid },
            }}
          >
            Username: {name}
          </LocaleLink>
          <br />
          {loadout.foreground}
        </div>
      ))}

      {/* <AddNewWeddingButton /> */}
    </div>
  )
}

export default MyWeddingPageClient

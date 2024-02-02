import { weddingType } from '@wedding/schema'
import { WEDDING_COLUMN, WEDDING_ROW } from '@wedding/query'
import { getCookie, supabaseService } from '@/tools/server'
import { Route, RouteCookie } from '@/tools/config'
import { localeRedirect } from '@/locale/config'
import WeddingPageClient from './client'

const WeddingPage = async ({
  params,
  searchParams,
}: Param<{ name: string }, { to?: string }>) => {
  const supabase = supabaseService()
  const slug = searchParams.to
  const csrfToken = getCookie(RouteCookie.csrf)?.value
  const { data } = await supabase.auth.getSession()
  const { data: wedding, error } = await supabase
    .from(WEDDING_ROW)
    .select(WEDDING_COLUMN)
    .eq('name', params.name)
    .contains('guests', JSON.stringify([{ slug }]))
    .single()

  if (error || !wedding) {
    return localeRedirect(Route.notFound)
  }

  return (
    <WeddingPageClient
      wedding={weddingType.parse(wedding)}
      session={data.session ?? void 0}
      csrfToken={csrfToken}
    />
  )
}

export default WeddingPage

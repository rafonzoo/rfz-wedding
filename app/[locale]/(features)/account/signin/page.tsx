import { supabaseServer } from '@/tools/server'
import { Route } from '@/tools/config'
import { localeRedirect } from '@/locale/config'
import SigninPageClient from './client'

const SigninPage = async () => {
  const supabase = supabaseServer()
  const { data: auth, error: authError } = await supabase.auth.getSession()

  if (auth.session && !authError) {
    return localeRedirect(Route.weddingList)
  }

  return <SigninPageClient />
}

export default SigninPage

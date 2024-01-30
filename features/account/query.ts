import { supabaseClient } from '@/tools/lib'
import { abspath } from '@/tools/helper'
import { RouteApi } from '@/tools/config'

export const authorizationQuery = async (
  supabase: ReturnType<typeof supabaseClient>
) => {
  return (await supabase.auth.getSession()).data.session ?? void 0
}

export const signInWithProviderQuery = async (
  provider: 'google' | 'github' | 'azure'
) => {
  const supabase = supabaseClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      skipBrowserRedirect: true,
      redirectTo: abspath(RouteApi.auth),
      scopes: provider === 'azure' ? 'email' : void 0,
    },
  })

  return data.url ?? void 0
}

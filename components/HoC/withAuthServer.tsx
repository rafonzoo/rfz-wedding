import type { Session } from '@supabase/auth-helpers-nextjs'
import { authorizationQuery } from '@account/query'
import { supabaseServer } from '@/tools/server'
import { Route } from '@/tools/config'
import { localeRedirect } from '@/locale/config'

const withAuthServer = <T,>(
  Component: (
    props: Param<T> & { session: Session }
  ) => React.JSX.Element | Promise<React.JSX.Element>
) => {
  const AuthComponent = async (props: Param<T>) => {
    const session = await authorizationQuery(supabaseServer())

    return !session ? (
      localeRedirect(Route.accountSignin)
    ) : (
      <Component {...props} session={session} />
    )
  }

  return AuthComponent
}

export default withAuthServer

import type { ReactNode } from 'react'
import { authorizationQuery } from '@account/query'
import { supabaseServer } from '@/tools/server'
import LayoutHeader from './header'
import LayoutFooter from './footer'

const WeddingLayout = async ({ children }: { children: ReactNode }) => {
  const session = await authorizationQuery(supabaseServer())

  return (
    <div>
      <LayoutHeader session={session} />
      {children}
      <LayoutFooter defaultHidden={!session} />
    </div>
  )
}

export default WeddingLayout

import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { authorizationQuery } from '@account/query'
import { supabaseServer } from '@/tools/server'
import { RouteHeader } from '@/tools/config'
import LayoutHeader from './header'
import LayoutFooter from './footer'

const WeddingLayout = async ({ children }: { children: ReactNode }) => {
  const session = await authorizationQuery(supabaseServer())
  const pathname = headers().get(RouteHeader.path)

  return (
    <div className='mx-auto max-w-[440px]'>
      <LayoutHeader defaultPath={pathname} defaultHidden={!session} />
      {children}
      <LayoutFooter defaultPath={pathname} defaultHidden={!session} />
    </div>
  )
}

export default WeddingLayout

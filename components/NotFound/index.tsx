'use client'

import { useMountedEffect } from '@/tools/hook'
import { Route } from '@/tools/config'
import { useLocalePathname, useLocaleRouter } from '@/locale/config'

const NotFound: RFZ = () => {
  const pathname = useLocalePathname()
  const router = useLocaleRouter()

  useMountedEffect(() => {
    if (pathname !== Route.notFound) {
      router.replace(Route.notFound)
    }
  })

  return (
    <div>
      <p>Not found</p>
    </div>
  )
}

export default NotFound

import type { Database } from '@/type-supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'
import { default as ZodID } from 'zod-i18n-map/locales/id/zod.json'
import { zodI18nMap } from 'zod-i18n-map'
import { v4 as uuid } from 'uuid'
import i18next from 'i18next'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import dayjs from 'dayjs'

import 'dayjs/locale/id'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Jakarta')
dayjs.locale('id')

export { default as tw } from 'clsx'
export { dayjs as djs }
export { z }

export const supabaseClient = () => {
  return createClientComponentClient<Database>({
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })
}

export const zodClient = () => {
  if (typeof window === 'undefined') {
    return z
  }

  const pathname = window.location.pathname
  const pathnames = pathname.split('/').filter(Boolean)

  // Incase rendered on server
  let locale = 'id'

  if (pathnames[0] === 'en') {
    locale = 'en'
  }

  i18next.init({
    compatibilityJSON: 'v3',
    lng: locale,
    resources: {
      id: { zod: ZodID },
    },
  })

  z.setErrorMap(zodI18nMap)
  return z
}

export const tokenize = { value: uuid() }

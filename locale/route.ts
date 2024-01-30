import type { Pathnames } from 'next-intl/navigation'
import type { locales } from '@/locale/config'
import { Route } from '@/tools/config'

export default {
  [Route.home]: Route.home,

  [Route.notFound]: Route.notFound,

  [Route.account]: {
    en: Route.account,
    id: '/akun',
  },

  [Route.accountSignin]: {
    en: Route.accountSignin,
    id: '/akun/masuk',
  },

  [Route.wedding]: {
    en: Route.wedding,
    id: '/undangan',
  },

  [Route.weddingEditor]: {
    en: Route.weddingEditor,
    id: '/undanganku/[wid]',
  },

  [Route.weddingPublic]: {
    en: Route.weddingPublic,
    id: '/[name]',
  },
} satisfies Pathnames<typeof locales>

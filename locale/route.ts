import type { Pathnames } from 'next-intl/navigation'
import type { locales } from '@/locale/config'
import { Route } from '@/tools/config'

export default {
  [Route.home]: Route.home,

  [Route.notFound]: Route.notFound,

  [Route.termsOfUse]: {
    en: Route.termsOfUse,
    id: '/syarat-penggunaan',
  },

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

  [Route.weddingList]: {
    en: Route.weddingList,
    id: '/undangan/koleksi',
  },

  [Route.weddingHistory]: {
    en: Route.weddingHistory,
    id: '/undangan/riwayat',
  },

  [Route.weddingEditor]: {
    en: Route.weddingEditor,
    id: '/undangan/naskah/[wid]',
  },

  [Route.weddingCouple]: {
    en: Route.weddingCouple,
    id: '/undangan/pasangan/[name]',
  },
} satisfies Pathnames<typeof locales>

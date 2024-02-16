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

  [Route.weddingList]: {
    en: Route.weddingList,
    id: '/undangan/koleksi',
  },

  [Route.weddingPurchase]: {
    en: Route.weddingPurchase,
    id: '/undangan/transaksi',
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

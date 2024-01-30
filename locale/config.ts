import { createLocalizedPathnamesNavigation } from 'next-intl/navigation'
import { Dictionaries } from '@/tools/config'
import { default as pathnames } from '@/locale/route'

export { pathnames }

export const locales = Dictionaries

export const localePrefix = 'as-needed' // Default

// prettier-ignore
export const {
  redirect: localeRedirect,
  Link: LocaleLink,
  getPathname: getLocalePathname,
  usePathname: useLocalePathname,
  useRouter: useLocaleRouter,
} = createLocalizedPathnamesNavigation({
  locales,
  localePrefix,
  pathnames,
})

export type LinkType = typeof LocaleLink

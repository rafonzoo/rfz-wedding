import { createLocalizedPathnamesNavigation } from 'next-intl/navigation'
import { Dictionaries } from '@/tools/config'
import { default as pathnames } from '@/locale/route'
// @ts-expect-error No type
import replaceAll from 'string.prototype.replaceall'

if (typeof window !== 'undefined' && !String.prototype.replaceAll) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  replaceAll.shim()
}

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

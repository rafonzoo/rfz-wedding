'use client'

import { RouteAccount } from '@account/config'
import { Route, RouteNavigation } from '@/tools/config'
import { LocaleLink, useLocalePathname } from '@/locale/config'

const Footer: RF = () => {
  const pathname = useLocalePathname()
  const avoidRoute = pathname === RouteAccount.accountSignin

  if (!RouteNavigation.some((path) => path === pathname) || avoidRoute) {
    return null
  }

  return (
    <footer className='[.dark_&]:border-none [.dark_&]:bg-transparent [[data-loading]_+_&]:invisible'>
      <div className='mx-auto flex h-full max-w-[980px] items-center'>
        <div className='flex w-full flex-col px-4 py-4 text-xs tracking-base text-black/55 md:flex-row md:justify-between [.dark_&]:text-white/50'>
          <p>Copyright © 2023 rf-z.com. All right reserved.</p>
          <div className='flex space-x-1.5'>
            <p className='text-blue-600 [.dark_&]:text-blue-400'>
              <LocaleLink href={Route.termsOfUse} prefetch={false}>
                Terms of Use
              </LocaleLink>
            </p>
            <p>&middot;</p>
            <p className='pointer-events-none text-blue-600 opacity-50 [.dark_&]:text-blue-400'>
              Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

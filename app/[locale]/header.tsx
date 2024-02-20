'use client'

import { CgMenuGridO } from 'react-icons/cg'
import { RouteNavigation } from '@/tools/config'
import { useLocalePathname } from '@/locale/config'
import RFZLogo from '@/assets/svg/rfz-logo.svg'

const Header: RF = () => {
  const pathname = useLocalePathname()

  if (!RouteNavigation.some((path) => path === pathname)) {
    return null
  }

  return (
    <header className='h-12'>
      <div className='mx-auto flex h-full max-w-[980px] items-center'>
        <button className='flex h-12 w-12 items-center justify-center text-3xl'>
          <span className='-mr-2 block'>
            <RFZLogo />
          </span>
        </button>
        <button
          disabled
          className='ml-auto flex h-12 w-12 items-center justify-center text-3xl disabled:opacity-50'
        >
          <CgMenuGridO />
        </button>
      </div>
      <hr className='-mt-px border-zinc-300 [.dark_&]:border-zinc-700' />
    </header>
  )
}

export default Header

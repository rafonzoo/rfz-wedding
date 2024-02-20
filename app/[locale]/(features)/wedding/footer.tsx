'use client'

import { useRouter } from 'next/navigation'
import { tw } from '@/tools/lib'
import { useWeddingNavigator } from '@/tools/hook'
import { useLocalePathname } from '@/locale/config'

type LayoutFooterProps = {
  defaultHidden: boolean
}

const LayoutFooter: RF<LayoutFooterProps> = ({ defaultHidden }) => {
  const router = useRouter()
  const pathname = useLocalePathname()
  const items = useWeddingNavigator()
  const activeIndex = items.findIndex((item) => item.pathname === pathname)

  if (defaultHidden || activeIndex === -1) {
    return null
  }

  return (
    <footer className={tw('fixed bottom-0 left-0 right-0')}>
      <div className='mx-auto flex h-[72px] max-w-[440px] flex-col bg-zinc-100 [.dark_&]:bg-zinc-900'>
        <hr className='border-zinc-300 [.dark_&]:border-zinc-700' />
        <ul className='flex h-full w-full items-center'>
          {items.map(
            ({ title, pathname, className, Icon, ...item }, index, array) => (
              <li
                key={index}
                style={{ width: `${100 / array.length}%` }}
                className='h-full'
              >
                <button
                  {...item}
                  className='group flex h-full w-full flex-col items-center justify-center space-y-0.5 text-zinc-500 [.dark_&]:text-zinc-400'
                  onClick={() => router.push(pathname)}
                >
                  <span
                    className={tw(
                      'flex h-10 w-14 items-center justify-center rounded-full text-lg transition-[background-color] duration-300',
                      className,
                      activeIndex === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-200 [.dark_&]:bg-zinc-800'
                    )}
                  >
                    <Icon />
                  </span>
                  <span
                    className={tw(
                      'block text-xs font-semibold tracking-base',
                      activeIndex === index && 'text-blue-600 [.dark_&]:text-blue-500' // prettier-ignore
                    )}
                  >
                    {title}
                  </span>
                </button>
              </li>
            )
          )}
        </ul>
      </div>
    </footer>
  )
}

export default LayoutFooter

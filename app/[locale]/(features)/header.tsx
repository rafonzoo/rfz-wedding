'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { tw } from '@/tools/lib'
import { useRouterEffect, useWeddingNavigator } from '@/tools/hook'

type LayoutHeaderProps = {
  defaultPath: string | null
  defaultHidden: boolean
  className?: string
  avatarUrl?: string
  wrapper?: Tag<'div'>
  container?: Tag<'div'>
}

const LayoutHeader: RFZ<LayoutHeaderProps> = ({
  defaultPath,
  defaultHidden,
  children,
  className,
  avatarUrl,
  wrapper,
  container,
}) => {
  const pathname = usePathname()
  const items = useWeddingNavigator()
  const [isHidden, setIsHidden] = useState(
    !items.find((item) => item.pathname === defaultPath)?.title
  )
  const [theTitle, setTheTitle] = useState(
    items.find((item) => item.pathname === defaultPath)?.title
  )

  useRouterEffect(() => {
    const current = items.find((item) => item.pathname === pathname)

    setTheTitle(current?.title)
    setIsHidden(!current)
  })

  if (defaultHidden) {
    return null
  }

  return (
    <div
      {...container}
      className={tw(
        'relative flex border-b border-zinc-200 [.dark_&]:border-zinc-800',
        isHidden && 'hidden',
        container?.className
      )}
    >
      <div {...wrapper} className={tw('mx-4 mt-7 w-full', wrapper?.className)}>
        <div className={tw('flex items-center space-x-2 py-3', className)}>
          {/* <div className='h-8 w-8 overflow-hidden rounded-full bg-zinc-200'>
            {avatarUrl && (
              <img
                className='h-8 w-8 rounded-full bg-zinc-100'
                src={avatarUrl}
                alt='Your photo'
              />
            )}
          </div> */}
          <h2 className='text-2.5xl font-bold tracking-tight'>{theTitle}</h2>
        </div>
      </div>
      <div className='absolute right-2 top-2 flex items-center'>{children}</div>
    </div>
  )
}

export default LayoutHeader

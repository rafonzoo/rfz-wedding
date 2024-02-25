'use client'

import { tw } from '@/tools/lib'

type EmptyStateProps = {
  root?: Tag<'div'>
  wrapper?: Tag<'div'>
}

const EmptyState: RFZ<EmptyStateProps> = ({ root, wrapper, children }) => {
  return (
    <div
      {...root}
      className={tw(
        'fixed left-0 right-0 top-auto flex h-[calc(100%_-_72px_-_85px)] items-center justify-center',
        root?.className
      )}
    >
      <div
        {...wrapper}
        className={tw(
          'text-center text-sm tracking-normal text-zinc-500',
          wrapper?.className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default EmptyState

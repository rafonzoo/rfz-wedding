'use client'

import { useEffect } from 'react'
import { tw } from '@/tools/lib'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

type DropdownProps = {
  root?: DropdownMenu.DropdownMenuProps
  trigger?: DropdownMenu.DropdownMenuTriggerProps
  content?: DropdownMenu.MenuContentProps
  items?: Tag<'button'>[]
}

const Dropdown: RF<DropdownProps> = ({ root, trigger, content, items }) => {
  const isOpen = root?.open ?? root?.defaultOpen ?? false

  useEffect(() => {
    const fn = (e: Event) => {
      const parentDialog = (e.target as HTMLElement)?.closest(
        '[data-radix-popper-content-wrapper]'
      )

      if (!parentDialog) {
        root?.onOpenChange?.(false)
      }
    }

    if (isOpen && window.onpointerdown === undefined) {
      document.addEventListener('click', fn)
    }

    return () => document.removeEventListener('click', fn)
  }, [isOpen, root])

  return (
    <DropdownMenu.Root {...root}>
      <DropdownMenu.Trigger {...trigger} />
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          {...content}
          loop={content?.loop ?? true}
          className={tw(
            'relative z-[999] -ml-px flex scale-0 flex-col divide-y overflow-hidden rounded-xl border border-zinc-300 bg-white opacity-0 [.dark_&]:border-zinc-700 [.dark_&]:bg-zinc-800',
            'data-[state=closed]:animate-dropdown-hide data-[state=open]:animate-dropdown-show', // prettier-ignore
            content?.className
          )}
        >
          {items?.map((item, i) => (
            <DropdownMenu.Item key={i}>
              <button
                {...item}
                className={tw(
                  'inline-flex h-11 min-w-[272px] items-center border-zinc-300 px-4 hover:bg-zinc-100 [.dark_&]:border-zinc-700 [.dark_&]:hover:bg-zinc-700',
                  item.className
                )}
              />
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default Dropdown

import type {
  PopoverContentProps,
  PopoverPortalProps,
  PopoverRootProps,
  PopoverTriggerProps,
} from '@kobalte/core/dist/types/popover'
import type { FC } from '@app/types'
import { splitProps } from 'solid-js'
import { Popover } from '@kobalte/core'
import clsx from 'clsx'

interface iPopup {
  root?: PopoverRootProps
  trigger?: PopoverTriggerProps
  content?: PopoverContentProps
  portal?: Omit<PopoverPortalProps, 'children'>
}

const Popup: FC<iPopup> = (prop) => {
  const [props, rest] = splitProps(prop, [
    'root',
    'trigger',
    'content',
    'portal',
  ])

  return (
    <Popover.Root {...props?.root}>
      <Popover.Trigger {...props?.trigger} />
      <Popover.Portal {...props?.portal}>
        <Popover.Content
          {...props?.content}
          class={clsx(
            'outline-none will-change-[opacity,transform]',
            props?.content?.class,
            {
              'animate-popover-in': props?.root?.open,
              'animate-popover-out': !props?.root?.open,
            }
          )}
        >
          {rest.children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default Popup

import type {
  PopoverContentProps,
  PopoverPortalProps,
  PopoverRootProps,
  PopoverTriggerProps,
} from '@kobalte/core/dist/types/popover'
import type { FC } from '@app/types'
import { onCleanup, onMount } from 'solid-js'
import { Popover } from '@kobalte/core'
import clsx from 'clsx'

export interface iPopup {
  open: boolean
  onOpenChange?: (isOpen: boolean) => void
  root?: Omit<PopoverRootProps, 'open' | 'onOpenChange'>
  trigger?: PopoverTriggerProps
  content?: PopoverContentProps
  portal?: Omit<PopoverPortalProps, 'children'>
}

const Popup: FC<iPopup> = (props) => {
  function forceClose(e: Event) {
    const target = e.target as HTMLElement

    if (props.root?.modal && props.open) {
      if (!target.closest('[role="dialog"]')) {
        props.onOpenChange?.(false)
      }
    }
  }

  onMount(() => document.addEventListener('click', forceClose))
  onCleanup(() => document.removeEventListener('click', forceClose))

  return (
    <Popover.Root
      {...props?.root}
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <Popover.Trigger {...props?.trigger} />
      <Popover.Portal {...props?.portal}>
        <Popover.Content
          {...props?.content}
          class={clsx(styles.content, props?.content?.class, {
            [styles.animate_in]: props.open,
            [styles.animate_out]: !props.open,
          })}
        >
          {props.children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

const styles = {
  animate_in: clsx('animate-popover-in'),
  animate_out: clsx('animate-popover-out'),
  content: clsx(
    'overflow-hidden rounded-xl outline-none',
    'shadow-layer will-change-[opacity,transform]'
  ),
}

export default Popup

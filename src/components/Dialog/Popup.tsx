import type {
  PopoverContentProps,
  PopoverRootProps,
  PopoverTriggerProps,
} from '@kobalte/core/dist/types/popover'
import type { FC, iDialog } from '@app/types'
import { Popover } from '@kobalte/core'
import { callable } from '@app/helpers/util'
import clsx from 'clsx'

interface iPopup extends iDialog {
  props?: {
    root?: PopoverRootProps
    trigger?: PopoverTriggerProps
    content?: PopoverContentProps
  }
}

const Popup: FC<iPopup> = ({ children, show, setShow, ...rest }) => {
  return (
    <Popover.Root
      {...rest.props?.root}
      open={callable(show)}
      onOpenChange={setShow}
    >
      <Popover.Trigger {...rest.props?.trigger} />
      <Popover.Portal>
        <Popover.Content
          {...rest.props?.content}
          class={clsx('outline-none', rest.props?.content?.class, {
            'animate-popover-in': callable(show),
            'animate-popover-out': !callable(show),
          })}
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default Popup

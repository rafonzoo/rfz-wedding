import type {
  DialogCloseButtonProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogOverlayProps,
  DialogRootProps,
  DialogTitleProps,
  DialogTriggerProps,
} from '@kobalte/core/dist/types/dialog'
import type { Callable, FC, iState } from '@app/types'
import { createSignal, splitProps } from 'solid-js'
import { Dialog } from '@kobalte/core'
import { callable } from '@app/helpers/util'
import clsx from 'clsx'
import IconCircleClose from '@app/components/Icon/Circle/Close'

interface iSheet extends iState {
  label: Callable<string>
  props?: {
    root?: Omit<DialogRootProps, 'open' | 'onOpenChange'>
    title?: DialogTitleProps
    trigger?: DialogTriggerProps
    overlay?: DialogOverlayProps
    content?: DialogContentProps
    description?: DialogDescriptionProps
    closeButton?: DialogCloseButtonProps
  }
}

const Sheet: FC<iSheet> = (props) => {
  const [disableTrigger, setDisabledTrigger] = createSignal(false)
  const [{ label, show, setShow }, rest] = splitProps(props, [
    'label',
    'show',
    'setShow',
  ])

  return (
    <Dialog.Root
      {...rest.props?.root}
      open={callable(show)}
      onOpenChange={(isOpen) => !disableTrigger() && setShow(isOpen)}
    >
      <Dialog.Trigger {...rest.props?.trigger} />
      <Dialog.Portal>
        <Dialog.Overlay
          {...rest.props?.overlay}
          class={clsx(styles.overlay, rest.props?.overlay?.class)}
          role={rest.props?.overlay?.role || 'button'}
          onclick={(e) => {
            /* iOS 12 */
            !disableTrigger() && setShow(false)

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            rest.props?.overlay?.onclick?.(e)
          }}
        />
        <Dialog.Content
          {...rest.props?.content}
          class={clsx(styles.content, rest.props?.content?.class)}
          onanimationstart={(e) => {
            setDisabledTrigger(true)

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            rest.props?.overlay?.onanimationstart?.(e)
          }}
          onanimationend={(e) => {
            setDisabledTrigger(false)

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            rest.props?.overlay?.onanimationend?.(e)
          }}
        >
          <Dialog.Title {...rest.props?.title}>
            <div class={styles.header}>
              <div class={styles.title}>{callable(label)}</div>
              <Dialog.CloseButton
                {...rest.props?.closeButton}
                class={clsx(styles.close, rest.props?.closeButton?.class)}
              >
                <IconCircleClose label='Tutup panel' />
              </Dialog.CloseButton>
            </div>
          </Dialog.Title>
          <Dialog.Description
            {...rest.props?.description}
            class={clsx(styles.desc, rest.props?.description?.class)}
          >
            {rest.children}
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const styles = {
  header: clsx('relative flex min-h-[48px] items-center justify-between px-3'),
  close: clsx('ml-auto !rounded-full !text-gray-300 dark:!text-gray-500'),
  desc: clsx('h-full px-4 env-pb-4 sm:px-3 sm:pb-3'),
  overlay: clsx(
    'fixed left-0 top-0 z-40 h-full w-full animate-overlay-out bg-black',
    'opacity-50 translate-z-0 data-[expanded]:animate-overlay-in'
  ),
  content: clsx(
    'fixed z-50 flex w-full flex-col bg-white dark:bg-gray-900',
    'backface-hidden max-sm:bottom-0 max-sm:left-0 max-sm:animate-slide-down',
    'data-[expanded]:max-sm:animate-slide-up data-[expanded]:sm:animate-dialog-in',
    'sm:left-1/2 sm:top-1/2 sm:animate-dialog-out sm:translate-3d-center'
  ),
  title: clsx(
    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold',
    'text-black dark:text-white'
  ),
}

export default Sheet

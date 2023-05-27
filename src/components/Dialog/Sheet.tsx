import type { Component, JSX } from 'solid-js'
import type { Callable, iDialog } from '@app/types'
import { createEffect, createSignal } from 'solid-js'
import { Dialog } from '@kobalte/core'
import { callable, delay } from '@app/helpers/util'
import clsx from 'clsx'
import IconCircleClose from '@app/components/Icon/Circle/Close'
import ButtonIcon from '@app/components/Button/Icon'

interface iSheet extends iDialog {
  title?: Callable<string>
  children?: JSX.Element
  trigger?: JSX.Element
  classes?: {
    trigger?: string
    body?: string
  }
}

const Sheet: Component<iSheet> = ({
  classes,
  show,
  setShow,
  title,
  trigger,
  ...props
}) => {
  const [canToggle, setCanToggle] = createSignal(true)

  function controlledTrigger(isOpen: boolean): void {
    return void (canToggle() && setShow(isOpen))
  }

  createEffect(async () => {
    callable(show) // Reactor
    setCanToggle(false)

    await delay(560)
    setCanToggle(true)
  })

  return (
    <Dialog.Root open={callable(show)} onOpenChange={controlledTrigger}>
      <Dialog.Trigger as={ButtonIcon} class={clsx(classes?.trigger)}>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          class={styles.overlay}
          onclick={() => controlledTrigger(false)} /* iOS 12 */
          role='button'
        />
        <Dialog.Content class={styles.content}>
          <Dialog.Title>
            <div class={styles.header}>
              <div class={styles.title}>{callable(title)}</div>
              <Dialog.CloseButton as={ButtonIcon} class={styles.close}>
                <IconCircleClose label='Tutup panel' />
              </Dialog.CloseButton>
            </div>
          </Dialog.Title>
          <Dialog.Description as='div' class={clsx(styles.desc, classes?.body)}>
            {props.children}
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
    'fixed z-50 flex w-full flex-col rounded-t-3xl bg-white dark:bg-gray-900',
    'backface-hidden max-sm:bottom-0 max-sm:left-0 max-sm:animate-slide-down',
    'data-[expanded]:max-sm:animate-slide-up data-[expanded]:sm:animate-dialog-in',
    'sm:left-1/2 sm:animate-dialog-out sm:rounded-lg sm:translate-3d-center',
    'sm:top-1/2 sm:max-w-[390px]'
  ),
  title: clsx(
    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold',
    'text-black dark:text-white'
  ),
}

export default Sheet

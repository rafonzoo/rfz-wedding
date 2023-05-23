import type { Component, JSX } from 'solid-js'
import type { Callable, iDialog } from '@app/types'
import { createEffect, createSignal } from 'solid-js'
import { Dialog } from '@kobalte/core'
import { callable, delay } from '@app/helpers/util'
import IconCloseCircle from '@app/components/Icon/CloseCircle'
import ButtonIcon from '@app/components/Button/Icon'

interface iSheet extends iDialog {
  title?: Callable<string>
  children?: JSX.Element
  trigger?: JSX.Element
  triggerClass?: string
}

const Sheet: Component<iSheet> = ({
  show,
  setShow,
  title,
  trigger,
  triggerClass,
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
      <Dialog.Trigger as={ButtonIcon} class={triggerClass}>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          class='translate-z-0 fixed left-0 top-0 z-40 h-full w-full animate-overlay-out bg-black opacity-50 data-[expanded]:animate-overlay-in'
          /* iOS 12 */
          onclick={() => controlledTrigger(false)}
          role='button'
        />
        <Dialog.Content class='backface-hidden sm:translate-3d-center fixed z-50 flex w-full flex-col rounded-t-3xl bg-white dark:bg-gray-900 max-sm:bottom-0 max-sm:left-0 max-sm:animate-slide-down data-[expanded]:max-sm:animate-slide-up sm:left-1/2 sm:top-1/2 sm:max-w-[390px] sm:animate-dialog-out sm:rounded-lg data-[expanded]:sm:animate-dialog-in'>
          <Dialog.Title>
            <div class='relative flex min-h-[48px] items-center justify-between px-3'>
              <div class='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-black dark:text-white'>
                {callable(title)}
              </div>
              <Dialog.CloseButton
                as={ButtonIcon}
                class='ml-auto !rounded-full text-gray-300 dark:text-gray-500'
              >
                <IconCloseCircle label='Tutup panel' />
              </Dialog.CloseButton>
            </div>
          </Dialog.Title>
          <Dialog.Description
            as='div'
            class='h-full px-4 sm:px-3 sm:pb-3'
            style={{
              'padding-bottom': 'max(env(safe-area-inset-bottom), 16px)',
            }}
          >
            {props.children}
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Sheet

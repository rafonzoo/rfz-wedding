import type { Component, JSX } from 'solid-js'
import type { Callable, iDialog } from '@app/types'
import { splitProps } from 'solid-js'
import { Dialog } from '@kobalte/core'
import { callable } from '@app/helpers/util'
import IconClose from '@app/components/Icon/Close'

interface iSheet extends iDialog {
  title?: Callable<string>
  children?: JSX.Element
  triggerRef?: HTMLButtonElement
}

const Sheet: Component<iSheet> = (props) => {
  const [{ show, setShow, title, triggerRef }, rest] = splitProps(props, [
    'show',
    'setShow',
    'title',
    'triggerRef',
  ])

  return (
    <Dialog.Root open={callable(show)} onOpenChange={setShow}>
      {/* <Dialog.Trigger... */}
      <Dialog.Portal>
        <Dialog.Overlay
          class='fixed left-0 top-0 z-40 h-full w-full animate-overlay-out bg-black opacity-50 data-[expanded]:animate-overlay-in'
          onclick={() => setShow(false)}
          role='button' /* iOS 12 */
        />
        <Dialog.Content
          onCloseAutoFocus={() => triggerRef?.focus()}
          class='dialog-sheet fixed z-50 flex w-full flex-col rounded-t-3xl bg-white dark:bg-gray-900 max-sm:bottom-0 max-sm:left-0 max-sm:animate-slide-down data-[expanded]:max-sm:animate-slide-up sm:left-1/2 sm:top-1/2 sm:max-w-[390px] sm:animate-dialog-out sm:rounded-lg data-[expanded]:sm:animate-dialog-in'
        >
          <Dialog.Title>
            <div class='relative flex min-h-[48px] items-center justify-between px-3'>
              <div class='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-black dark:text-white'>
                {callable(title)}
              </div>
              <Dialog.CloseButton class='ml-auto h-6 w-6 rounded-full text-gray-300 dark:text-gray-500'>
                <IconClose />
              </Dialog.CloseButton>
            </div>
          </Dialog.Title>
          <Dialog.Description as='div' class='h-full px-4 pb-9 sm:px-3 sm:pb-3'>
            {rest.children}
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Sheet

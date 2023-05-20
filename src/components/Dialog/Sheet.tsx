import type { Component, JSX } from 'solid-js'
import type { Callable, iDialog } from '@app/types'
import { createEffect, splitProps } from 'solid-js'
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

  function closeSheet() {
    setShow(false)
    document.body.removeAttribute('style')
  }

  createEffect(() => {
    console.log(callable(show))
  })

  return (
    <Dialog.Root open={callable(show)} forceMount>
      {/* <Dialog.Trigger... */}
      <Dialog.Portal>
        <Dialog.Overlay
          onClick={closeSheet}
          class='invisible fixed left-0 top-0 z-40 h-full w-full bg-black opacity-0 transition-fade duration-hero ease-hero data-[expanded]:visible data-[expanded]:opacity-75'
        />
        <Dialog.Content
          onCloseAutoFocus={() => triggerRef?.focus()}
          data-active={callable(show)}
          class='dialog-sheet invisible fixed z-50 flex w-full translate-y-full flex-col rounded-t-3xl bg-white transition-fade duration-hero ease-hero data-[expanded]:visible dark:bg-gray-900 max-sm:bottom-0 max-sm:left-0 data-[expanded]:max-sm:translate-y-0 sm:left-1/2 sm:top-1/2 sm:max-w-[390px] sm:rounded-lg'
        >
          <Dialog.Title>
            <div class='relative flex min-h-[48px] items-center justify-between px-3'>
              <div class='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-black dark:text-white'>
                {callable(title)}
              </div>
              <Dialog.CloseButton
                class='ml-auto h-6 w-6 rounded-full text-gray-300 dark:text-gray-500'
                onClick={closeSheet}
              >
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

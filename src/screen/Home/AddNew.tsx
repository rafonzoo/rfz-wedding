import type { Component } from 'solid-js'
import type { iDialog } from '@app/types'
import { createSignal, splitProps } from 'solid-js'
import { text } from '@app/helpers/trans'
import IconPaper from '@app/components/Icon/Paper'
import Sheet from '@app/components/Dialog/Sheet'
import Button from '@app/components/Button'

interface AddNewSheetProps extends iDialog {
  element?: HTMLButtonElement
}

const [addNewMethod, setAddNewMethod] = createSignal('template')

const AddNewSheet: Component<AddNewSheetProps> = (props) => {
  const addNewSheetOption = ['template', 'blank'] as const
  const [{ element }, rest] = splitProps(props, ['element'])

  return (
    <Sheet
      title={() => text('newInvitation')}
      triggerRef={element}
      show={rest.show}
      setShow={rest.setShow}
    >
      {addNewSheetOption.map((item, index) => (
        <button
          class='group flex h-[100px] w-full appearance-none items-center rounded-lg border bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800'
          onclick={() => setAddNewMethod(item)}
          classList={{
            'mt-3': index > 0,
            'outline outline-2 -outline-offset-1 outline-blue-400':
              addNewMethod() === item,
          }}
        >
          <IconPaper
            size={32}
            class='mb-auto mt-1'
            filled={item === 'template'}
          />
          <span class='ml-4 block flex-1 text-left'>
            <span class='font-semibold'>
              {item === 'template' ? text('fromTemplate') : text('fromScratch')}
            </span>
            <span class='mt-1 line-clamp-2 text-sm tracking-normal text-gray-600 dark:text-gray-400'>
              {text('dummy')}
            </span>
          </span>
        </button>
      ))}
      <Button class='mt-3' model='action'>
        {text('buat')}
      </Button>
    </Sheet>
  )
}

export default AddNewSheet

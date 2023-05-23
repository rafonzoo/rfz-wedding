import type { Component } from 'solid-js'
import type { iDialog } from '@app/types'
import { createSignal } from 'solid-js'
import { text } from '@app/helpers/trans'
import IconPlus from '@app/components/Icon/Plus'
import IconPaper from '@app/components/Icon/Paper'
import Sheet from '@app/components/Dialog/Sheet'
import ButtonIcon from '@app/components/Button/Icon'
import ButtonBase from '@app/components/Button/Base'
import Button from '@app/components/Button'

interface AddNewSheetProps extends iDialog {
  element?: HTMLButtonElement
}

const AddNewSheet: Component<AddNewSheetProps> = ({ show, setShow }) => {
  const [addNewMethod, setAddNewMethod] = createSignal('template')
  const addNewSheetOption = ['template', 'blank'] as const

  return (
    <Sheet
      show={show}
      setShow={setShow}
      title={() => text('newInvitation')}
      trigger={
        <ButtonIcon
          class='px-1 py-1'
          icon={<IconPlus label='Tambah undangan' />}
        />
      }
    >
      {addNewSheetOption.map((item, index) => (
        <ButtonBase
          class='group h-[100px] w-full border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800'
          onclick={() => setAddNewMethod(item)}
          classList={{
            'mt-3': index > 0,
            'shadow-outline': addNewMethod() === item,
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
        </ButtonBase>
      ))}
      <Button class='mt-3' model='action'>
        {text('buat')}
      </Button>
    </Sheet>
  )
}

export default AddNewSheet

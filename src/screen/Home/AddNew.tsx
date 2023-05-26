import type { Component } from 'solid-js'
import type { iDialog } from '@app/types'
import { createSignal } from 'solid-js'
import { text } from '@app/helpers/trans'
import clsx from 'clsx'
import IconPlus from '@app/components/Icon/Plus'
import IconPaper from '@app/components/Icon/PaperColored'
import Sheet from '@app/components/Dialog/Sheet'
import ButtonBase from '@app/components/Button/Base'
import Button from '@app/components/Button'

interface AddNewSheetProps extends iDialog {
  element?: HTMLButtonElement
}

const ButtonAddNew: Component<AddNewSheetProps> = ({ show, setShow }) => {
  const [addNewMethod, setAddNewMethod] = createSignal('template')
  const addNewSheetOption = ['template', 'blank'] as const

  return (
    <Sheet
      show={show}
      setShow={setShow}
      title={text.bind(null, 'newInvitation')}
      trigger={<IconPlus class='m-1' />}
      classes={{ trigger: '-mr-1 ml-auto', body: 'space-y-3' }}
    >
      {addNewSheetOption.map((item) => (
        <ButtonBase
          onclick={() => setAddNewMethod(item)}
          class={clsx(styles.button, {
            [styles.focused]: addNewMethod() === item,
          })}
        >
          <IconPaper
            size={32}
            class='mb-auto mt-1'
            filled={item === 'template'}
          />
          <span class={styles.headline}>
            <span class='font-semibold'>
              {item === 'template' ? text('fromTemplate') : text('fromScratch')}
            </span>
            <span class={styles.description}>{text('dummy')}</span>
          </span>
        </ButtonBase>
      ))}
      <Button class='mt-3' model='action'>
        {text('buat')}
      </Button>
    </Sheet>
  )
}

const styles = {
  focused: '[&:not(:focus-visible)]:shadow-outline',
  headline: 'ml-4 block flex-1 text-left',
  description: clsx(
    'mt-1 line-clamp-2 text-sm tracking-normal',
    'text-gray-600 dark:text-gray-400'
  ),
  button: clsx(
    'h-[100px] w-full border border-gray-300 bg-gray-100 p-4',
    'dark:border-gray-700 dark:bg-gray-800'
  ),
}

export default ButtonAddNew

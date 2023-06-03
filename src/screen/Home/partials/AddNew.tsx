import type { Component } from 'solid-js'
import type { iDialog } from '@app/types'
import { createSignal } from 'solid-js'
import { createHook, text } from '@app/helpers'
import clsx from 'clsx'
import IconPlus from '@app/components/Icon/Plus'
import IconPaper from '@app/components/Icon/Colored/Paper'
import Sheet from '@app/components/Dialog/Sheet'
import ButtonBase from '@app/components/Button/Base'
import Button from '@app/components/Button'

interface AddNewSheetProps extends iDialog {
  element?: HTMLButtonElement
}

const addNewSheetOption = ['template', 'blank'] as const

const ButtonAddNew: Component<AddNewSheetProps> = ({ show, setShow }) => {
  const [addNewMethod, setAddNewMethod] = createSignal('template')
  const { screen } = createHook()

  return (
    <>
      <Sheet
        show={show}
        setShow={setShow}
        title={text.bind(null, 'newInvitation')}
        trigger={<IconPlus class='m-1' />}
        classes={{
          trigger: styles.sheet_trigger,
          body: styles.sheet_body,
          content: styles.sheet_content,
        }}
      >
        {addNewSheetOption.map((item) => (
          <ButtonBase
            onclick={() => setAddNewMethod(item)}
            class={clsx(styles.button, {
              'shadow-outline': addNewMethod() === item,
            })}
          >
            <IconPaper
              size={32}
              class='mb-auto mt-1'
              filled={item === 'template'}
            />
            <span class={styles.headline}>
              <span class='font-semibold'>
                {item === 'template'
                  ? text('fromTemplate')
                  : text('fromScratch')}
              </span>
              <span class={styles.description}>{text('dummy')}</span>
            </span>
          </ButtonBase>
        ))}
        <Button
          class='mt-3'
          model='action'
          onclick={() =>
            screen({
              name: 'editor',
              delay: 'panel',
              params: { from: addNewMethod() },
              callback: () => setShow(false),
            })
          }
        >
          {text('buat')}
        </Button>
      </Sheet>
    </>
  )
}

const styles = {
  sheet_trigger: clsx('-mr-1 ml-auto'),
  sheet_body: clsx('space-y-3'),
  sheet_content: clsx('rounded-t-3xl sm:max-w-[390px] sm:rounded-lg'),
  headline: clsx('ml-4 block flex-1 text-left'),
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

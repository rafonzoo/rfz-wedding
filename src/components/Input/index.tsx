import type { TextFieldInputProps } from '@kobalte/core/dist/types/text-field'
import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, createUniqueId } from 'solid-js'
import { TextField } from '@kobalte/core'
import clsx from 'clsx'
import dayjs from 'dayjs'
import Popup from '@app/components/Dialog/Popup'
import Calendar from '@app/components/Calendar'
import ButtonBase from '@app/components/Button/Base'

const FORMAT_DATE = 'YYYY-MM-DD'
const FORMAT_TIME = 'YYYY-MM-DDThh:mm'

interface InputProps extends Omit<TextFieldInputProps, 'ref'> {
  value?: string | number
}

const InputPicker: FC<InputProps> = (props) => {
  const format = props.type === 'date' ? FORMAT_DATE : FORMAT_TIME
  const instance = dayjs(props.value).format(format)

  const id = createUniqueId()
  const [state, setState] = createStore({
    showCalendar: false,
    value: props.value ? instance : '',
  })

  let inputField: HTMLInputElement

  function eventDispatcher(type: string) {
    const event = new InputEvent(type, {
      view: window,
      bubbles: true,
      cancelable: true,
      data: state.value,
    })

    if (!inputField.dispatchEvent(event)) {
      return
    }
  }

  createEffect(() => eventDispatcher('change'))

  return (
    <Popup
      open={state.showCalendar}
      onOpenChange={(isOpen) => setState('showCalendar', isOpen)}
      content={{ class: '!shadow-none' }}
      trigger={{
        as: 'div',
        class: 'inline-flex',
        children: (
          <>
            <InputBase
              {...props}
              ref={(el) => (inputField = el)}
              value={state.value ?? undefined}
              class={clsx('peer sr-only', props.class)}
            />
            <ButtonBase class='peer-invalid:text-red-500'>
              {state.value === '' ? format : state.value}
            </ButtonBase>
          </>
        ),
      }}
    >
      <Calendar
        id={props.id || id}
        value={props.value}
        max={props.max}
        min={props.min}
        type={props.type}
        onclose={() => setState('showCalendar', false)}
        onchange={(val) => setState('value', val)}
      />
    </Popup>
  )
}

const InputBase: FC<TextFieldInputProps> = (props) => {
  return (
    <TextField.Input {...props} class={clsx(props.class, 'appearance-none')} />
  )
}

const Input: FC<InputProps> = (props) => {
  return (
    <TextField.Root>
      {props.type === 'date' || props.type === 'datetime-local' ? (
        <InputPicker {...props} />
      ) : (
        <InputBase {...props} />
      )}
    </TextField.Root>
  )
}

export default Input

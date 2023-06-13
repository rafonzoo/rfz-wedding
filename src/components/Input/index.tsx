import type { TextFieldInputProps } from '@kobalte/core/dist/types/text-field'
import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, createUniqueId } from 'solid-js'
import { TextField } from '@kobalte/core'
import dayjs from 'dayjs'
import Popup from '@app/components/Dialog/Popup'
import DatePicker from '@app/components/DatePicker'

const FORMAT_DATE = 'YYYY-MM-DD'
const FORMAT_TIME = 'YYYY-MM-DDThh:mm'

interface InputProps extends Omit<TextFieldInputProps, 'ref'> {
  value?: string | number
}

const TheDatePicker: FC<InputProps> = (props) => {
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
      trigger={{
        as: 'div',
        class: 'inline-flex',
        children: (
          <TextField.Input
            {...props}
            ref={(el) => (inputField = el)}
            value={state.value ?? undefined}
            onclick={(e) => {
              e.preventDefault()

              // @ts-expect-error solid problem
              props.onclick?.(e)
            }}
          />
        ),
      }}
    >
      <DatePicker
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

const Input: FC<InputProps> = (props) => {
  // const [, prop] = splitProps(props, ['ondatechange'])

  return (
    <TextField.Root>
      {props.type === 'date' || props.type === 'datetime-local' ? (
        <TheDatePicker {...props} />
      ) : (
        <TextField.Input {...props} />
      )}
    </TextField.Root>
  )
}

export default Input

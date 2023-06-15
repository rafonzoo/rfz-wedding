import type { TextFieldInputProps } from '@kobalte/core/dist/types/text-field'
import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, createUniqueId } from 'solid-js'
import { TextField } from '@kobalte/core'
import { FORMAT } from '@app/helpers/const'
import clsx from 'clsx'
import Popup from '@app/components/Dialog/Popup'
import Calendar from '@app/components/Calendar'
import ButtonBase from '@app/components/Button/Base'

const FORMAT_DATE = FORMAT.time.date
const FORMAT_TIME = FORMAT.time.datetimeLocal

interface InputProps extends Omit<TextFieldInputProps, 'ref'> {
  value?: string | number
}

const Datepicker: FC<InputProps> = (props) => {
  const id = createUniqueId()
  const format = props.type === 'date' ? FORMAT_DATE : FORMAT_TIME
  const [state, setState] = createStore({
    showCalendar: false,
    value: props.value,
  })

  let inputField: HTMLInputElement

  function eventDispatcher(type: string) {
    const event = new InputEvent(type, {
      view: window,
      bubbles: true,
      cancelable: true,
      data: typeof state.value === 'number' ? '' : state.value,
    })

    if (!inputField.dispatchEvent(event)) {
      return
    }
  }

  createEffect(() => eventDispatcher('change'))
  createEffect(() => setState('value', props.value))

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
            <TextField.Input
              {...props}
              ref={(el) => (inputField = el)}
              value={state.value}
              class={clsx('peer sr-only', props.class)}
            />
            <ButtonBase class='peer-invalid:text-red-500'>
              {!state.value || state.value === '' ? format : state.value}
            </ButtonBase>
          </>
        ),
      }}
    >
      <Calendar
        id={props.id || id}
        value={state.value}
        max={props.max}
        min={props.min}
        type={props.type}
        onclose={() => setState('showCalendar', false)}
        onchange={(val) => setState('value', val)}
      />
    </Popup>
  )
}

export default Datepicker

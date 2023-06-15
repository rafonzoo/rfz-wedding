import type { TextFieldInputProps } from '@kobalte/core/dist/types/text-field'
import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect } from 'solid-js'
import { TextField } from '@kobalte/core'
import { leading } from '@app/helpers/util'
import { FORMAT } from '@app/helpers/const'
import clsx from 'clsx'
import dayjs from 'dayjs'
import Roller from '@app/components/Roller'
import ButtonBase from '@app/components/Button/Base'

const FORMAT_DATE = FORMAT.time.date
const FORMAT_TIME = FORMAT.time.datetimeLocal

interface InputProps extends Omit<TextFieldInputProps, 'ref'> {
  value?: string | number
}

const Timepicker: FC<InputProps> = (props) => {
  const format = props.type === 'date' ? FORMAT_DATE : FORMAT_TIME
  const hour = [...Array(24).keys()].map((hour) => leading(hour))
  const minutes = [...Array(60).keys()].map((min) => leading(min))

  const [state, setState] = createStore({
    show: false,
    value: initialValue(),
  })

  let inputField: HTMLInputElement

  function initialValue() {
    return props.value && props.value !== '' ? `${props.value}` : '--:--'
  }

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
  createEffect(() => setState('value', initialValue()))

  return (
    <Roller
      open={state.show}
      onOpenChange={(isOpen) => setState('show', isOpen)}
      trigger={{ as: 'div', class: 'inline-flex' }}
      onchange={(val) => {
        let [hour, minute] = val

        if (isNaN(+hour) && isNaN(+minute)) {
          return
        }

        hour = isNaN(+hour) ? leading(dayjs().hour()) + '' : hour
        minute = isNaN(+minute) ? leading(dayjs().minute()) + '' : minute

        setState('value', [hour, minute].join(':'))
      }}
      items={[
        {
          selected: state.value.split(':')[0],
          option: hour,
        },
        {
          selected: state.value.split(':')[1],
          option: minutes,
        },
      ]}
    >
      <TextField.Input
        {...props}
        ref={(el) => (inputField = el)}
        value={state.value}
        class={clsx('peer sr-only', props.class)}
      />
      <ButtonBase class='peer-invalid:text-red-500'>
        {!state.value || state.value === '' ? format : state.value}
      </ButtonBase>
    </Roller>
  )
}

export default Timepicker

import type { TextFieldInputProps } from '@kobalte/core/dist/types/text-field'
import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createUniqueId, splitProps } from 'solid-js'
import { TextField } from '@kobalte/core'
import dayjs from 'dayjs'
import Popup from '@app/components/Dialog/Popup'
import DatePicker from '@app/components/DatePicker'

const FORMAT_DATE = 'YYYY-MM-DD'
const FORMAT_TIME = 'YYYY-MM-DDThh:mm'

interface InputProps extends TextFieldInputProps {
  value?: string | number

  // Custom
  ondatechange?: (value: string) => void
}

const Input: FC<InputProps> = (props) => {
  const [{ ondatechange }, prop] = splitProps(props, ['ondatechange'])

  const format = prop.type === 'date' ? FORMAT_DATE : FORMAT_TIME
  const instance = dayjs(props.value).format(format)

  const id = createUniqueId()
  const [state, setState] = createStore({
    showCalendar: false,
    value: props.value ? instance : '--Select date--',
  })

  return (
    <TextField.Root>
      {prop.type === 'date' || prop.type === 'datetime-local' ? (
        <>
          <Popup
            open={state.showCalendar}
            onOpenChange={(isOpen) => setState('showCalendar', isOpen)}
            trigger={{
              as: 'input',
              type: 'button',
              value: state.value ?? format,
            }}
          >
            <DatePicker
              id={prop.id || id}
              value={prop.value}
              max={prop.max}
              min={prop.min}
              type={prop.type}
              onclose={() => setState('showCalendar', false)}
              onchange={(val) => {
                setState('value', val)
                ondatechange?.(val)
              }}
            />
          </Popup>
        </>
      ) : (
        <TextField.Input {...prop} />
      )}
    </TextField.Root>
  )
}

export default Input

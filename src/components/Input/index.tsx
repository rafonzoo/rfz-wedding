import type {
  TextFieldInputProps,
  TextFieldLabelProps,
  TextFieldRootProps,
} from '@kobalte/core/dist/types/text-field'
import type { FC } from '@app/types'
import {
  createEffect,
  createSignal,
  createUniqueId,
  splitProps,
} from 'solid-js'
import { TextField } from '@kobalte/core'
import dayjs from 'dayjs'
import Popup from '@app/components/Dialog/Popup'
import DatePicker from '@app/components/DatePicker'

interface InputProps extends TextFieldInputProps {
  value?: string | number
  ondatechange?: (value: string) => void
  root?: TextFieldRootProps
  label?: TextFieldLabelProps
  format?: string
}

const Input: FC<InputProps> = (props) => {
  const [{ format = 'YYYY-MM-DDThh:mm', ondatechange }, prop] = splitProps(
    props,
    ['root', 'label', 'format', 'ondatechange']
  )

  const [showCalendar, setCalendar] = createSignal(false)
  const [value, setValue] = createSignal(props.value)
  const id = createUniqueId()

  createEffect(() => {
    const val = value()

    if (!val || val === '') {
      return
    }

    ondatechange?.(dayjs(val).format(format))
  })

  return (
    <TextField.Root>
      {prop.type === 'date' ? (
        <>
          <Popup
            open={showCalendar()}
            onOpenChange={setCalendar}
            trigger={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(prop as any),
              as: 'input',
              type: 'button',
              value: value() ? dayjs(value()).format(format) : format,
            }}
          >
            <DatePicker
              id={prop.id || id}
              value={prop.value}
              max={prop.max}
              min={prop.min}
              format={format}
              onchange={setValue}
            />
          </Popup>
        </>
      ) : (
        <TextField.Input />
      )}
    </TextField.Root>
  )
}

export default Input

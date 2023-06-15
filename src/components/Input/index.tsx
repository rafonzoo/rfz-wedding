import type { TextFieldInputProps } from '@kobalte/core/dist/types/text-field'
import type { FC } from '@app/types'
import { createMemo } from 'solid-js'
import { TextField } from '@kobalte/core'
import clsx from 'clsx'
import Timepicker from '@app/components/Input/PickerTime'
import Datepicker from '@app/components/Input/PickerDate'

interface InputProps extends Omit<TextFieldInputProps, 'ref'> {
  value?: string | number
}

const Input: FC<InputProps> = (props) => {
  const classes = createMemo(() => clsx(props.class, 'appearance-none'))

  return (
    <TextField.Root>
      {props.type === 'date' || props.type === 'datetime-local' ? (
        <Datepicker {...props} class={classes()} />
      ) : props.type === 'time' ? (
        <Timepicker {...props} class={classes()} />
      ) : (
        <TextField.Input {...props} class={classes()} />
      )}
    </TextField.Root>
  )
}

export default Input

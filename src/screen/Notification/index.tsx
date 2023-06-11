import type { Component } from 'solid-js'
import type { TextFieldInputProps } from '@kobalte/core/dist/types/text-field'
import type { FC } from '@app/types'
import { createSignal, createUniqueId } from 'solid-js'
import { TextField } from '@kobalte/core'
import Popup from '@app/components/Dialog/Popup'
import DatePicker from '@app/components/DatePicker'

const Input: FC<TextFieldInputProps> = (props) => {
  const [showCalendar, setCalendar] = createSignal(false)
  const id = createUniqueId()

  function formatDateValue() {
    return props.value || 'dd/mm/yyyy'
  }

  return (
    <TextField.Root>
      {props.type === 'date' ? (
        <Popup
          trigger={{ children: formatDateValue() }}
          open={showCalendar()}
          onOpenChange={setCalendar}
        >
          <DatePicker
            id={props.id || id}
            value={props.value}
            max={props.max}
            min={props.min}
          />
        </Popup>
      ) : (
        <TextField.Input />
      )}
    </TextField.Root>
  )
}

const Notification: Component = () => {
  return (
    <div class='min-h-[200vh]'>
      <Input
        type='date'
        // value='7 March 2023'
        // min='24 January 1952'
        // max='20 December 2023'
      />
    </div>
  )
}

export default Notification

{
  /*
    // show={showCalendar()}
    // min='24 May 2022'
    // max='20 August 2023'
    // value: formatInstance(Date.now()),
    // format='YYYY-MM-DDThh:mm'
    // defaultValue='10 September 2019'
    // hideHighlight={false}
    // markWeekend={true}
  */
}

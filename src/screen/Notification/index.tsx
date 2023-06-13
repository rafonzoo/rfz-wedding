import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import dayjs from 'dayjs'
import Input from '@app/components/Input'

const Notification: Component = () => {
  const [choosenDate, setDate] = createSignal('no value')

  return (
    <div class='min-h-[200vh]'>
      <p class='py-5'>
        {(dayjs(choosenDate()).isValid() &&
          dayjs(choosenDate()).format('dddd, DD MMMM YYYY, HH.mm')) ||
          'no value'}
      </p>
      {/* <input
        type='datetime-local'
        // min='2024-03-25T03:00'
        // value='2025-04-07T03:00'
        max='2020-04-25T03:00'
      /> */}
      <Input
        type='datetime-local'
        class='invalid:text-red-500'
        // value='2017-04-07'
        // min='2017-04-07'
        // max='2017-04-30'
        min='2023-03-25T12:00'
        // value='2025-04-07T03:00'
        // max='2020-04-25T03:00'
        onchange={(e) => {
          setDate(e.target.value === '' ? 'no value' : e.target.value)
        }}
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

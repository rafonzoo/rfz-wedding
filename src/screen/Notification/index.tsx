import type { Component } from 'solid-js'
import { createSignal, onMount } from 'solid-js'
import { delay } from '@app/helpers/util'
import dayjs from 'dayjs'
import Input from '@app/components/Input'

const Notification: Component = () => {
  const [choosenDate, setDate] = createSignal('')

  onMount(() => {
    delay(1000).then(() => {
      setDate('2023-09-20T21:12')
    })
  })

  return (
    <div class='min-h-[200vh]'>
      <p class='py-5'>
        {choosenDate() === ''
          ? 'no value'
          : dayjs(choosenDate()).format('dddd, DD MMMM YYYY, HH.mm')}
      </p>
      <Input
        type='datetime-local'
        // value='2017-04-07'
        // min='2017-04-07'
        // max='2017-04-30'
        min='2023-03-25T12:00'
        value={choosenDate()}
        // max='2020-04-25T03:00'
      />
      <input
        type='datetime-local'
        // min='2024-03-25T03:00'
        // value='2025-04-07T03:00'
        // min='2026-03-25T12:00'
        value={choosenDate()}
        // max='2020-04-25T03:00'
        oninput={(e) => {
          setDate(e.target.value)
          // console.log(e.target.value)
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

import type { Component } from 'solid-js'
import Input from '@app/components/Input'

const Notification: Component = () => {
  return (
    <div class='min-h-[200vh]'>
      <Input
        type='date'
        // format='dddd, DD MMMM YYYY'
        // value='7 January 2023'
        ondatechange={(val) => {
          console.log(val)
        }}
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

import type { Component } from 'solid-js'
import Input from '@app/components/Input'

const Notification: Component = () => {
  return (
    <div class='min-h-[200vh]'>
      <Input
        type='datetime-local'
        // format='dddd, DD MMMM YYYY'
        // value='2017-04-07'
        // min='2017-04-07'
        // max='2017-04-30'
        // min='2015-05-07T05:26'
        // value='2017-04-07T05:00'
        // max='2017-05-07T08:29'
        // ondatechange={console.log}
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

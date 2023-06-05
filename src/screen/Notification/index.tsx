import type { Component } from 'solid-js'
import DatePicker from '@app/components/DatePicker'

const Notification: Component = () => {
  return (
    <div class='min-h-[200vh]'>
      <DatePicker
        // min='24 May 2023'
        // max='20 August 2023'
        // format='YYYY-MM-DDThh:mm'
        // defaultValue='10 September 2019'
        hideHighlight={false}
        markWeekend={true}
      />
    </div>
  )
}

export default Notification

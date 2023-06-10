import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import Popup from '@app/components/Dialog/Popup'
import DatePicker from '@app/components/DatePicker'

const Notification: Component = () => {
  const [showCalendar, setCalendar] = createSignal(false)

  return (
    <div class='min-h-[200vh]'>
      <Popup
        trigger={{ children: 'Show calendar' }}
        open={showCalendar()}
        onOpenChange={setCalendar}
      >
        <DatePicker
          // show={showCalendar()}
          id='datepicker-1'
          // min='24 May 2022'
          // max='20 August 2023'
          // format='YYYY-MM-DDThh:mm'
          // defaultValue='10 September 2019'
          // hideHighlight={false}
          // markWeekend={true}
        />
      </Popup>
    </div>
  )
}

export default Notification

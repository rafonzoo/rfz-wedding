import type { Component } from 'solid-js'
import ScrollPicker from '@app/components/ScrollPicker'
import DatePicker from '@app/components/DatePicker'

const Notification: Component = () => {
  return (
    <div>
      <DatePicker
        // min='24 May 2023'
        // max='20 August 2023'
        // format='YYYY-MM-DDThh:mm'
        // defaultValue='10 May 2023'
        hideHighlight={false}
        markWeekend={true}
      />
      <ScrollPicker
        defaultValue='April'
        items={[
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]}
      />
    </div>
  )
}

export default Notification

import type { Component } from 'solid-js'
import { createStore } from 'solid-js/store'
import ScrollPicker from '@app/components/ScrollPicker'
import DatePicker from '@app/components/DatePicker'

const Notification: Component = () => {
  const [date, setDate] = createStore({
    month: '',
    year: '',
  })

  return (
    <div class='min-h-[200vh]'>
      <DatePicker
        // min='24 May 2023'
        // max='20 August 2023'
        // format='YYYY-MM-DDThh:mm'
        // defaultValue='10 May 2023'
        hideHighlight={false}
        markWeekend={true}
      />
      <div class='mx-6'>
        <ScrollPicker
          items={[
            {
              onchange: (value) => setDate('month', value),
              defaultValue: 'September',
              values: [
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
              ],
            },
            {
              onchange: (value) => setDate('year', value),
              defaultValue: '2023',
              values: [...Array(56).keys()]
                .map((hour) => `0${hour}`.slice(-2))
                .map((hour) => `20${hour}`.slice(-4)),
            },
          ]}
        />
        <br />
        {[date.month, date.year].filter((d) => d !== '').join(', ')}
      </div>
    </div>
  )
}

export default Notification

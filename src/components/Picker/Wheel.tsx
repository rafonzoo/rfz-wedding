import type { FC } from '@app/types'
import { createSignal, onMount } from 'solid-js'
import { iOSPicker } from '@app/helpers/lib'

const months = [
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
]

const WheelPicker: FC = () => {
  const [month, setMonth] = createSignal('January')

  onMount(() => {
    const instance = new iOSPicker({
      el: '#minutes',
      type: 'infinite',
      source: months.map((itm) => ({ value: itm, text: itm })),
      count: 20,
      onChange: (selection) => {
        setMonth(selection.value)
      },
    })

    instance.select('September')
  })

  return (
    <div class='w-full flex-grow px-4'>
      <div class='h-[214px]' id='minutes'></div>
      <div class='p-4'>Selected: {month()}</div>
    </div>
  )
}

export default WheelPicker

import type { FC } from '@app/types'
import { createSignal, onMount } from 'solid-js'
import IosSelector from '@app/module/wheel'

// Items should be 19
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

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const Wheels: FC = () => {
  const [month, setMonth] = createSignal('January')

  onMount(() => {
    const instance = new IosSelector({
      el: '#minutes',
      type: 'infinite',
      source: months.map((itm) => ({ value: itm, text: itm })),
      count: 20,
      onChange: (selection: any) => {
        setMonth(selection.value)
      },
    })

    instance.select('September')
  })

  return (
    <div class='flex-grow px-4'>
      <div class='h-[300px]' id='minutes'></div>
      <div class='p-4'>Selected: {month()}</div>
    </div>
  )
}

const Notification: FC = () => {
  return (
    <div class='mx-auto flex w-[254px]'>
      <Wheels />
    </div>
  )
}

export default Notification

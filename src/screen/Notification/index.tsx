import type { FC } from '@app/types'
import { type Component, onMount } from 'solid-js'
import clsx from 'clsx'

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

const Wheels: FC<{ items: string[] }> = ({ items }) => {
  let ulElement: HTMLUListElement

  function requiredItem() {
    const newArr = []
    const temp = []

    let n = items.length - 1

    for (let i = 0; i < 19; i++) {
      if (!items[i]) {
        if (n < 1) {
          n = items.length - 1
          // temp.push(items[n])
        } else {
          temp.unshift(items[n])
          n--
        }
      } else {
        newArr.push(items[i])
      }
    }

    console.log(newArr.concat(temp))

    return newArr.concat(temp)
  }

  // requiredItem()

  onMount(() => {
    const length = requiredItem().length
    const diameter = ulElement.clientHeight
    const radius = diameter / 2
    const angle = 360 / length
    const circumference = Math.PI * diameter
    const height = circumference / length

    Array.from(ulElement.querySelectorAll('li')).forEach((li, i) => {
      const transform = `rotateX(${-angle * i}deg) translateZ(${radius}px)`

      li.style.transform = transform
      li.style.height = height + 'px'
      li.style.marginTop = -(height / 2 - 1) + 'px'
    })
  })

  return (
    <div class='m-5 overflow-hidden p-5'>
      <div class='perspective-1000'>
        <ul
          ref={(el) => (ulElement = el)}
          class='relative h-[8em] bg-gray-200 preserve-3d'
          style={{ 'font-size': '28px' }}
        >
          {requiredItem().map((month) => (
            <li
              // style={{ 'transform-origin': '50% 0' }}
              class={clsx({
                'absolute top-1/2 flex w-full items-center': true,
                'h-7 bg-gray-200 px-2 text-lead -tracking-lead': true,
              })}
            >
              {month}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const Notification: Component = () => {
  return (
    <div>
      {/* <Wheels items={months} /> */}
      <Wheels items={days} />
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

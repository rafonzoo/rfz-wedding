import type { Component } from 'solid-js'
import type { iWedding } from '@app/types/invitation'
import { createStore } from 'solid-js/store'
import { createMemo } from 'solid-js'
import { store } from '@app/state/store'
import { dayjs } from '@app/module'
import Topbar from '@app/components/Navbar/Topbar'

const template: iWedding = {
  id: '0',
  opening: 'Lorem ipsum dolor sit amet',
  hours: {
    marriage: '2',
    akad: '3',
  },
  date: {
    marriage: '2023-08-13T11:00',
    akad: '2023-08-06T08:00',
  },
  location: {
    akad: 'St. Village, No. 3, Germany',
    marriage: 'St. Ken Louis, No. 10, Germany',
  },
  groom: {
    name: 'John',
    fullName: 'John Doe',
    born: 'August 1 1988',
    address: 'St. Village, No. 3, Germany',
    childOf: '1',
    parental: {
      father: 'Ken Doe',
      mother: 'Terry Lopez',
    },
  },
  bride: {
    name: 'Barbara',
    fullName: 'Barbara Valentine',
    born: 'June 2 1990',
    address: 'St. Village, No. 3, Germany',
    childOf: '1',
    parental: {
      father: 'Masaw Moore',
      mother: 'Vooty George',
    },
  },
}

let inputDateTime: HTMLInputElement
let inputDatepicker: HTMLInputElement

// const Timepicker: Component<TimepickerProps> = ({ format = '24' }) => {
//   const minutes = [...Array(60).keys()].map((min) => `0${min}`.slice(-2))
//   const hours = [...Array((+format === 24 ? 23 : +format) + 1).keys()].map(
//     (min) => `0${min}`.slice(-2)
//   )

//   return (
//     <div class='mt-2 w-40 rounded-lg bg-white p-5 shadow-xl'>
//       <div class='flex'>
//         <select
//           name='hours'
//           class='appearance-none bg-transparent text-xl outline-none'
//         >
//           {hours.map((hour) => (
//             <option value={hour}>{hour}</option>
//           ))}
//         </select>
//         <span class='mr-3 text-xl'>:</span>
//         <select
//           name='minutes'
//           class='mr-4 appearance-none bg-transparent text-xl outline-none'
//         >
//           {minutes.map((min) => (
//             <option value={min}>{min}</option>
//           ))}
//           {/* <option value='0'>00</option>
//           <option value='30'>30</option> */}
//         </select>
//         <select
//           name='ampm'
//           class='appearance-none bg-transparent text-xl outline-none'
//         >
//           <option value='am'>AM</option>
//           <option value='pm'>PM</option>
//           <option value='wib'>WIB</option>
//           <option value='wit'>WIT</option>
//           <option value='wita'>WITA</option>
//         </select>
//       </div>
//     </div>
//   )
// }

const Editor: Component = () => {
  // const [{ from }, setParam] = useSearchParams()
  const [data, setdata] = createStore(template)

  const isID = createMemo(() => store.locale === 0)

  return (
    <>
      <Topbar position='sticky' />
      {/* <Timepicker /> */}
      <div class='flatpickr'>
        <input
          ref={inputDatepicker}
          placeholder='Select Date..'
          type='text'
          data-input
        />
        <button data-toggle>toggle</button>
      </div>
      <div class='h-[200vh]'>
        <p>
          {data.bride.name} & {data.groom.name} <br />
          {dayjs(data.date.marriage).format('dddd, DD MMMM YYYY')}
        </p>
        <p class='mt-4'>
          The Wedding of {data.bride.name} and {data.groom.name} <br />
          {data.opening}
        </p>
        <div class='mt-4'>
          <p class='text-2xl font-bold'>{data.bride.fullName}</p>
          <p>
            The {data.bride.childOf}th daughter from Mr.{' '}
            {data.bride.parental.father} and Mrs.{data.bride.parental.mother}
          </p>
        </div>
        <div class='mt-4'>
          <p class='text-2xl font-bold'>{data.groom.fullName}</p>
          <p>
            The {data.groom.childOf}th daughter from Mr.{' '}
            {data.groom.parental.father} and Mrs.{data.groom.parental.mother}
          </p>
        </div>
        <br />
        <div>
          <p class='text-lg font-semibold'>Save the date</p>
          <p class='mt-2'>Marriage:</p>
          <label for='date-marriage'>
            {dayjs(data.date.marriage).format(
              isID() ? 'dddd, DD MMMM YYYY' : 'dddd, MMMM DD YYYY'
            )}
            <br />
            <input
              ref={inputDateTime}
              id='date-marriage'
              type='datetime-local'
              min={dayjs(Date.now()).format('YYYY-MM-DDThh:mm')}
              // value={dayjs(data.date.marriage).format('YYYY-MM-DDThh:mm')}
              // class='sr-only'
              // onfocus={(e) => e.currentTarget.showPicker()}
              onchange={(e) => {
                if (e.currentTarget.value === '') {
                  return setdata(
                    'date',
                    'marriage',
                    dayjs(Date.now()).format('YYYY-MM-DDThh:mm')
                  )
                }

                setdata('date', 'marriage', e.currentTarget.value)
              }}
            />
          </label>
          <p>
            {isID() ? 'Pukul ' : ''}
            {dayjs(data.date.marriage).format('HH:mm')}
            {isID() ? ' WIB' : ''} -{' '}
            {dayjs(data.date.marriage)
              .add(+data.hours.marriage, 'h')
              .format('HH:mm')}{' '}
            {isID() ? ' WIB' : ''}
          </p>
          <p>{data.location.marriage}</p>
        </div>
        <br />
        <div>
          <p class='mt-2'>Akad:</p>
          <p>
            {dayjs(data.date.akad).format(
              isID() ? 'dddd, DD MMMM YYYY' : 'dddd, MMMM DD YYYY'
            )}
          </p>
          <p>
            {isID() ? 'Pukul ' : ''}
            {dayjs(data.date.akad).format('HH:mm')}
            {isID() ? ' WIB' : ''} -{' '}
            {dayjs(data.date.akad).add(+data.hours.akad, 'h').format('HH:mm')}{' '}
            {isID() ? ' WIB' : ''}
          </p>
          <p>{data.location.akad}</p>
        </div>
        <br />
        <input type='time' />
      </div>
    </>
  )
}

export default Editor

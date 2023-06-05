import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect } from 'solid-js'
import dayjs from 'dayjs'
import { promise } from '@app/helpers/util'
import clsx from 'clsx'
import ScrollPicker from '@app/components/ScrollPicker'

interface TimeProps {
  date: number
  month: number
  year: number
  disabled?: boolean
}

interface DatePickerProps {
  defaultValue?: Parameters<typeof dayjs>[0]
  min?: Parameters<typeof dayjs>[0]
  max?: Parameters<typeof dayjs>[0]
  hideHighlight?: boolean
  markWeekend?: boolean
  format?: string
}

interface DatePickerStore {
  value: string
  slider: dayjs.Dayjs
  dates: TimeProps[]
  date: string
  month: string
  year: string
  day: string
}

interface DatePickerState {
  offset: number
  lastAction: 'next' | 'prev'
  isAnimating: 'none' | 'month' | 'year'
}

// const TABLES = 42
const TABLES = 105
const OFFSET = -152
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

let wrapperButton: HTMLDivElement

const DatePicker: FC<DatePickerProps> = ({
  // hideHighlight = false,
  // markWeekend = true,
  format = 'dddd, DD MMMM YYYY',
  defaultValue,
  // min,
  // max,
}) => {
  // prettier-ignore
  const def = {
    dates: [],
    value: formatDate(defaultValue),
    slider: dayjs(defaultValue),

    get date() { return `0${this.slider.date()}`.slice(-2) },
    get day() { return `${dayjs.weekdays()[this.slider.day()]}` },
    get month() { return dayjs.months()[this.slider.month()] },
    get year() { return `${this.slider.year()}` },
  }

  const [calendar, setCalendar] = createStore<DatePickerStore>(def)
  const [state, setState] = createStore<DatePickerState>({
    lastAction: 'prev',
    isAnimating: 'none',
    offset: OFFSET,
  })

  createEffect(async () => {
    const prevOffset =
      calendar.slider.add(-1, 'M').date(1).day() <= 0
        ? []
        : datesCreator(calendar.slider.add(-2, 'M')).slice(
            -calendar.slider.add(-1, 'M').date(1).day()
          )

    const datesCurrent = [
      ...prevOffset,
      ...datesCreator(calendar.slider.add(-1, 'M')),
      ...datesCreator(calendar.slider),
      ...datesCreator(calendar.slider.add(1, 'M')),
    ]

    setCalendar('dates', [
      ...datesCurrent,
      ...datesCreator(calendar.slider.add(2, 'M'), false).slice(
        0,
        TABLES - datesCurrent.length
      ),
    ])
  })

  createEffect(() => {
    const getMonth = dayjs.months()[calendar.slider.month()]

    promise().then(() => {
      const element = document.getElementById(`dpm-${getMonth}`)
      const months = element?.querySelectorAll<HTMLElement>('[data-begin]')

      setState('offset', -Array.from(months || [])[1]?.offsetTop)
    })
  })

  function monthGo(states: 'next' | 'prev' | 'end') {
    const isEnd = states === 'end'
    const index = states === 'next' ? 2 : isEnd ? 1 : 0

    return () => {
      // prettier-ignore
      isEnd && setCalendar('slider', (prev) =>
        prev.add(state.lastAction === 'next' ? 1 : -1, 'M')
      )

      const el = wrapperButton.querySelectorAll<HTMLElement>('[data-begin]')
      const offset = -Array.from(el)[index].offsetTop

      setState((prev) => ({
        offset,
        lastAction: isEnd ? prev.lastAction : states,
        isAnimating: isEnd ? 'none' : 'month',
      }))
    }
  }

  return (
    <div class='mx-4 my-6'>
      <p class='pb-4'>
        <b>Now:</b> {dayjs(Date.now()).format(format)} <br />
        <b>Month:</b> {calendar.slider.format('MMMM YYYY')}
      </p>
      <div class='grid grid-cols-7 gap-x-3 space-y-0.5'>
        {DAYS.map((dayName) => (
          <div class='flex h-9 w-full items-center justify-center bg-gray-100'>
            {dayName}
          </div>
        ))}
      </div>
      <div class='h-[226px] overflow-hidden'>
        <div
          style={{ transform: `translateY(${state.offset}px)` }}
          ontransitionend={monthGo('end')}
          class={clsx({
            'transition-transform duration-300': state.isAnimating === 'month',
          })}
        >
          <div
            ref={wrapperButton}
            id={`dpm-${calendar.month}`}
            class={clsx(
              'relative grid w-full grid-cols-7 gap-x-3 gap-y-0.5 translate-z-0'
            )}
          >
            {calendar.dates.map((time) => (
              <button
                data-begin={time.date === 1 ? '' : undefined}
                disabled={time.month !== calendar.slider.get('M')}
                class={clsx('flex h-9 w-full items-center justify-center', {
                  'opacity-50':
                    time.month !== calendar.slider.get('M') &&
                    state.isAnimating === 'none',
                })}
              >
                {time.date}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div class='flex space-x-4'>
        <button class='mt-6' onclick={monthGo('prev')}>
          Prev
        </button>
        <button class='mt-6' onclick={monthGo('next')}>
          Next
        </button>
      </div>
      <div class='mx-6'>
        <ScrollPicker
          onchange={([month, year]) => {
            const indexMonth = dayjs.months().findIndex((val) => val === month)
            setCalendar('slider', (prev) => prev.month(indexMonth).year(+year))
          }}
          items={[
            {
              selected: () => calendar.month,
              option: dayjs.months(),
            },
            {
              selected: () => calendar.year,
              option: [...Array(56).keys()]
                .map((hour) => `0${hour}`.slice(-2))
                .map((hour) => `20${hour}`.slice(-4)),
            },
          ]}
        />
      </div>
    </div>
  )
}

function datesCreator(day: dayjs.Dayjs, reverse = false) {
  const dates = [...Array(day.endOf('M').date()).keys()].map((num) => ({
    date: num + 1,
    month: day.month(),
    year: day.year(),
  }))

  return reverse ? dates.slice(0).reverse() : dates
}

function formatDate<T>(time: T, format = 'dddd, DD MMMM YYYY') {
  if (dayjs.isDayjs(time)) {
    return time.format(format)
  }

  // prettier-ignore
  return typeof time === 'string' && !!time
    ? dayjs(time).format(format)
    : ''
}

export default DatePicker

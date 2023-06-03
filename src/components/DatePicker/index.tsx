import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect } from 'solid-js'
import dayjs from 'dayjs'
import clsx from 'clsx'

interface TimeProps {
  date: number
  month: number
  year: number
  disabled?: boolean
}

interface MonthProps {
  current: dayjs.Dayjs
  dates: TimeProps[]
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
  month: MonthProps
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
  hideHighlight = false,
  markWeekend = true,
  format = 'dddd, DD MMMM YYYY',
  defaultValue,
  min,
  max,
}) => {
  const now = dayjs(Date.now())
  const weeks = DAYS.length

  const [calendar, setCalendar] = createStore<DatePickerStore>({
    value: formatDate(defaultValue),
    month: {
      current: dayjs(defaultValue),
      dates: [],
    },
  })

  const [state, setState] = createStore<DatePickerState>({
    lastAction: 'prev',
    isAnimating: 'none',
    offset: OFFSET,
  })

  createEffect(async () => {
    const prevOffset =
      calendar.month.current.add(-1, 'M').date(1).day() <= 0
        ? []
        : datesCreator(calendar.month.current.add(-2, 'M')).slice(
            -calendar.month.current.add(-1, 'M').date(1).day()
          )

    const datesCurrent = [
      ...prevOffset,
      ...datesCreator(calendar.month.current.add(-1, 'M')),
      ...datesCreator(calendar.month.current),
      ...datesCreator(calendar.month.current.add(1, 'M')),
    ]

    setCalendar('month', 'dates', [
      ...datesCurrent,
      ...datesCreator(calendar.month.current.add(2, 'M'), false).slice(
        0,
        TABLES - datesCurrent.length
      ),
    ])
  })

  function monthGo(states: 'next' | 'prev' | 'end') {
    const isEnd = states === 'end'
    const index = states === 'next' ? 2 : isEnd ? 1 : 0

    return () => {
      // prettier-ignore
      isEnd && setCalendar('month', 'current', (prev) =>
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
        <b>Now:</b> {now.format(format)} <br />
        <b>Month:</b> {calendar.month.current.format('MMMM YYYY')}
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
          class={clsx('h-[226px]', {
            'transition-transform duration-300': state.isAnimating === 'month',
          })}
        >
          <div
            ref={wrapperButton}
            class={clsx(
              'relative grid w-full grid-cols-7 gap-x-3 gap-y-0.5 translate-z-0'
            )}
          >
            {calendar.month.dates.map((time) => (
              <button
                data-begin={time.date === 1 ? '' : undefined}
                disabled={time.month !== calendar.month.current.get('M')}
                class={clsx('flex h-9 w-full items-center justify-center', {
                  'opacity-50':
                    time.month !== calendar.month.current.get('M') &&
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

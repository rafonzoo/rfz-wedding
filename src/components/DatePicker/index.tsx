import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, createSignal } from 'solid-js'
import { promise } from '@app/helpers/util'
import clsx from 'clsx'
import dayjs from 'dayjs'
import ScrollPicker from '@app/components/ScrollPicker'
import ButtonBase from '@app/components/Button/Base'

interface TimeProps {
  date: number
  day: number
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
  showScrollPicker: boolean
}

const TABLES = 105
const OFFSET = -152

const YEAR_START_AT = 1950
const YEAR_STOP_AT = 2050

let wrapperButton: HTMLDivElement

const DatePicker: FC<DatePickerProps> = ({
  // hideHighlight = false,
  // markWeekend = true,
  format = 'dddd, DD MMMM YYYY',
  // defaultValue,
  min,
  max,
}) => {
  const mintime = min ? dayjs(min) : undefined
  const maxtime = max ? dayjs(max) : undefined

  // prettier-ignore
  const def = {
    dates: [],
    value: formatDate(Date.now()),
    slider: maxtime ?? dayjs(Date.now()),

    get year() { return `${this.slider.year()}` },
    get date() { return `0${this.slider.date()}`.slice(-2) },
    get day() { return `${dayjs.weekdays()[this.slider.day()]}` },
    get month() { return dayjs.months()[this.slider.month()] },
  }

  const [calendar, setCalendar] = createStore<DatePickerStore>(def)
  const [state, setState] = createStore<DatePickerState>({
    lastAction: 'prev',
    isAnimating: 'none',
    offset: OFFSET,
    showScrollPicker: false,
  })

  const [months, setMonths] = createSignal<string[]>([])
  const [years, setYears] = createSignal<string[]>([])

  if (
    mintime &&
    maxtime &&
    (mintime.isAfter(maxtime, 'M') || maxtime.isBefore(mintime, 'M'))
  ) {
    throw new Error('Invalid date.')
  }

  createEffect(async () => {
    const prevOffset =
      calendar.slider.add(-1, 'M').date(1).day() <= 0
        ? []
        : createDate(calendar.slider.add(-2, 'M')).slice(
            -calendar.slider.add(-1, 'M').date(1).day()
          )

    const datesCurrent = [
      ...prevOffset,
      ...createDate(calendar.slider.add(-1, 'M')),
      ...createDate(calendar.slider),
      ...createDate(calendar.slider.add(1, 'M')),
    ]

    setCalendar('dates', [
      ...datesCurrent,
      ...createDate(calendar.slider.add(2, 'M'), false).slice(
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

  function createDate(day: dayjs.Dayjs, reverse = false) {
    const dates = [...Array(day.endOf('M').date()).keys()].map((num) => ({
      day: day
        .date(num + 1)
        .month(day.month())
        .year(day.year())
        .day(),
      month: day.month(),
      year: day.year(),
      date: num + 1,
    }))

    return reverse ? dates.slice(0).reverse() : dates
  }

  function formatDate<T>(time: T) {
    if (dayjs.isDayjs(time)) {
      return time.format(format)
    }

    // prettier-ignore
    return typeof time === 'string' && !!time
      ? dayjs(time).format(format)
      : ''
  }

  function onChangedMonthEffect() {
    const year = calendar.slider.year()
    const month = dayjs.months()

    // Default show all months
    let monthss = dayjs.months() as string[]

    if (maxtime && year === maxtime.year()) {
      monthss = month.slice(0, maxtime.month() + 1)
    }

    if (mintime && year === mintime.year()) {
      monthss = month.slice(mintime.month())
    }

    if (maxtime && mintime && mintime.year() === maxtime.year()) {
      monthss = month.slice(mintime.month(), maxtime.month() + 1)
    }

    setMonths((prev) =>
      prev.length === 0 || !prev.every((p) => monthss.includes(p))
        ? monthss
        : prev
    )
  }

  function onChangedYearEffect() {
    // eslint-disable-next-line prefer-const
    let array: string[] = []
    let i = mintime ? mintime.year() : YEAR_START_AT

    for (; i <= (maxtime ? maxtime.year() : YEAR_STOP_AT); i++) {
      array.push(i + '')
    }

    setYears(array)
  }

  function onChangedPicker([month, year]: string[]) {
    if (dayjs.months().indexOf(month) < 0) return

    setCalendar('slider', (prev) => {
      const indexMonth = dayjs.months().indexOf(month)

      if (prev.month(indexMonth).year(+year).isSame(prev)) {
        return prev
      }

      return prev.month(indexMonth).year(+year)
    })
  }

  createEffect(onChangedMonthEffect)
  createEffect(onChangedYearEffect)

  return (
    <div class='mx-4 my-6'>
      <p class='pb-4'>
        <b>Now:</b> {dayjs(Date.now()).format(format)} <br />
        <b>Month:</b> {calendar.slider.format('MMMM YYYY')}
      </p>
      <div class='grid grid-cols-7 gap-x-3 space-y-0.5'>
        {dayjs.weekdaysShort().map((dayName) => (
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
                  'bg-red-200': time.day === 0,
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
        <ButtonBase
          onclick={monthGo('prev')}
          disabled={
            (mintime && calendar.slider.add(-1, 'M').isBefore(mintime, 'M')) ||
            calendar.slider.add(-1, 'M').year() < YEAR_START_AT
          }
        >
          Prev
        </ButtonBase>
        <ButtonBase
          onclick={monthGo('next')}
          disabled={
            (maxtime && calendar.slider.add(1, 'M').isAfter(maxtime, 'M')) ||
            calendar.slider.add(1, 'M').year() > YEAR_STOP_AT
          }
        >
          Next
        </ButtonBase>
      </div>
      <ScrollPicker
        show={() => state.showScrollPicker}
        trigger={{ children: 'Pick year' }}
        setShow={(isOpen) => setState('showScrollPicker', isOpen)}
        onchange={onChangedPicker}
        items={[
          {
            selected: () => {
              const month = months()
              const last = month[month.length - 1]

              if (month.indexOf(calendar.month) > -1) {
                return calendar.month
              }

              if (mintime && maxtime) {
                return calendar.slider.isAfter(maxtime) ? last : month[0]
              }

              return mintime ? month[0] : last
            },
            option: months,
            classes: { li: 'min-w-[107px]' },
          },
          {
            selected: () => calendar.year,
            option: years,
          },
        ]}
      />
    </div>
  )
}

export default DatePicker

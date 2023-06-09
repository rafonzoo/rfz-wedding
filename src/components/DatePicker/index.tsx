import type { FC } from '@app/types'
import { createStore, unwrap } from 'solid-js/store'
import { createEffect, createSignal } from 'solid-js'
import { promise } from '@app/helpers/util'
import clsx from 'clsx'
import dayjs from 'dayjs'
import ScrollPicker from '@app/components/ScrollPicker'
import IconChevron from '@app/components/Icon/Chevron'
import Popup from '@app/components/Dialog/Popup'
import ButtonBase from '@app/components/Button/Base'

interface TimeProps {
  date: number
  days: number
  year: number
  month: number
  disabled?: boolean
}

interface DatePickerProps {
  id: string
  format?: string
  min?: string
  max?: string
}

interface DatePickerStore {
  dates: TimeProps[]
  value: string
  slider: dayjs.Dayjs
  date: string
  year: string
  days: string
  month: string
}

interface DatePickerState {
  offset: number
  lastAction: 'next' | 'prev'
  isAnimating: 'none' | 'month' | 'year'
  showYearMonthPicker: boolean
}

const TABLES = 105
const OFFSET = -136

const YEAR_START_AT = 1950
const YEAR_STOP_AT = 2050

let wrapperButton: HTMLDivElement

const [pickerData, setPickerData] = createSignal<
  { id: string; slider: dayjs.Dayjs }[]
>([])

const DatePicker: FC<DatePickerProps> = (props) => {
  const mintime = props.min ? dayjs(props.min) : undefined
  const maxtime = props.max ? dayjs(props.max) : undefined
  const current = pickerData().find(({ id }) => id === props.id)?.slider

  // prettier-ignore
  const def = {
    dates: [],
    value: formatInstance(Date.now()),
    slider: current || (maxtime ?? dayjs(Date.now())),

    get year() { return `${this.slider.year()}` },
    get date() { return `0${this.slider.date()}`.slice(-2) },
    get days() { return `${dayjs.weekdays()[this.slider.day()]}` },
    get month() { return dayjs.months()[this.slider.month()] },
  }

  const [calendar, setCalendar] = createStore<DatePickerStore>(def)
  const [state, setState] = createStore<DatePickerState>({
    lastAction: 'prev',
    isAnimating: 'none',
    offset: OFFSET,
    showYearMonthPicker: false,
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

  createEffect(() => {
    const slider = calendar.slider

    setPickerData((prev) => {
      if (prev.find((item) => item.id === props.id)) {
        const now = prev.find((p) => p.id === props.id)

        if (now?.slider.isSame(slider, 'M')) {
          return prev
        }

        return prev.map((p) =>
          p.id !== props.id ? { ...p } : { id: props.id, slider }
        )
      }

      return [...prev, { id: props.id, slider }]
    })
  })

  createEffect(() => {
    const prevOffset =
      calendar.slider.add(-1, 'M').date(1).day() <= 0
        ? []
        : createMonthDate(calendar.slider.add(-2, 'M')).slice(
            -calendar.slider.add(-1, 'M').date(1).day()
          )

    const datesCurrent = [
      ...prevOffset,
      ...createMonthDate(calendar.slider.add(-1, 'M')),
      ...createMonthDate(calendar.slider),
      ...createMonthDate(calendar.slider.add(1, 'M')),
    ]

    setCalendar('dates', [
      ...datesCurrent,
      ...createMonthDate(calendar.slider.add(2, 'M')).slice(
        0,
        TABLES - datesCurrent.length
      ),
    ])
  })

  createEffect(() => {
    const changedMonth = calendar.slider.month()

    let el: HTMLElement | null
    let mo: NodeListOf<HTMLElement> | undefined

    promise()
      .then(() => dayjs.months()[changedMonth])
      .then((selector) => {
        el = document.getElementById(`dpm-${selector}`)
        mo = el?.querySelectorAll<HTMLElement>('[data-begin]')

        setState('offset', -Array.from(mo || [])[1]?.offsetTop)
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

  function createMonthDate(day: dayjs.Dayjs) {
    const keys = Array(day.endOf('M').date()).keys()
    const dates = [...keys].map((num) => ({
      days: day
        .date(num + 1)
        .month(day.month())
        .year(day.year())
        .day(),
      month: day.month(),
      year: day.year(),
      date: num + 1,
    }))

    return dates
  }

  function formatInstance<T>(time: T) {
    if (dayjs.isDayjs(time)) {
      return time.format(props.format)
    }

    // prettier-ignore
    return typeof time === 'string' && !!time
      ? dayjs(time).format(props.format)
      : ''
  }

  function onChangedMonthEffect() {
    const year = calendar.slider.year()
    const month = dayjs.months()

    // Default show all months
    let mnt = dayjs.months() as string[]

    if (maxtime && year === maxtime.year()) {
      mnt = month.slice(0, maxtime.month() + 1)
    }

    if (mintime && year === mintime.year()) {
      mnt = month.slice(mintime.month())
    }

    if (maxtime && mintime && mintime.year() === maxtime.year()) {
      mnt = month.slice(mintime.month(), maxtime.month() + 1)
    }

    setMonths((prev) => {
      const exact = prev.every((p) => mnt.includes(p))
      const differentMonth = prev.length !== mnt.length

      return prev.length === 0 || differentMonth || !exact ? mnt : prev
    })
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

    // console.log([month, year])

    setCalendar('slider', (prev) => {
      const indexMonth = dayjs.months().indexOf(month)

      // if (prev.month(indexMonth).year(+year).isSame(prev)) {
      //   return prev
      // }

      return prev.month(indexMonth).year(+year)
    })
  }

  function onChangedSelected() {
    const month = months()
    const last = month[month.length - 1]

    console.log(mintime ? month[0] : last)

    if (month.indexOf(calendar.month) > -1) {
      return calendar.month
    }

    if (mintime && maxtime) {
      return calendar.slider.isAfter(maxtime) ? last : month[0]
    }

    // console.log(mintime ? month[0] : last)

    return mintime ? month[0] : last
  }

  createEffect(onChangedMonthEffect)
  createEffect(onChangedYearEffect)

  return (
    <div class='rounded-xl bg-translucent-light'>
      {/* <p class='pb-4'>
          <b>Now:</b> {dayjs(Date.now()).format(format)} <br />
          <b>Month:</b> {calendar.slider.format('MMMM YYYY')}
        </p> */}
      <div class='flex w-[320px] max-w-[320px] flex-col p-5'>
        <div class='grid grid-cols-7 gap-x-3 space-y-0.5'>
          <div class='col-span-5 flex flex-col'>
            <p class='flex items-center text-sm font-semibold text-gray-500'>
              <span class='mr-0.5 block'>{calendar.slider.year()}</span>
              <IconChevron dir='right' size={10} weight='3' />
            </p>
            <p class='mt-0.5 text-heading font-bold -tracking-heading text-black'>
              {calendar.month}
            </p>
          </div>
          <div>
            <ButtonBase
              onclick={monthGo('prev')}
              class={clsx(
                'h-full w-full !items-end justify-center focus-visible:!shadow-none',
                '!text-gray-400 focus:!text-primary'
              )}
              disabled={
                (mintime &&
                  calendar.slider.add(-1, 'M').isBefore(mintime, 'M')) ||
                calendar.slider.add(-1, 'M').year() < YEAR_START_AT
              }
            >
              <IconChevron size={16} />
            </ButtonBase>
          </div>
          <div>
            <ButtonBase
              onclick={monthGo('next')}
              class={clsx(
                'h-full w-full !items-end justify-center !text-gray-400',
                'focus:!text-primary focus-visible:!shadow-none'
              )}
              disabled={
                (maxtime &&
                  calendar.slider.add(1, 'M').isAfter(maxtime, 'M')) ||
                calendar.slider.add(1, 'M').year() > YEAR_STOP_AT
              }
            >
              <IconChevron size={16} dir='bottom' />
            </ButtonBase>
          </div>
        </div>
        <div class='mt-3 grid grid-cols-7 gap-x-3'>
          {dayjs.weekdaysShort().map((dayName, index) => (
            <div
              class={clsx(
                'flex h-8 w-full items-center justify-center text-caption',
                'font-medium uppercase tracking-base text-gray-500',
                {
                  'text-red-500': index === 0,
                }
              )}
            >
              {dayName}
            </div>
          ))}
        </div>
        <div class='h-[202px] overflow-hidden'>
          <div
            style={{ transform: `translateY(${state.offset}px)` }}
            ontransitionend={monthGo('end')}
            class={clsx({
              'transition-transform duration-300':
                state.isAnimating === 'month',
            })}
          >
            <div
              ref={wrapperButton}
              id={`dpm-${calendar.month}`}
              class={clsx('relative grid w-full grid-cols-7 gap-x-3 gap-y-0.5')}
            >
              {calendar.dates.map((time) => (
                <div
                  role='button'
                  data-begin={time.date === 1 ? '' : undefined}
                  // disabled={time.month !== calendar.slider.get('M')}
                  onclick={() => console.log(unwrap(time))}
                  class={clsx(
                    'flex h-8 w-full items-center justify-center text-lead font-medium -tracking-heading text-black',
                    {
                      'text-red-500': time.days === 0,
                      'pointer-events-none opacity-25':
                        time.month !== calendar.slider.get('M') &&
                        state.isAnimating === 'none',
                    }
                  )}
                >
                  {time.date}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div class='flex space-x-4'>
          <Popup
            trigger={{ children: 'Pick year' }}
            root={{
              open: state.showYearMonthPicker,
              onOpenChange: (isOpen) => setState('showYearMonthPicker', isOpen),
            }}
          >
            <ScrollPicker
              // show={state.showYearMonthPicker}
              // trigger={{ children: 'Pick year' }}
              // setShow={(isOpen) => setState('showYearMonthPicker', isOpen)}
              onchange={onChangedPicker}
              items={[
                {
                  selected: calendar.month,
                  option: months(),
                  classes: { li: 'min-w-[107px]' },
                },
                {
                  selected: calendar.year,
                  option: years(),
                },
              ]}
            />
          </Popup>
        </div>
      </div>
    </div>
  )
}

export default DatePicker

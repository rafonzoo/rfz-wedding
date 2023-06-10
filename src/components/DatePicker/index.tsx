import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
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
  // value: string
  instance: dayjs.Dayjs
  date: string
  year: string
  days: string
  month: string
}

interface DatePickerState {
  showYearMonthPicker: boolean
  calendar: {
    dates: TimeProps[]
    offset: number
    lastAction: 'next' | 'prev'
    isAnimating: boolean
  }
}

const TABLES = 105
const OFFSET = -136

const YEAR_START_AT = 1950
const YEAR_STOP_AT = 2050

const [pickerData, setPickerData] = createSignal<
  { id: string; instance: dayjs.Dayjs }[]
>([])

const DatePicker: FC<DatePickerProps> = (props) => {
  const mintime = props.min ? dayjs(props.min) : undefined
  const maxtime = props.max ? dayjs(props.max) : undefined
  const current = pickerData().find(({ id }) => id === props.id)?.instance

  // prettier-ignore
  const config = {
    // value: formatInstance(Date.now()),
    instance: current || (maxtime ?? dayjs(Date.now())),
    get year() { return `${this.instance.year()}` },
    get date() { return `0${this.instance.date()}`.slice(-2) },
    get days() { return `${dayjs.weekdays()[this.instance.day()]}` },
    get month() { return dayjs.months()[this.instance.month()] },
  }

  const [picker, setPicker] = createStore<DatePickerStore>(config)
  const [state, setState] = createStore<DatePickerState>({
    showYearMonthPicker: false,
    calendar: {
      dates: [],
      lastAction: 'prev',
      isAnimating: false,
      offset: OFFSET,
    },
  })

  // TODO: MOVE TO STATE CALENDAR ABOVE!!
  const [months, setMonths] = createSignal<string[]>([])
  const [years, setYears] = createSignal<string[]>([])

  if (
    mintime &&
    maxtime &&
    (mintime.isAfter(maxtime, 'M') || maxtime.isBefore(mintime, 'M'))
  ) {
    throw new Error('Invalid date.')
  }

  let wrapperButton: HTMLDivElement

  createEffect(() => {
    const instance = picker.instance

    setPickerData((prev) => {
      if (prev.find((item) => item.id === props.id)) {
        const now = prev.find((data) => data.id === props.id)

        if (now?.instance.isSame(instance, 'M')) {
          return prev
        }

        return prev.map((data) =>
          data.id !== props.id ? { ...data } : { id: props.id, instance }
        )
      }

      return [...prev, { id: props.id, instance: instance }]
    })
  })

  createEffect(() => {
    const prevOffset =
      picker.instance.add(-1, 'M').date(1).day() <= 0
        ? []
        : createMonthDate(picker.instance.add(-2, 'M')).slice(
            -picker.instance.add(-1, 'M').date(1).day()
          )

    const datesCurrent = [
      ...prevOffset,
      ...createMonthDate(picker.instance.add(-1, 'M')),
      ...createMonthDate(picker.instance),
      ...createMonthDate(picker.instance.add(1, 'M')),
    ]

    setState('calendar', 'dates', [
      ...datesCurrent,
      ...createMonthDate(picker.instance.add(2, 'M')).slice(
        0,
        TABLES - datesCurrent.length
      ),
    ])
  })

  createEffect(() => {
    let mo: NodeListOf<HTMLElement> | undefined

    promise(picker.month).then(() => {
      mo = wrapperButton.querySelectorAll<HTMLElement>('[data-begin]')
      setState('calendar', 'offset', -Array.from(mo || [])[1]?.offsetTop)
    })
  })

  function monthGo(states: 'next' | 'prev' | 'end') {
    const isEnd = states === 'end'
    const index = states === 'next' ? 2 : isEnd ? 1 : 0

    return (e: Event) => {
      e.preventDefault()

      // prettier-ignore
      isEnd && setPicker('instance', (prev) =>
        prev.add(state.calendar.lastAction === 'next' ? 1 : -1, 'M')
      )

      const el = wrapperButton.querySelectorAll<HTMLElement>('[data-begin]')
      const offset = -Array.from(el)[index].offsetTop

      setState('calendar', (prev) => ({
        ...prev,
        offset,
        lastAction: isEnd ? prev.lastAction : states,
        isAnimating: !isEnd,
      }))
    }
  }

  function createMonthDate(instance: dayjs.Dayjs) {
    const keys = Array(instance.endOf('M').date()).keys()
    const dates = [...keys].map((num) => ({
      days: instance
        .date(num + 1)
        .month(instance.month())
        .year(instance.year())
        .day(),
      month: instance.month(),
      year: instance.year(),
      date: num + 1,
    }))

    return dates
  }

  function isHighlighted(datetime: TimeProps) {
    return (
      datetime.month !== picker.instance.get('M') && !state.calendar.isAnimating
    )
  }

  function isDisabledAction(state: 'next' | 'prev') {
    let hasMinMax = false
    let stopMinMax = false

    switch (state) {
      case 'prev':
        stopMinMax = picker.instance.add(-1, 'M').year() < YEAR_START_AT
        hasMinMax = !!(
          mintime && picker.instance.add(-1, 'M').isBefore(mintime, 'M')
        )

        break
      case 'next':
        stopMinMax = picker.instance.add(1, 'M').year() > YEAR_STOP_AT
        hasMinMax = !!(
          maxtime && picker.instance.add(1, 'M').isAfter(maxtime, 'M')
        )

        break
    }

    return hasMinMax || stopMinMax
  }

  function onChangedPicker([month, year]: string[]) {
    let monthIndex = dayjs.months().indexOf(month)
    let values = [month, year]

    if (monthIndex < 0) {
      throw new Error(`ReferenceError: No index found, index of ${month}`)
    }

    setPicker('instance', (prev) => {
      if (!months().includes(month) && picker.year === year) {
        monthIndex = dayjs.months().indexOf(onChangedSelected())
        values = [onChangedSelected(), year]
      }

      if (prev.month(monthIndex).year(+year).isSame(prev)) {
        return prev
      }

      return prev.month(monthIndex).year(+year)
    })

    return values
  }

  function onChangedSelected() {
    const fmonth = months()[0]
    const lmonth = months()[months().length - 1]

    if (months().indexOf(picker.month) > -1) {
      return picker.month
    }

    if (mintime && maxtime) {
      return picker.instance.isAfter(maxtime) ? lmonth : fmonth
    }

    return mintime ? fmonth : lmonth
  }

  // function formatInstance<T>(time: T) {
  //   if (dayjs.isDayjs(time)) {
  //     return time.format(props.format)
  //   }

  //   // prettier-ignore
  //   return typeof time === 'string' && !!time
  //     ? dayjs(time).format(props.format)
  //     : ''
  // }

  function onChangedMonthEffect() {
    const year = +picker.year
    const monthNames = dayjs.months()

    // Default show all months
    let mnt = dayjs.months() as string[]

    if (maxtime && year === maxtime.year()) {
      mnt = monthNames.slice(0, maxtime.month() + 1)
    }

    if (mintime && year === mintime.year()) {
      mnt = monthNames.slice(mintime.month())
    }

    if (maxtime && mintime && mintime.year() === maxtime.year()) {
      mnt = monthNames.slice(mintime.month(), maxtime.month() + 1)
    }

    setMonths((prev) => {
      const exact = prev.every((prevMonths) => mnt.includes(prevMonths))
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

  createEffect(onChangedMonthEffect)
  createEffect(onChangedYearEffect)

  return (
    <div class={styles.outer}>
      <div class={styles.inner}>
        <div class={styles.grid}>
          <Popup
            open={state.showYearMonthPicker}
            onOpenChange={(isOpen) => setState('showYearMonthPicker', isOpen)}
            trigger={{
              as: 'div',
              class: styles.grid_picker,
              children: (
                <>
                  <p class={styles.grid_year}>
                    <span class='mr-0.5 block'>{picker.year}</span>
                    <IconChevron dir='right' size={10} weight='3' />
                  </p>
                  <p class={styles.grid_month}>{picker.month}</p>
                </>
              ),
            }}
            content={{ class: 'origin-top-left' }}
            root={{
              placement: 'bottom-start',
              gutter: 12,
            }}
          >
            <ScrollPicker
              onchange={onChangedPicker}
              classes={{
                outer: 'max-xxs:-ml-3 xxs:w-[280px]',
                inner: 'w-full',
              }}
              items={[
                {
                  selected: onChangedSelected(),
                  option: months(),
                  classes: { li: 'min-w-[107px]' },
                },
                {
                  selected: picker.year,
                  option: years(),
                  classes: { p: 'justify-center' },
                },
              ]}
            />
          </Popup>
          <div class={styles.grid_action}>
            <ButtonBase
              onclick={monthGo('prev')}
              class={styles.grid_button}
              children={<IconChevron size={16} dir='top' />}
              disabled={isDisabledAction('prev')}
            />
          </div>
          <div class={styles.grid_action}>
            <ButtonBase
              onclick={monthGo('next')}
              class={styles.grid_button}
              children={<IconChevron size={16} dir='bottom' />}
              disabled={isDisabledAction('next')}
            />
          </div>
        </div>
        <div class={styles.grid}>
          {dayjs.weekdaysShort().map((dayName, index) => (
            <div
              class={clsx(styles.grid_days)}
              classList={{ [styles.weekend]: index === 0 }}
              children={dayName}
            />
          ))}
        </div>
        <div class={styles.tiles}>
          <div
            style={{ transform: `translateY(${state.calendar.offset}px)` }}
            class={clsx(state.calendar.isAnimating && styles.tiles_animation)}
            ontransitionend={monthGo('end')}
          >
            <div ref={(el) => (wrapperButton = el)} class={styles.tiles_grid}>
              {state.calendar.dates.map((time) => (
                <div
                  // disabled={time.month !== calendar.slider.get('M')}
                  // onclick={() => console.log(unwrap(time))}
                  role='button'
                  data-begin={time.date === 1 ? '' : undefined}
                  children={time.date}
                  class={clsx(styles.tiles_dates, {
                    [styles.weekend]: time.days === 0,
                    [styles.tiles_highlight]: isHighlighted(time),
                  })}
                />
              ))}
            </div>
          </div>
        </div>
        <div class={styles.footer}>
          <div class='flex items-center'>
            <span class='mr-0.5 block'>
              Time: {dayjs(Date.now()).format('hh.mm A')}
            </span>
            <IconChevron dir='right' size={10} weight='3' />
          </div>
          <button>Reset</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  outer: clsx('rounded-xl bg-translucent-light'),
  inner: clsx('flex w-[320px] max-w-[320px] flex-col p-5 max-xxs:w-[270px]'),
  weekend: clsx('text-red-500'),
  footer: clsx('mt-3 flex justify-between font-semibold text-black'),

  // Header
  grid: clsx('grid grid-cols-7 gap-x-3'),
  grid_picker: clsx('col-span-5 flex flex-col'),
  grid_action: clsx('flex items-end'),
  grid_year: clsx('flex items-center text-sm font-semibold text-gray-500'),
  grid_month: clsx(
    'mt-0.5 text-heading font-bold -tracking-heading text-black'
  ),
  grid_button: clsx(
    'h-6 w-6 !items-end justify-center !text-gray-400',
    'focus-visible:!shadow-none active:!text-primary'
  ),
  grid_days: clsx(
    'flex h-8 w-full items-center justify-center text-caption',
    'pt-3 font-medium uppercase tracking-base text-gray-500'
  ),

  // Tiles
  tiles: clsx('h-[202px] overflow-hidden'),
  tiles_animation: clsx('transition-transform duration-300'),
  tiles_grid: clsx('relative grid w-full grid-cols-7 gap-x-3 gap-y-0.5'),
  tiles_highlight: clsx('pointer-events-none opacity-25'),
  tiles_dates: clsx(
    'flex h-8 w-full items-center justify-center text-black',
    'text-lead font-medium -tracking-heading'
  ),
}

export default DatePicker

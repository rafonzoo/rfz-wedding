import type { TextFieldInputProps } from '@kobalte/core/dist/types/text-field'
import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { batch, createEffect, createSignal, splitProps } from 'solid-js'
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

interface DatePickerProps extends TextFieldInputProps {
  id: string
  format?: string
}

interface DatePickerStore {
  // value: dayjs.Dayjs | null
  selected: dayjs.Dayjs | undefined
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
    years: string[]
    months: string[]
  }
  animation: {
    offset: number
    lastAction: 'next' | 'prev'
    isAnimated: boolean
  }
}

const TABLES = 105
const OFFSET = -136

const YEAR_START_AT = 1950
const YEAR_STOP_AT = 2050

const [pickerData, setPickerData] = createSignal<
  { id: string; instance: dayjs.Dayjs; selected?: dayjs.Dayjs }[]
>([])

const DatePicker: FC<DatePickerProps> = (props) => {
  const [{ id }] = splitProps(props, ['id', 'format'])
  const current = pickerData().find((data) => data.id === id)
  const propval = Array.isArray(props.value)
    ? props.value.join('')
    : props.value

  const mintime = props.min ? dayjs(props.min) : void 0
  const maxtime = props.max ? dayjs(props.max) : void 0
  const initial = propval ? dayjs(propval) : void 0
  const datenow = initial ?? maxtime ?? dayjs(Date.now())

  if (validateInput().invalid) {
    throw new Error(validateInput().message)
  }

  // prettier-ignore
  const [picker, setPicker] = createStore<DatePickerStore>({
    instance: current?.selected ?? current?.instance ?? datenow,
    selected: current?.selected ?? initial ?? maxtime ?? void 0,
    get year() { return `${this.instance.year()}` },
    get date() { return `0${this.instance.date()}`.slice(-2) },
    get days() { return `${dayjs.weekdays()[this.instance.day()]}` },
    get month() { return dayjs.months()[this.instance.month()] },
  })

  const [state, setState] = createStore<DatePickerState>({
    showYearMonthPicker: false,
    calendar: {
      dates: [],
      years: [],
      months: [],
    },
    animation: {
      lastAction: 'prev',
      isAnimated: false,
      offset: OFFSET,
    },
  })

  let wrapperButton: HTMLDivElement

  createEffect(() => {
    const instance = picker.instance
    const selected = picker.selected

    setPickerData((prev) => {
      if (prev.find((item) => item.id === id)) {
        const now = prev.find((data) => data.id === id)

        if (now && now.instance.isSame(instance, 'day')) {
          return prev
        }

        return prev.map((data) =>
          data.id !== id
            ? { ...data }
            : { ...(selected ? { selected } : data), id, instance }
        )
      }

      return [...prev, { ...(selected ? { selected } : {}), id, instance }]
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
    let dates: NodeListOf<HTMLElement> | undefined

    promise(picker.month).then(() => {
      dates = wrapperButton.querySelectorAll<HTMLElement>('[data-begin]')
      setState('animation', 'offset', -Array.from(dates || [])[1]?.offsetTop)
    })
  })

  function monthGo(states: 'next' | 'prev' | 'end') {
    const isEnd = states === 'end'
    const index = states === 'next' ? 2 : isEnd ? 1 : 0

    return (e: Event) => {
      e.preventDefault()

      // prettier-ignore
      isEnd && setPicker('instance', (prev) =>
        prev.add(state.animation.lastAction === 'next' ? 1 : -1, 'M')
      )

      const el = wrapperButton.querySelectorAll<HTMLElement>('[data-begin]')
      const offset = -Array.from(el)[index].offsetTop

      setState('animation', (prev) => ({
        ...prev,
        offset,
        lastAction: isEnd ? prev.lastAction : states,
        isAnimated: !isEnd,
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
      datetime.month !== picker.instance.get('M') && !state.animation.isAnimated
    )
  }

  function isCurrentDate(datetime: TimeProps, weekend = false) {
    const selected = picker.selected

    const isToday =
      (selected?.date() || dayjs(Date.now()).date()) === datetime.date &&
      (selected?.month() || dayjs(Date.now()).month()) === datetime.month &&
      (selected?.year() || dayjs(Date.now()).year()) === datetime.year

    return weekend ? isToday && datetime.days === 0 : isToday
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

  function validateInput() {
    let message = null

    if (
      (initial && !initial.isValid()) ||
      (mintime && !mintime.isValid()) ||
      (maxtime && !maxtime.isValid())
    ) {
      message = 'Invalid date.'
    }

    if (initial) {
      const unsupLessYear = initial.year() < YEAR_START_AT
      const unsupMoreYear = initial.year() > YEAR_STOP_AT

      if (unsupLessYear || unsupMoreYear) {
        message = `Only support year within ${YEAR_START_AT} - ${YEAR_STOP_AT}.`
      }

      if (
        (mintime && initial.isBefore(mintime, 'M')) ||
        (maxtime && initial.isAfter(maxtime, 'M'))
      ) {
        message = 'Initial value mismatch with "min" or "max"'
      }
    }

    if (
      (mintime && mintime.year() < YEAR_START_AT) ||
      (maxtime && maxtime.year() > YEAR_STOP_AT)
    ) {
      message = `Only support year within ${YEAR_START_AT} - ${YEAR_STOP_AT}.`
    }

    if (mintime && maxtime) {
      const minimum = mintime.isAfter(maxtime, 'M')
      const maximum = maxtime.isBefore(mintime, 'M')

      if (minimum || maximum) {
        message = 'Min and max mismatch.'
      }
    }

    return {
      invalid: !!message,
      message: message ?? '',
    }
  }

  function onClickSelectedDate(datetime: TimeProps) {
    const { month, year } = datetime

    return (e: Event) => {
      const value = (e.target as HTMLElement | null)?.textContent

      if (!value || picker.instance.date() === +value) {
        return
      }

      batch(() => {
        setPicker('instance', (prev) =>
          prev.date(+value).month(month).year(year)
        )
        setPicker('selected', (prev) =>
          (prev || dayjs()).date(+value).month(month).year(year)
        )
      })
    }
  }

  createEffect(() => {
    console.log(pickerData())
  })

  function onChangedPicker([month, year]: string[]) {
    let monthIndex = dayjs.months().indexOf(month)
    let values = [month, year]

    if (monthIndex < 0) {
      throw new Error(`ReferenceError: No index found, index of ${month}`)
    }

    setPicker('instance', (prev) => {
      if (!state.calendar.months.includes(month) && picker.year === year) {
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
    const fmonth = state.calendar.months[0]
    const lmonth = state.calendar.months[state.calendar.months.length - 1]

    if (state.calendar.months.indexOf(picker.month) > -1) {
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
    let list = dayjs.months() as string[]

    if (maxtime && year === maxtime.year()) {
      list = monthNames.slice(0, maxtime.month() + 1)
    }

    if (mintime && year === mintime.year()) {
      list = monthNames.slice(mintime.month())
    }

    if (maxtime && mintime && mintime.year() === maxtime.year()) {
      list = monthNames.slice(mintime.month(), maxtime.month() + 1)
    }

    setState('calendar', 'months', (prev) => {
      const equal = prev.every((prevMonths) => list.includes(prevMonths))
      const differentMonth = prev.length !== list.length

      return prev.length === 0 || differentMonth || !equal ? list : prev
    })
  }

  function onChangedYearEffect() {
    // eslint-disable-next-line prefer-const
    let array: string[] = []
    let i = mintime ? mintime.year() : YEAR_START_AT

    for (; i <= (maxtime ? maxtime.year() : YEAR_STOP_AT); i++) {
      array.push(i + '')
    }

    setState('calendar', 'years', array)
  }

  createEffect(onChangedMonthEffect)
  createEffect(onChangedYearEffect)

  return (
    <div class={styles.outer}>
      <div class={styles.inner}>
        <div class={styles.header}>
          <Popup
            open={state.showYearMonthPicker}
            onOpenChange={(isOpen) => setState('showYearMonthPicker', isOpen)}
            trigger={{
              as: 'div',
              class: styles.header_picker,
              children: (
                <>
                  <p class={styles.header_year}>
                    <span class='mr-0.5 block'>{picker.year}</span>
                    <IconChevron dir='right' size={10} weight='3' />
                  </p>
                  <p class={styles.header_month}>{picker.month}</p>
                </>
              ),
            }}
            content={{ class: 'origin-top-left' }}
            root={{
              placement: 'bottom-start',
              gutter: 12,
              modal: true,
            }}
          >
            <ScrollPicker
              onchange={onChangedPicker}
              classes={{
                outer: styles.picker_outer,
                inner: styles.picker_inner,
              }}
              items={[
                {
                  selected: onChangedSelected(),
                  option: state.calendar.months,
                  classes: { li: styles.picker_month },
                },
                {
                  selected: picker.year,
                  option: state.calendar.years,
                  classes: { p: styles.picker_year },
                },
              ]}
            />
          </Popup>
          <div class={styles.header_action}>
            <ButtonBase
              onclick={monthGo('prev')}
              class={styles.header_button}
              children={<IconChevron size={16} dir='top' />}
              disabled={isDisabledAction('prev')}
            />
          </div>
          <div class={styles.header_action}>
            <ButtonBase
              onclick={monthGo('next')}
              class={styles.header_button}
              children={<IconChevron size={16} dir='bottom' />}
              disabled={isDisabledAction('next')}
            />
          </div>
        </div>
        <div class={styles.header}>
          {dayjs.weekdaysShort().map((dayName, index) => (
            <div
              class={clsx(styles.header_days)}
              classList={{ [styles.weekend]: index === 0 }}
              children={dayName}
            />
          ))}
        </div>
        <div class={styles.tile}>
          <div
            style={{ transform: `translateY(${state.animation.offset}px)` }}
            class={clsx(state.animation.isAnimated && styles.tile_animation)}
            ontransitionend={monthGo('end')}
          >
            <div ref={(el) => (wrapperButton = el)} class={styles.tile_grid}>
              {state.calendar.dates.map((time) => (
                <div
                  // disabled={time.month !== calendar.slider.get('M')}
                  role='button'
                  onclick={onClickSelectedDate(time)}
                  data-begin={time.date === 1 ? '' : undefined}
                  children={time.date}
                  class={clsx(styles.tile_dates, {
                    [styles.weekend]: time.days === 0,
                    [styles.tile_highlight]: isHighlighted(time),
                    [styles.tile_today]: isCurrentDate(time),
                    [styles.tile_today_weekend]: isCurrentDate(time, true),
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
          <button
            onclick={() => {
              batch(() => {
                setPicker('instance', (prev) =>
                  prev.isSame(datenow) ? prev : datenow
                )

                setPicker('selected', (prev) =>
                  !prev ? prev : picker.instance
                )
              })
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

const baseStyles = {
  outer: clsx('rounded-xl bg-translucent-light'),
  inner: clsx('flex w-[320px] max-w-[320px] flex-col p-5 max-xxs:w-[270px]'),
  weekend: clsx('text-red-500'),
  footer: clsx('mt-3 flex justify-between font-semibold text-black'),
}

const pickerStyles = {
  picker_outer: clsx('max-xxs:-ml-3 xxs:w-[280px]'),
  picker_inner: clsx('w-full'),
  picker_month: clsx('min-w-[107px]'),
  picker_year: clsx('justify-center'),
}

const headerStyles = {
  header: clsx('grid grid-cols-7 gap-x-3'),
  header_picker: clsx('col-span-5 flex flex-col focus:outline-none'),
  header_action: clsx('flex items-end'),
  header_year: clsx('flex items-center text-sm font-semibold text-gray-500'),
  header_month: clsx(
    'mt-0.5 text-heading font-bold -tracking-heading text-black'
  ),
  header_button: clsx(
    'h-6 w-6 !items-end justify-center !text-gray-400',
    'focus-visible:!shadow-none active:!text-primary'
  ),
  header_days: clsx(
    'flex h-8 w-full items-center justify-center text-caption',
    'pt-3 font-medium uppercase tracking-base text-gray-500'
  ),
}

const tileStyles = {
  tile: clsx('-ml-5 -mr-5 h-[202px] overflow-hidden px-5'),
  tile_animation: clsx('transition-transform duration-300'),
  tile_grid: clsx('relative grid w-full grid-cols-7 gap-x-3 gap-y-0.5'),
  tile_highlight: clsx('pointer-events-none opacity-25'),
  tile_today_weekend: clsx('before:!bg-red-500 before:!opacity-20'),
  tile_today: clsx(
    'before:absolute before:left-1/2 before:top-1/2 before:content-[""]',
    'before:h-9 before:w-9 before:rounded-full before:translate-3d-center',
    'before:bg-black before:font-bold before:opacity-10'
  ),
  tile_dates: clsx(
    'flex h-8 w-full items-center justify-center text-black',
    'relative text-lead font-medium -tracking-heading'
  ),
}

const styles = {
  ...baseStyles,
  ...pickerStyles,
  ...headerStyles,
  ...tileStyles,
}

export default DatePicker

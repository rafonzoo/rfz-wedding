import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { batch, createEffect, createSignal, splitProps } from 'solid-js'
import { leading, promise } from '@app/helpers/util'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { Picker } from '@app/components/Picker'
import IconChevron from '@app/components/Icon/Chevron'
import ButtonBase from '@app/components/Button/Base'

interface CalendarOption {
  date: number
  days: number
  year: number
  month: number
  disabled?: boolean
}

interface iCalendar {
  id: string
  type?: string
  value?: string | number
  max?: string | number
  min?: string | number
  onchange?: (value: string) => void
  onclose?: () => void
}

interface CalendarStore {
  selected: dayjs.Dayjs
  instance: dayjs.Dayjs
  date: string
  year: string
  days: string
  month: string
  hour: string
  minute: string
}

interface CalendarState {
  showYearMonthPicker: boolean
  showTimeLocalPicker: boolean
  calendar: {
    dates: CalendarOption[]
    years: string[]
    months: string[]
    hours: string[]
    minutes: string[]
  }
  animation: {
    offset: number
    lastAction: 'next' | 'prev'
    isAnimated: boolean
  }
}

interface CalendarData {
  id: string
  selected?: dayjs.Dayjs
  instance: dayjs.Dayjs
}

const TABLES = 105
const OFFSET = -136

const YEAR_START_AT = 1950
const YEAR_STOP_AT = 2050

const [calendarData, setCalendarData] = createSignal<CalendarData[]>([])

const Calendar: FC<iCalendar> = (props) => {
  const [{ id, type }] = splitProps(props, ['id', 'type'])

  const mintime = props.min ? dayjs(props.min) : void 0
  const maxtime = props.max ? dayjs(props.max) : void 0
  const initial = props.value ? dayjs(props.value) : void 0

  const format = type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DDTHH:mm'
  const saved = calendarData().find((data) => data.id === id)

  if (onCheckValidation().invalid) {
    throw new Error(onCheckValidation().message)
  }

  // prettier-ignore
  const [controller, setController] = createStore<CalendarStore>({
    instance: saved?.selected ?? saved?.instance ?? createInitialValue(),
    selected: saved?.selected ?? saved?.instance ?? createInitialValue(),

    // READ ONLY!
    get year() { return this.instance.year() + '' },
    get date() { return leading(this.instance.date()) },
    get hour() { return leading((this.selected || this.instance).hour()) },
    get days() { return dayjs.weekdays()[this.instance.day()] },
    get month() { return dayjs.months()[this.instance.month()] },
    get minute() { return leading((this.selected || this.instance).minute()) },
  })

  const [state, setState] = createStore<CalendarState>({
    showYearMonthPicker: false,
    showTimeLocalPicker: false,
    calendar: {
      dates: [],
      years: [],
      months: [],
      hours: [...Array(24).keys()].map((hour) => leading(hour)),
      minutes: [...Array(60).keys()].map((min) => leading(min)),
    },
    animation: {
      lastAction: 'prev',
      isAnimated: false,
      offset: OFFSET,
    },
  })

  let wrapperButton: HTMLDivElement

  createEffect(() => {
    const instance = controller.instance
    const selected = controller.selected

    setCalendarData((prev) => {
      if (prev.find((item) => item.id === id)) {
        const now = prev.find((item) => item.id === id)

        if (controller.selected.isSame(now?.selected)) {
          return prev
        }

        return prev.map((data) =>
          data.id !== id ? { ...data } : { id, instance, selected }
        )
      }

      return [...prev, { id, instance, selected }]
    })
  })

  createEffect(() => {
    const prevOffset =
      controller.instance.add(-1, 'M').date(1).day() <= 0
        ? []
        : createMonthDate(controller.instance.add(-2, 'M')).slice(
            -controller.instance.add(-1, 'M').date(1).day()
          )

    const datesCurrent = [
      ...prevOffset,
      ...createMonthDate(controller.instance.add(-1, 'M')),
      ...createMonthDate(controller.instance),
      ...createMonthDate(controller.instance.add(1, 'M')),
    ]

    setState('calendar', 'dates', [
      ...datesCurrent,
      ...createMonthDate(controller.instance.add(2, 'M')).slice(
        0,
        TABLES - datesCurrent.length
      ),
    ])
  })

  createEffect(() => {
    let dates: NodeListOf<HTMLElement> | undefined

    promise(controller.month).then(() => {
      dates = wrapperButton.querySelectorAll<HTMLElement>('[data-begin]')
      setState('animation', 'offset', -Array.from(dates || [])[1]?.offsetTop)
    })
  })

  function createInitialValue(clear = false) {
    const now = !clear ? initial ?? dayjs() : dayjs()

    if (mintime && maxtime) {
      return now.isBefore(maxtime, 'day') && now.isAfter(mintime, 'day')
        ? now
        : now.isAfter(maxtime, 'day')
        ? maxtime
        : mintime
    }

    if (mintime) {
      return mintime.isBefore(now, 'day') ? now : mintime
    }

    if (maxtime) {
      return maxtime.isAfter(now, 'day') ? now : maxtime
    }

    return now
  }

  function createAnimation(action: 'next' | 'prev' | 'end') {
    const isEnd = action === 'end'
    const index = action === 'next' ? 2 : isEnd ? 1 : 0

    return (e: Event) => {
      e.preventDefault()

      // prettier-ignore
      isEnd && setController('instance', (prev) =>
        prev.add(state.animation.lastAction === 'next' ? 1 : -1, 'M')
      )

      const el = wrapperButton.querySelectorAll<HTMLElement>('[data-begin]')
      const offset = -Array.from(el)[index].offsetTop

      setState('animation', (prev) => ({
        ...prev,
        offset,
        lastAction: isEnd ? prev.lastAction : action,
        isAnimated: !isEnd,
      }))
    }
  }

  function createMonthDate(instance: dayjs.Dayjs) {
    const keys = Array(instance.endOf('M').date()).keys()
    const dates = [...keys].map((num) => {
      const djs = instance
        .date(num + 1)
        .month(instance.month())
        .year(instance.year())

      return {
        days: djs.day(),
        month: instance.month(),
        year: instance.year(),
        date: num + 1,
        disabled:
          djs.month() !== controller.instance.month() ||
          (maxtime && djs.isAfter(maxtime, 'D')) ||
          (mintime && djs.isBefore(mintime, 'D')),
      }
    })

    return dates
  }

  function createTimeDate(
    time: Pick<CalendarOption, 'date' | 'month' | 'year'>
  ) {
    const { date, month, year } = time
    const monthName = dayjs.months()[month]

    return dayjs(`${date} ${monthName} ${year}`, 'D MMMM YYYY')
  }

  function isCurrentDate(datetime: CalendarOption, weekend = false) {
    const isToday = createTimeDate(datetime).isSame(controller.selected, 'day')
    return weekend ? isToday && datetime.days === 0 : isToday
  }

  function isDisabledAction(state: 'next' | 'prev') {
    let hasMinMax = false
    let stopMinMax = false

    switch (state) {
      case 'prev':
        stopMinMax = controller.instance.add(-1, 'M').year() < YEAR_START_AT
        hasMinMax = !!(
          mintime && controller.instance.add(-1, 'M').isBefore(mintime, 'M')
        )

        break
      case 'next':
        stopMinMax = controller.instance.add(1, 'M').year() > YEAR_STOP_AT
        hasMinMax = !!(
          maxtime && controller.instance.add(1, 'M').isAfter(maxtime, 'M')
        )

        break
    }

    return hasMinMax || stopMinMax
  }

  function onCheckValidation() {
    const unit = type === 'date' ? 'day' : void 0
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
    }

    if (
      (mintime && mintime.year() < YEAR_START_AT) ||
      (maxtime && maxtime.year() > YEAR_STOP_AT)
    ) {
      message = `Only support year within ${YEAR_START_AT} - ${YEAR_STOP_AT}.`
    }

    if (mintime && maxtime) {
      const minimum = mintime.isAfter(maxtime, unit)
      const maximum = maxtime.isBefore(mintime, unit)

      if (minimum || maximum) {
        message = 'Min and max mismatch.'
      }
    }

    return {
      invalid: !!message,
      message: message ?? '',
    }
  }

  function onClickResetButton() {
    batch(() => {
      setController('instance', createInitialValue(true))
      setController('selected', createInitialValue(true))

      props.onchange?.('')
    })
  }

  function onClickSelectDate(datetime: CalendarOption) {
    const { date, month, year } = datetime

    return () => {
      if (
        controller.selected.date() === date &&
        controller.selected.month() === month &&
        controller.selected.year() === year
      ) {
        return
      }

      setController('selected', (prev) => {
        const now = createInitialValue()
        const select = createTimeDate({ date, month, year })
          .hour(prev ? prev.hour() : now.hour())
          .minute(prev ? prev.minute() : now.minute())

        props.onchange?.(select.format(format))
        return select
      })
    }
  }

  function onChangedMonth([month, year]: string[]) {
    let monthIndex = dayjs.months().indexOf(month)
    let values = [month, year]

    if (monthIndex < 0) {
      return
    }

    setController('instance', (prev) => {
      if (!state.calendar.months.includes(month) && controller.year === year) {
        monthIndex = dayjs.months().indexOf(onChangedSelected())
        values = [onChangedSelected(), year]
      }

      if (prev.month(monthIndex).year(+year).isSame(prev, 'M')) {
        return prev
      }

      return prev.month(monthIndex).year(+year)
    })

    return values
  }

  function onChangedTimes([hour, minute]: string[]) {
    const current = controller.selected

    if (current.hour() === +hour && current.minute() === +minute) {
      return
    }

    batch(() => {
      setController('selected', current.hour(+hour).minute(+minute))
      props.onchange?.(current.hour(+hour).minute(+minute).format(format))
    })
  }

  function onChangedSelected() {
    const fmonth = state.calendar.months[0]
    const lmonth = state.calendar.months[state.calendar.months.length - 1]

    if (state.calendar.months.indexOf(controller.month) > -1) {
      return controller.month
    }

    if (mintime && maxtime) {
      return controller.instance.isAfter(maxtime, 'M') ? lmonth : fmonth
    }

    return mintime ? fmonth : lmonth
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

  function onChangedMonthEffect() {
    const year = +controller.year
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

  createEffect(onChangedYearEffect)
  createEffect(onChangedMonthEffect)

  return (
    <div class={styles.outer}>
      <div class={styles.inner}>
        <div class={styles.header}>
          <div class={styles.header_picker}>
            <Picker
              open={state.showYearMonthPicker}
              onchange={onChangedMonth}
              onOpenChange={(isOpen) => setState('showYearMonthPicker', isOpen)}
              trigger={{ class: styles.header_trigger }}
              content={{ class: 'origin-top-left' }}
              root={{
                placement: 'bottom-start',
                gutter: 12,
                modal: true,
              }}
              classes={{
                outer: styles.picker_outer,
                inner: styles.picker_inner,
              }}
              items={[
                {
                  selected: onChangedSelected(),
                  option: state.calendar.months,
                  classes: { p: styles.picker_month },
                },
                {
                  selected: controller.year,
                  option: state.calendar.years,
                  classes: { p: styles.picker_year },
                },
              ]}
            >
              <span
                class={clsx({
                  [styles.header_year]: true,
                  [styles.active]: state.showYearMonthPicker,
                })}
              >
                <span class={styles.chevron}>{controller.year}</span>
                <IconChevron
                  dir='right'
                  size={10}
                  weight='3'
                  class={clsx({
                    [styles.transition]: true,
                    [styles.rotate('bottom')]: state.showYearMonthPicker,
                  })}
                />
              </span>
              <span class={styles.header_month}>{controller.month}</span>
            </Picker>
          </div>
          <div class={styles.header_action}>
            <ButtonBase
              onclick={createAnimation('prev')}
              class={styles.header_button}
              children={<IconChevron size={16} dir='top' />}
              disabled={isDisabledAction('prev')}
            />
          </div>
          <div class={styles.header_action}>
            <ButtonBase
              onclick={createAnimation('next')}
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
            style={{
              transform: `translate3d(0,${state.animation.offset}px,0)`,
            }}
            class={clsx(state.animation.isAnimated && styles.tile_animation)}
            ontransitionend={createAnimation('end')}
          >
            <div ref={(el) => (wrapperButton = el)} class={styles.tile_grid}>
              {state.calendar.dates.map((time) => (
                <div
                  role='button'
                  onclick={onClickSelectDate(time)}
                  data-begin={time.date === 1 ? '' : undefined}
                  children={time.date}
                  class={clsx(styles.tile_dates, {
                    [styles.weekend]: time.days === 0,
                    [styles.tile_highlight]: !!time.disabled,
                    [styles.tile_today]: isCurrentDate(time),
                    [styles.tile_today_weekend]: isCurrentDate(time, true),
                  })}
                />
              ))}
            </div>
          </div>
        </div>
        <div class={styles.footer}>
          {type === 'datetime-local' && (
            <div class={styles.datetime}>
              <Picker
                open={state.showTimeLocalPicker}
                onOpenChange={(open) => setState('showTimeLocalPicker', open)}
                trigger={{
                  class: styles.datetime_trigger,
                }}
                content={{ class: 'origin-bottom-left' }}
                root={{
                  placement: 'top-start',
                  gutter: 12,
                  modal: true,
                  flip: false,
                }}
                onchange={onChangedTimes}
                items={[
                  {
                    selected: controller.hour,
                    option: state.calendar.hours,
                    classes: { p: styles.datetime_picker },
                  },
                  {
                    selected: controller.minute,
                    option: state.calendar.minutes,
                    classes: { p: styles.datetime_picker },
                  },
                ]}
              >
                <span class={styles.datetime_wrapper}>
                  <span>Time: </span>
                  <span
                    class={clsx({
                      [styles.active]: state.showTimeLocalPicker,
                    })}
                  >
                    {controller.selected.format('HH.mm')}
                  </span>
                  <IconChevron
                    dir='right'
                    size={10}
                    weight='3'
                    class={clsx(styles.transition, {
                      [styles.rotate('top')]: state.showTimeLocalPicker,
                    })}
                  />
                </span>
              </Picker>
            </div>
          )}
          <button
            onclick={onClickResetButton}
            // disabled={value() === ''}
            class={clsx(styles.action_clear, {
              [styles.action_clear_disabled]: !controller.selected,
            })}
          >
            Clear
          </button>
          {props.type !== 'datetime-local' && (
            <button onclick={() => props.onclose?.()}>Done</button>
          )}
        </div>
      </div>
    </div>
  )
}

const baseStyles = {
  outer: clsx('rounded-xl bg-translucent-light'),
  inner: clsx('flex w-[320px] max-w-[320px] flex-col p-5 max-xxs:w-[290px]'),
  weekend: clsx('text-red-500'),
  footer: clsx('mt-3 flex justify-between font-semibold text-black'),
  active: clsx('!text-blue-500'),
  chevron: clsx('mr-0.5 block'),
  transition: clsx('transition-transform'),
  rotate: (dir: 'bottom' | 'top') => {
    return clsx(dir === 'bottom' ? '!rotate-180' : '!rotate-0', 'text-blue-500')
  },
}

const pickerStyles = {
  picker_outer: clsx('max-xxs:-ml-[2.5px] xxs:w-[280px]'),
  picker_inner: clsx('w-full'),
  picker_month: clsx('min-w-[107px]'),
  picker_year: clsx('text-center'),
}

const headerStyles = {
  header: clsx('grid grid-cols-7'),
  header_picker: clsx('col-span-5'),
  header_trigger: clsx('focus:outline-none'),
  header_action: clsx('flex items-end justify-center'),
  header_year: clsx('flex items-center text-sm font-semibold text-gray-500'),
  header_month: clsx(
    'mt-0.5 flex text-heading font-bold -tracking-heading text-black'
  ),
  header_button: clsx(
    'h-6 w-6 !items-end justify-center !text-gray-400',
    'focus-visible:!shadow-none active:!text-blue-500'
  ),
  header_days: clsx(
    'flex h-8 w-full items-center justify-center text-caption',
    'pt-3 font-medium uppercase tracking-base text-gray-500'
  ),
}

const tileStyles = {
  tile: clsx('-ml-5 -mr-5 h-[206px] overflow-hidden px-5 pt-0.5'),
  tile_animation: clsx('transition-transform duration-300'),
  tile_grid: clsx('relative grid w-full grid-cols-7 gap-y-0.5'),
  tile_highlight: clsx('pointer-events-none opacity-25'),
  tile_today_weekend: clsx('before:!bg-red-500 before:!opacity-20'),
  tile_today: clsx(
    'before:absolute before:left-1/2 before:top-1/2 before:content-[""]',
    'before:h-9 before:w-9 before:rounded-full before:translate-3d-center',
    'before:bg-black before:font-bold before:opacity-10 hover:!opacity-100'
  ),
  tile_dates: clsx(
    'flex h-8 w-full items-center justify-center text-black',
    'relative w-8 text-lead font-medium -tracking-heading',
    'hover:opacity-50'
  ),
}

const footerStyles = {
  datetime: clsx('mr-auto flex items-center'),
  datetime_trigger: clsx('flex items-center focus:outline-none'),
  datetime_wrapper: clsx('mr-0.5 flex items-center space-x-0.5'),
  datetime_picker: clsx('min-w-[40px] text-center'),
  action_clear: clsx('select-none hover:opacity-50'),
  action_clear_disabled: clsx(
    'pointer-events-none opacity-25 hover:!opacity-25'
  ),
}

const styles = {
  ...baseStyles,
  ...pickerStyles,
  ...headerStyles,
  ...tileStyles,
  ...footerStyles,
}

export default Calendar

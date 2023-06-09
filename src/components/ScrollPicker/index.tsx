import type { SetStoreFunction } from 'solid-js/store'
import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import {
  batch,
  createEffect,
  createSignal,
  For,
  onMount,
  splitProps,
} from 'solid-js'
import clsx from 'clsx'

const MAX_HEIGHT = 32
const MAX_DELAY = 150

interface ScrollOptionProps {
  option: string[]
  selected?: string
  classes?: {
    [P in 'ul' | 'li' | 'wrapper']?: string
  }
}

interface ScrollOptionState extends ScrollOptionProps {
  // state: ScrollPickerState
  // show: () => boolean
  // onchange?: (values: string[]) => void
  index: () => number
  scroller: ScrollPickerState[]
  setScroller: SetStoreFunction<ScrollPickerState[]>
}

interface ScrollPickerProps {
  // show: boolean
  // setShow: (isOpen: boolean) => void
  // trigger: PopoverTriggerProps
  // open: boolean
  items: ScrollOptionProps[]
  onchange?: (values: string[]) => void
}

interface ScrollPickerState {
  isScrolling: boolean
  value: string
}

const ScrollOption: FC<ScrollOptionState> = (props) => {
  const [isTouch, setTouch] = createSignal(false)

  let element: HTMLElement
  let tickingTime: NodeJS.Timeout
  let preventScroll = false
  // let tickingClick: NodeJS.Timeout

  function onScroll() {
    const idx = props.index()
    const scroller = props.scroller
    const setScroller = props.setScroller

    // Prevent `scrollTo` firing on the first place
    if (preventScroll) return (preventScroll = false)

    clearTimeout(tickingTime)
    setScroller(idx, 'isScrolling', (prev) => (prev ? prev : true))

    tickingTime = setTimeout(() => {
      const li = Array.from(element.querySelectorAll('li'))

      if (!(element.scrollTop % MAX_HEIGHT === 0)) {
        let n = 0
        let i = 0

        if (!isTouch()) {
          const offset = li.map(({ clientHeight }, i) => clientHeight * i)

          for (; i < offset.length; i++) {
            const prev = offset[i - 1]
            const { scrollTop } = element

            if (scrollTop - offset[i] < 0) {
              n = i

              if (
                MAX_HEIGHT - (scrollTop - (prev || 0)) >
                MAX_HEIGHT + (scrollTop - offset[i])
              ) {
                n = i - 1
              }

              break
            }
          }

          return element.scrollTo({ behavior: 'smooth', top: offset[n] })
        }

        return
      }

      const targetElement = li.find(({ clientHeight }, index) => {
        return clientHeight * index === element.scrollTop
      })

      batch(() => {
        const value = targetElement?.dataset.value ?? ''

        setScroller(idx, 'isScrolling', (prev) => (!prev ? prev : false))
        setScroller(idx, 'value', (prev) =>
          prev === value || value === '' ? prev : value
        )
      })
    }, MAX_DELAY * scroller.length)
  }

  onMount(() => {
    const idx = props.option.indexOf(props.selected!)

    if (idx > -1) {
      element.scrollTo({ top: MAX_HEIGHT * idx })
      preventScroll = true
    }
  })

  return (
    <div
      class={clsx('relative', props.classes?.wrapper)}
      ontouchstart={() => setTouch(true)}
      ontouchend={() => setTouch(false)}
      // onclick={clickHandler}
    >
      <ul
        ref={(el) => (element = el)}
        onscroll={onScroll}
        class={clsx(styles.ul, props.classes?.ul, {
          'pl-4 pr-8': props.index() > 0,
          'pl-8 pr-4': props.index() === 0,
        })}
      >
        {props.option.map((value) => (
          <li data-value={value} class={clsx(styles.li, props.classes?.li)}>
            <p class={styles.li_item}>{value}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ScrollPicker: FC<ScrollPickerProps> = (props) => {
  const [{ onchange }] = splitProps(props, ['onchange'])
  const [values, setValues] = createSignal<string[]>([])
  const [scroller, setScroller] = createStore<ScrollPickerState[]>(
    props.items.map((item) => ({
      isScrolling: false,
      value: item.selected || item.option[0],
    }))
  )

  createEffect(() => {
    if (!scroller.some((p) => !!p.isScrolling)) {
      const curr = scroller.map((sc) => sc.value)

      // Force update
      setValues((prev) =>
        JSON.stringify(curr) === JSON.stringify(prev) ? prev : curr
      )
    }
  })

  createEffect(() => onchange?.(values()))

  return (
    <div class={styles.container}>
      <div
        class={clsx(styles.wrapper)}
        style={{ 'font-size': MAX_HEIGHT + 'px' }}
      >
        <For each={props.items}>
          {(item, index) => (
            <ScrollOption
              classes={item.classes}
              option={item.option}
              selected={item.selected}
              // private
              // state={state}
              scroller={scroller}
              setScroller={setScroller}
              index={index}

              // setState={setState}
              // onchange={props.onchange}
            />
          )}
        </For>
        <div>
          <div class={clsx(styles.selected)}></div>
          <div class={styles.mask_top} />
          <div class={styles.mask_bottom} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: clsx('rounded-xl bg-gray-200'),
  wrapper: clsx('relative my-4 inline-flex'),
  selected: clsx(
    'absolute left-4 right-4 top-[3em] flex h-[1em]',
    'items-center rounded-lg bg-gray-300'
  ),
  ul: clsx(
    'relative z-10 flex max-h-[7em] flex-col py-[3em]',
    'scroll-picker snap-y-mandatory overflow-y-touch'
  ),
  li: clsx('flex min-h-[1em] snap-center flex-col'),
  li_item: clsx(
    'flex w-full flex-grow select-none items-center text-picker font-medium -tracking-heading text-black'
  ),
  mask_top: clsx(
    'pointer-events-none absolute left-0 right-0 top-0 z-10 h-[3em]',
    'bg-gradient-to-b from-gray-200 from-[10%] to-[rgb(228_228_228_/_50%)]'
  ),
  mask_bottom: clsx(
    'pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[3em]',
    'bg-gradient-to-t from-gray-200 from-[10%] to-[rgb(228_228_228_/_50%)]'
  ),
}

export default ScrollPicker

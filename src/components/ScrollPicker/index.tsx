import type { SetStoreFunction } from 'solid-js/store'
import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, createSignal, For, onMount } from 'solid-js'
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
  state: ScrollPickerState
  // show: () => boolean
  index: () => number
  setState: SetStoreFunction<ScrollPickerState>
  onchange?: (values: string[]) => void
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
  items: {
    isScrolling: boolean
    value?: string
  }[]
}

const ScrollOption: FC<ScrollOptionState> = (props) => {
  const [isTouch, setTouch] = createSignal(false)

  let element: HTMLElement
  let tickingTime: NodeJS.Timeout
  let tickingClick: NodeJS.Timeout

  function scrollValue(target: HTMLElement) {
    const children = target.querySelectorAll('li > *')
    const snap = target.scrollTop % MAX_HEIGHT === 0

    clearTimeout(tickingTime)
    props.setState('items', props.index(), 'isScrolling', true)

    tickingTime = setTimeout(() => {
      const offset = Array.from(children).map(
        (child, i) => child.parentElement!.clientHeight * i
      )

      // console.log(snap, props.state.items[props.index()])

      if (!snap) {
        let n = 0

        if (!isTouch()) {
          for (let i = 0; i < offset.length; i++) {
            const prev = offset[i - 1]
            const { scrollTop } = target

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

          return element.scroll({ behavior: 'smooth', top: offset[n] })
        }

        return
      }

      const snapped = offset.find((child) => element.scrollTop === child)
      const value = children[offset.indexOf(snapped!)]?.textContent ?? ''

      props.setState('items', props.index(), (prev) => {
        return {
          isScrolling:
            prev.isScrolling === isTouch() ? prev.isScrolling : false,
          value: prev.value === value ? prev.value : value,
        }
      })
    }, MAX_DELAY * props.state.items.length)
  }

  function clickHandler(event: Event) {
    const value = (event.target as HTMLElement).textContent
    const idx = props.option.findIndex((opt) => opt === value)

    // Interup touch end
    event.preventDefault()

    if (props.state.items.some((state) => state.isScrolling)) {
      clearTimeout(tickingClick)

      tickingClick = setTimeout(() => {
        if (idx > -1) {
          element.scroll({ behavior: 'smooth', top: MAX_HEIGHT * idx })
        }
      }, MAX_DELAY * props.state.items.length)

      return
    }

    if (idx > -1) {
      element.scroll({ behavior: 'smooth', top: MAX_HEIGHT * idx })
    }
  }

  onMount(() => {
    const idx = props.option.indexOf(props.selected!)

    if (idx > -1) {
      element.scrollTo({ top: MAX_HEIGHT * idx })
    }
  })
  return (
    <div
      class={clsx('relative', props.classes?.wrapper)}
      ontouchstart={() => setTouch(true)}
      ontouchend={() => setTouch(false)}
      onclick={clickHandler}
    >
      <ul
        ref={(el) => (element = el)}
        onscroll={(e) => scrollValue(e.currentTarget)}
        class={clsx(styles.ul, props.classes?.ul, {
          'pl-4 pr-8': props.index() > 0,
          'pl-8 pr-4': props.index() === 0,
        })}
      >
        {props.option.map((value) => (
          <li class={clsx(styles.li, props.classes?.li)}>
            <p class={styles.li_item}>{value}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ScrollPicker: FC<ScrollPickerProps> = (props) => {
  const [state, setState] = createStore<ScrollPickerState>({
    items: props.items.map((item) => ({
      isScrolling: false,
      value: item.selected,
    })),
  })

  createEffect(() => {
    // Exit if one of the item is still scrolling
    if (state.items.some((state) => state.isScrolling)) {
      return
    }

    // Update if shown only
    props.onchange?.(
      state.items.map(
        (state, index) => state.value || props.items[index].selected!
      )
    )
  })

  createEffect(() => {
    // Sync updated scroll position in the background
    props.items.forEach((item, index) =>
      setState('items', index, 'value', (prev) =>
        prev === item.selected ? prev : item.selected
      )
    )
  })

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
              state={state}
              index={index}
              setState={setState}
              onchange={props.onchange}
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

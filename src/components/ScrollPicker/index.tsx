import type { SetStoreFunction } from 'solid-js/store'
import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, For } from 'solid-js'
import { callable } from '@app/helpers/util'
import clsx from 'clsx'

const MAX_HEIGHT = 28
const MAX_LENGTH = 7
const MAX_DELAY = 150

interface ScrollOptionProps {
  option: string[]
  selected?: () => string

  state: ScrollPickerState
  index: () => number
  setState: SetStoreFunction<ScrollPickerState>
}

interface ScrollPickerProps {
  items: Omit<ScrollOptionProps, 'index' | 'state' | 'setState'>[]
  show: () => boolean
  onchange?: (values: string[]) => void
}

interface ScrollPickerState {
  active: () => boolean
  items: {
    isScrolling: boolean
    value?: string
  }[]
}

const ScrollOption: FC<ScrollOptionProps & Partial<ScrollPickerState>> = ({
  selected,
  option,
  index,
  state: parentState,
  setState: parentSetState,
}) => {
  const [state, setState] = createStore({
    isTouch: false,
  })

  let element: HTMLElement
  let tickingTime: NodeJS.Timeout

  function scrollValue(target: HTMLElement) {
    const children = target.querySelectorAll('li > *')
    const snap = target.scrollTop % MAX_HEIGHT === 0

    clearTimeout(tickingTime)
    parentSetState('items', index(), 'isScrolling', true)

    tickingTime = setTimeout(() => {
      const offset = Array.from(children).map(
        (child, i) => child.parentElement!.clientHeight * i
      )

      if (!snap) {
        let n = 0

        if (!state.isTouch) {
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

      parentSetState('items', index(), (prev) => ({
        isScrolling:
          prev.isScrolling === state.isTouch ? prev.isScrolling : state.isTouch,
        value: value === '' || prev.value === value ? prev.value : value,
      }))
    }, MAX_DELAY * parentState.items.length)
  }

  function clickHandler(event: Event) {
    const value = (event.target as HTMLElement).textContent
    const idx = option.findIndex((opt) => opt === value)

    // Interup touch end
    event.preventDefault()

    if (parentState.items[index()].isScrolling) {
      return
    }

    if (idx > -1) {
      element.scroll({ behavior: 'smooth', top: MAX_HEIGHT * idx })
    }
  }

  createEffect(() => {
    const value = selected?.()

    if (value) {
      element.scrollTo({ top: MAX_HEIGHT * option.indexOf(value) })
    }
  })

  return (
    <div
      class={clsx('relative', { [styles.wrapper]: index() > 0 })}
      ontouchstart={() => setState('isTouch', true)}
      ontouchend={() => setState('isTouch', false)}
      onclick={clickHandler}
    >
      <div
        class={clsx(styles.symbol_wrapper, {
          [styles.symbol_nth]: index() > 0,
        })}
      >
        <span class={styles.symbol} />
      </div>
      <ul
        ref={(el) => (element = el)}
        style={{ 'max-height': `${MAX_HEIGHT * MAX_LENGTH}px` }}
        onscroll={(e) => scrollValue(e.currentTarget)}
        class={clsx(styles.ul, { [styles.ul_nth]: index() > 0 })}
      >
        {option.map((value) => (
          <li class={styles.li}>
            <p class={styles.li_button}>{value}</p>
          </li>
        ))}
      </ul>
      <div>
        <div class={styles.mask_top} />
        <div class={styles.mask_bottom} />
      </div>
    </div>
  )
}

const ScrollPicker: FC<ScrollPickerProps> = ({ items, show, onchange }) => {
  const [state, setState] = createStore<ScrollPickerState>({
    active: show,
    items: items.map((item) => ({
      isScrolling: false,
      value: item.selected?.(),
    })),
  })

  createEffect(() => {
    // Exit if one of the item is still scrolling
    if (!state.items.every((state) => !state.isScrolling)) {
      return
    }

    // Update if shown only
    if (callable(show)) {
      return onchange?.(
        state.items.map((state, index) => state.value || items[index].option[0])
      )
    }

    // Update scroll position from previous value
    items.forEach((item, index) =>
      setState('items', index, 'value', callable(item.selected))
    )
  })

  return (
    <div class={clsx(styles.container)}>
      <For each={items}>
        {(item, index) => (
          <ScrollOption
            option={item.option}
            selected={item.selected}
            state={state}
            index={index}
            setState={setState}
          />
        )}
      </For>
    </div>
  )
}

const styles = {
  container: clsx('relative inline-flex rounded-xl bg-gray-200 px-2 py-4'),
  wrapper: clsx('ml-4 border-l border-l-gray-300'),
  symbol: clsx('block h-1.5 w-1.5 rounded-full bg-blue-500'),
  symbol_nth: clsx('!left-4'),
  symbol_wrapper: clsx('absolute left-1 right-1 top-21 flex h-7 items-center'),
  ul: clsx(
    'relative z-10 flex flex-col px-4 py-21 snap-y-mandatory overflow-y-touch'
  ),
  ul_nth: clsx('ml-4 !pl-3'),
  li: clsx('block h-7 snap-center'),
  li_button: clsx('text-lead font-medium leading-7 -tracking-lead'),
  mask_top: clsx(
    'pointer-events-none absolute left-4 right-4 top-0 h-21',
    'z-10 bg-gradient-to-b from-gray-200 to-[175%]'
  ),
  mask_bottom: clsx(
    'pointer-events-none absolute bottom-0 left-4 right-4 h-21',
    'z-10 bg-gradient-to-t from-gray-200 to-[175%]'
  ),
}

export default ScrollPicker

import type { SetStoreFunction } from 'solid-js/store'
import type { Callable, FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, For } from 'solid-js'
import { callable } from '@app/helpers/util'
import clsx from 'clsx'

const MAX_HEIGHT = 28
const MAX_LENGTH = 7
const MAX_DELAY = 150

interface ScrollOptionProps {
  option: string[]
  selected?: Callable<string>

  state: ScrollPickerState[]
  index: () => number
  setState: SetStoreFunction<ScrollPickerState[]>
}

interface ScrollPickerProps {
  items: Omit<ScrollOptionProps, 'index' | 'state' | 'setState'>[]
  onchange?: (values: string[]) => void
}

interface ScrollPickerState {
  isScrolling: boolean
  value?: string
}

const ScrollOption: FC<ScrollOptionProps & Partial<ScrollPickerState>> = ({
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
    const children = target.querySelectorAll('button')
    const snap = target.scrollTop % MAX_HEIGHT === 0

    clearTimeout(tickingTime)
    parentSetState(index(), 'isScrolling', true)

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

      parentSetState(index(), (prev) => ({
        isScrolling:
          prev.isScrolling === state.isTouch ? prev.isScrolling : state.isTouch,
        value: value === '' || prev.value === value ? prev.value : value,
      }))
    }, MAX_DELAY * parentState.length)
  }

  function onClickScroll(e: Event) {
    const value = (e.target as HTMLElement).textContent
    const index = option.findIndex((opt) => opt === value)

    // Interup touch end
    e.preventDefault()

    if (index > -1) {
      element.scroll({
        behavior: 'smooth',
        top: MAX_HEIGHT * index,
      })
    }
  }

  createEffect(() => {
    const value = parentState[index()].value

    if (value) {
      element.scroll({ top: MAX_HEIGHT * option.indexOf(value) })
    }
  })

  return (
    <div
      class={clsx('relative', { [styles.wrapper]: index() > 0 })}
      ontouchstart={() => setState('isTouch', true)}
      ontouchend={() => setState('isTouch', false)}
      onclick={onClickScroll}
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
            <button class={styles.li_button}>{value}</button>
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

const ScrollPicker: FC<ScrollPickerProps> = ({ items, onchange }) => {
  const [states, setStates] = createStore<ScrollPickerState[]>(
    items.map((item) => ({
      isScrolling: false,
      value: callable(item.selected),
    }))
  )

  createEffect(() => {
    if (!states.every((state) => !state.isScrolling)) {
      return
    }

    onchange?.(
      states.map((state, index) => state.value || items[index].option[0])
    )
  })

  createEffect(() => {
    items.forEach((item, index) =>
      setStates(index, 'value', callable(item.selected))
    )
  })

  return (
    <div class={styles.container}>
      <For each={items}>
        {(item, index) => (
          <ScrollOption
            option={item.option}
            selected={item.selected}
            state={states}
            index={index}
            setState={setStates}
          />
        )}
      </For>
    </div>
  )
}

const styles = {
  container: clsx('inline-flex rounded-xl bg-gray-200 px-2 py-4'),
  wrapper: clsx('ml-4 border-l border-l-gray-300'),
  symbol: clsx('block h-1.5 w-1.5 rounded-full bg-blue-500'),
  symbol_nth: clsx('!left-4'),
  symbol_wrapper: clsx('absolute left-1 right-1 top-21 flex h-7 items-center'),
  ul: clsx(
    'relative z-10 flex flex-col px-4 py-21 snap-y-mandatory overflow-y-touch'
  ),
  ul_nth: clsx('ml-4 !pl-3'),
  li: clsx('block h-7 snap-center'),
  li_button: clsx('text-picker font-medium leading-7'),
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

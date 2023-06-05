import type { SetStoreFunction } from 'solid-js/store'
import type { Callable, FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, For } from 'solid-js'
import { callable, delay } from '@app/helpers/util'
import clsx from 'clsx'

const MAX_HEIGHT = 28
const MAX_LENGTH = 7
const MAX_DELAY = 150

interface ScrollOptionProps {
  values: string[]
  index: () => number
  state: ScrollPickerState[]
  selected?: Callable<string>
  onchange?: (value: string) => void
  // setState: SetStoreFunction<ScrollPickerState[]>
  setState: SetStoreFunction<ScrollPickerState[]>
}

interface ScrollPickerProps {
  items: Omit<ScrollOptionProps, 'index' | 'state' | 'setState'>[]
}

interface ScrollPickerState {
  isScrolling: boolean
  value?: string
}

const ScrollOption: FC<ScrollOptionProps & Partial<ScrollPickerState>> = ({
  selected,
  values,
  index,
  onchange,
  state: parentState,
  setState: parentSetState,
}) => {
  const [state, setState] = createStore({
    value: '',
    isCapturing: !!callable(selected),
    isScrolling: false,
    isTouch: false,
  })

  let element: HTMLElement
  let tickingTime: NodeJS.Timeout

  function scrollValue(target: HTMLElement) {
    clearTimeout(tickingTime)
    parentSetState(index(), 'isScrolling', true)

    tickingTime = setTimeout(() => {
      const children = target.querySelectorAll('button')
      const snap = target.scrollTop % MAX_HEIGHT === 0

      if (!snap) {
        if (!state.isTouch) {
          target.classList.remove('snap-y-mandatory')

          return !state.isTouch
            ? delay(10).then(() => {
                target.classList.add('snap-y-mandatory')
                scrollValue(target)
              })
            : void 0
        }

        return
      }

      const offset = Array.from(children).map(
        (child, i) => child.parentElement!.clientHeight * i
      )

      const snapped = offset.find((child) => element.scrollTop === child)
      const value = children[offset.indexOf(snapped!)]?.dataset.value ?? ''

      parentSetState(index(), (prev) => ({
        ...prev,
        isScrolling: state.isTouch,
        value: value === '' || prev.value === value ? prev.value : value,
      }))
    }, MAX_DELAY * parentState.length)
  }

  function scrollTo(value: string, behavior: ScrollBehavior = 'auto') {
    const el = Array.from(element.querySelectorAll('button')).find(
      (li) => li.dataset.value === value
    )

    if (el) {
      delay(MAX_DELAY).then(() => setState('value', value))
      element.scrollTo({
        behavior,
        top: MAX_HEIGHT * values.indexOf(el.dataset.value!),
      })
    }
  }

  function scrollToSelected(behavior: ScrollBehavior = 'auto') {
    return scrollTo(callable(selected) || values[0], behavior)
  }

  // Don't smooth in the first place
  // onMount(() => {
  //   scrollToSelected()
  // })

  createEffect(() => {
    // if (state.isScrolling) {
    //   return setState('isScrolling', false)
    // }
    // parentSetState(index(), 'isScrolling', state.isScrolling)
  })

  createEffect(() => scrollToSelected())
  // createEffect(() => {
  //   if (state.value !== '') {
  //     onchange?.(state.value)
  //   }
  // })

  // createEffect(() => {
  //   if (isMobile() && state.isCapturing) {
  //     return scrollValue(element)
  //   }
  // })

  return (
    <div
      class={clsx('relative', { [styles.wrapper]: index() > 0 })}
      onclick={(e) => {
        const target = e.target

        e.preventDefault()
        console.log(target)
      }}
      ontouchstart={() => setState('isTouch', true)}
      ontouchend={() => {
        setState('isTouch', false)
      }}
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
        {values.map((value) => (
          <li class={styles.li}>
            <button
              class={styles.li_button}
              data-value={value}
              onclick={(e) => {
                // const { currentTarget: target } = e
                // scrollTo(target.dataset.value!, 'smooth')
              }}
            >
              {value}
            </button>
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

const ScrollPicker: FC<ScrollPickerProps> = ({ items }) => {
  const [states, setStates] = createStore(
    items.map((item) => ({
      isScrolling: false,
      value: callable(item.selected),
    }))
  )

  createEffect(() => {
    const doupdate = states.every((state) => !state.isScrolling)

    if (doupdate) {
      // console.log('no scroll:', doupdate)
      console.log(states.map((item) => item.value))
    }
  })

  return (
    <div class={styles.container}>
      <For each={items}>
        {(item, index) => (
          <ScrollOption
            values={item.values}
            state={states}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setState={setStates}
            index={index}
            selected={item.selected}
            onchange={item.onchange}
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

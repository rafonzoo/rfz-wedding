import type { Callable, FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, onMount, splitProps } from 'solid-js'
import { callable, delay, isMobile } from '@app/helpers/util'
import clsx from 'clsx'

const MAX_HEIGHT = 28
const MAX_LENGTH = 7
const MAX_DELAY = 150

interface ScrollOptionProps {
  values: string[]
  index: number
  selected?: Callable<string>
  onchange?: (value: string) => void
}

interface ScrollPickerProps {
  items: Omit<ScrollOptionProps, 'index'>[]
}

const ScrollOption: FC<ScrollOptionProps> = ({
  selected,
  values,
  index,
  onchange,
}) => {
  const [state, setState] = createStore({
    value: '',
    isCapturing: !!callable(selected),
  })

  let element: HTMLElement
  let tickingTime: NodeJS.Timeout

  function scrollValue(target: HTMLElement) {
    const children = target.querySelectorAll('button')
    const atSnappingPoint = target.scrollTop % MAX_HEIGHT === 0

    if (isMobile() && atSnappingPoint && !state.isCapturing) {
      return
    }

    clearTimeout(tickingTime)

    tickingTime = setTimeout(() => {
      if (!atSnappingPoint) return

      const offset = Array.from(children).map(
        (child, i) => child.parentElement!.clientHeight * i
      )

      const snapped = offset.find((child) => target.scrollTop === child)
      const val = children[offset.indexOf(snapped!)]?.dataset.value ?? ''

      setState((prev) => ({
        value: val === '' || prev.value === val ? prev.value : val,
        isCapturing: isMobile() ? false : prev.isCapturing,
      }))
    }, MAX_DELAY)
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
  onMount(scrollToSelected)

  createEffect(() => scrollToSelected())
  createEffect(() => {
    if (state.value !== '') {
      onchange?.(state.value)
    }
  })

  createEffect(() => {
    if (isMobile() && state.isCapturing) {
      return scrollValue(element)
    }
  })

  return (
    <div
      class={clsx('relative', { [styles.wrapper]: index > 0 })}
      ontouchend={() => isMobile() && setState('isCapturing', true)}
    >
      <div
        class={clsx(styles.symbol_wrapper, {
          [styles.symbol_nth]: index > 0,
        })}
      >
        <span class={styles.symbol} />
      </div>
      <ul
        ref={(el) => (element = el)}
        style={{ 'max-height': `${MAX_HEIGHT * MAX_LENGTH}px` }}
        onscroll={(e) => scrollValue(e.target as HTMLElement)}
        class={clsx(styles.ul, { [styles.ul_nth]: index > 0 })}
      >
        {values.map((value) => (
          <li class={styles.li}>
            <button
              class={styles.li_button}
              data-value={value}
              onclick={({ currentTarget: target }) => {
                scrollTo(target.dataset.value!, 'smooth')
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

const ScrollPicker: FC<ScrollPickerProps> = (props) => {
  const [{ items }] = splitProps(props, ['items'])
  return (
    <div class={styles.container}>
      {items.map((item, index) => (
        <ScrollOption
          values={item.values}
          index={index}
          selected={item.selected}
          onchange={item.onchange}
        />
      ))}
    </div>
  )
}

const styles = {
  container: clsx('inline-flex rounded-xl bg-gray-200 px-2 py-4 text-black'),
  wrapper: clsx('ml-4 border-l border-l-gray-300'),
  symbol: clsx('block h-1.5 w-1.5 rounded-full bg-blue-500'),
  symbol_nth: clsx('!left-4'),
  symbol_wrapper: clsx('absolute left-1 right-1 top-21 flex h-7 items-center'),
  ul: clsx(
    'relative z-10 flex flex-col px-4 py-21 snap-y-mandatory overflow-y-touch'
  ),
  ul_nth: clsx('ml-4 !pl-3'),
  li: clsx('block h-7 snap-center'),
  li_button: clsx('text-picker font-medium leading-7 tracking-tight'),
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

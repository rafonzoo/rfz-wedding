import type { SetStoreFunction } from 'solid-js/store'
import type { FC, iDialog } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, createSignal, For } from 'solid-js'
import { callable } from '@app/helpers/util'
import clsx from 'clsx'
import Popup from '@app/components/Dialog/Popup'

const MAX_HEIGHT = 32
const MAX_DELAY = 150

interface ScrollOptionProps {
  option: string[]
  selected?: () => string

  state: ScrollPickerState
  show: () => boolean
  index: () => number
  setState: SetStoreFunction<ScrollPickerState>
}

interface ScrollPickerProps extends iDialog {
  items: Omit<ScrollOptionProps, 'index' | 'state' | 'setState' | 'show'>[]
  onchange?: (values: string[]) => void
}

interface ScrollPickerState {
  items: {
    isScrolling: boolean
    value?: string
  }[]
}

const ScrollOption: FC<ScrollOptionProps & Partial<ScrollPickerState>> = ({
  option,
  state,
  show,
  setState,
  selected,
  index,
}) => {
  const [isTouch, setTouch] = createSignal(false)

  let element: HTMLElement
  let tickingTime: NodeJS.Timeout

  function scrollValue(target: HTMLElement) {
    const children = target.querySelectorAll('li > *')
    const snap = target.scrollTop % MAX_HEIGHT === 0

    clearTimeout(tickingTime)
    setState('items', index(), 'isScrolling', true)

    tickingTime = setTimeout(() => {
      const offset = Array.from(children).map(
        (child, i) => child.parentElement!.clientHeight * i
      )

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

      setState('items', index(), (prev) => {
        return {
          isScrolling:
            prev.isScrolling === isTouch() ? prev.isScrolling : isTouch(),
          value: prev.value === value || !show() ? prev.value : value,
        }
      })
    }, MAX_DELAY * state.items.length)
  }

  function clickHandler(event: Event) {
    const value = (event.target as HTMLElement).textContent
    const idx = option.findIndex((opt) => opt === value)

    // Interup touch end
    event.preventDefault()

    if (state.items[index()].isScrolling) {
      return
    }

    if (idx > -1) {
      element.scroll({ behavior: 'smooth', top: MAX_HEIGHT * idx })
    }
  }

  createEffect(() => {
    const value = selected?.()

    if (value && show()) {
      element.scrollTo({ top: MAX_HEIGHT * option.indexOf(value) })
    }
  })

  return (
    <div
      class={clsx('relative')}
      ontouchstart={() => setTouch(true)}
      ontouchend={() => setTouch(false)}
      onclick={clickHandler}
    >
      <ul
        ref={(el) => (element = el)}
        onscroll={(e) => scrollValue(e.currentTarget)}
        class={clsx(styles.ul, {
          'pl-4 pr-8': index() > 0,
          'pl-8 pr-4': index() === 0,
        })}
      >
        {option.map((value) => (
          <li class={styles.li}>
            <p class={styles.li_item}>{value}</p>
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

const ScrollPicker: FC<ScrollPickerProps> = ({
  items,
  show,
  setShow,
  onchange,
}) => {
  const [active, setActive] = createSignal(false)
  const [state, setState] = createStore<ScrollPickerState>({
    items: items.map((item) => ({
      isScrolling: false,
      value: item.selected?.(),
    })),
  })

  createEffect(() => setActive((prev) => (prev === show() ? prev : show())))
  createEffect(() => {
    // Exit if one of the item is still scrolling
    if (state.items.some((state) => state.isScrolling) && active()) {
      return
    }

    // Update if shown only
    onchange?.(
      state.items.map((state, index) => state.value || items[index].selected!())
    )
  })

  createEffect(() => {
    // Sync updated scroll position in the background
    items.forEach((item, index) =>
      setState('items', index, 'value', callable(item.selected))
    )
  })

  return (
    <Popup
      show={show}
      setShow={setShow}
      props={{
        trigger: { children: 'Show picker' },
        root: { placement: 'bottom-start' },
        content: {
          class: 'origin-top-left',
          ref: (el) => setActive(!!el),
        },
      }}
    >
      <div
        class={clsx(styles.container)}
        style={{ 'font-size': MAX_HEIGHT + 'px' }}
      >
        <For each={items}>
          {(item, index) => (
            <ScrollOption
              option={item.option}
              selected={item.selected}
              // private
              state={state}
              index={index}
              setState={setState}
              show={active}
            />
          )}
        </For>
        <div class={clsx(styles.symbol_wrapper)} />
      </div>
    </Popup>
  )
}

const styles = {
  container: clsx('relative inline-flex rounded-xl bg-gray-200 py-4'),
  symbol_wrapper: clsx(
    'absolute left-4 right-4 top-[3em] mt-4 flex h-[1em]',
    '!ml-0 items-center rounded-lg bg-gray-300'
  ),
  ul: clsx(
    'relative z-10 flex max-h-[7em] flex-col py-[3em]',
    'scroll-picker snap-y-mandatory overflow-y-touch'
  ),
  li: clsx('flex min-h-[1em] snap-center items-center'),
  li_item: clsx('flex w-full select-none text-lead font-medium -tracking-wide'),
  mask_top: clsx(
    'pointer-events-none absolute left-0 right-0 top-0 h-[3em]',
    'z-10 bg-gradient-to-b from-gray-200 from-[10%] to-[rgb(228_228_228_/_50%)]'
  ),
  mask_bottom: clsx(
    'pointer-events-none absolute bottom-0 left-0 right-0 h-[3em]',
    'z-10 bg-gradient-to-t from-gray-200 from-[10%] to-[rgb(228_228_228_/_50%)]'
  ),
}

export default ScrollPicker

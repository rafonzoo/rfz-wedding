import type { SetStoreFunction } from 'solid-js/store'
import type { FC } from '@app/types'
import type { iPopup } from '@app/components/Dialog/Popup'
import { createStore } from 'solid-js/store'
import { createEffect, createSignal, For, onMount, splitProps } from 'solid-js'
import { compare } from '@app/helpers/util'
import clsx from 'clsx'
import Popup from '@app/components/Dialog/Popup'

const MAX_HEIGHT = 32
const MAX_DELAY = 150

interface PickerOption {
  option: string[]
  selected?: string
  classes?: {
    [P in 'ul' | 'li' | 'p' | 'wrapper']?: string
  }
}

interface PickerItem extends PickerOption {
  scroller: PickerState
  index: () => number
  setScroller: SetStoreFunction<PickerState>
}

interface PickerList {
  classes?: { [P in 'outer' | 'inner']?: string }
  items: PickerOption[]
  onchange?: (values: string[]) => string[] | void
}

interface PickerState {
  values: string[]
  state: {
    isScrolling: boolean
    value: string
  }[]
}

type PickerProps = PickerList & iPopup

const PickerItem: FC<PickerItem> = (props) => {
  const [touchEvent, setTouchEvent] = createSignal<'in' | 'out' | 'none'>(
    'none'
  )

  let listElement: HTMLElement
  let tickingTime: NodeJS.Timeout
  let preventedScroll = false

  function onScroll() {
    const index = props.index()
    const state = props.scroller
    const setState = props.setScroller

    // Prevent `scrollTo` firing on the first place
    if (preventedScroll) return (preventedScroll = false)

    clearTimeout(tickingTime)
    setState('state', index, 'isScrolling', (prev) => (prev ? prev : true))

    tickingTime = setTimeout(() => {
      const li = Array.from(listElement.querySelectorAll('li'))

      if (!(listElement.scrollTop % MAX_HEIGHT === 0)) {
        let n = 0
        let i = 0

        if (touchEvent() === 'out') {
          const offset = li.map(({ clientHeight }, i) => clientHeight * i)

          for (; i < offset.length; i++) {
            const prev = offset[i - 1]
            const { scrollTop } = listElement

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

          return listElement.scrollTo({ top: offset[n] })
        }

        return
      }

      const targetElement = li.find(({ clientHeight }, index) => {
        return clientHeight * index === listElement.scrollTop
      })

      if (targetElement) {
        const value = targetElement?.dataset.value

        if (!value) {
          throw new Error(`TypeError: Expected string, given "${typeof value}"`)
        }

        setState('state', index, ({ isScrolling, value: val }) => ({
          isScrolling: !isScrolling ? isScrolling : false,
          value: val === value || value === '' ? val : value,
        }))
      }
    }, MAX_DELAY * state.values.length)
  }

  function onClick(e: Event) {
    if (props.scroller.state.some((state) => !!state.isScrolling)) {
      return
    }

    const target = (e.target as HTMLElement).parentElement?.dataset.value
    const index = target ? props.option.indexOf(target) : -1

    if (index > -1) {
      listElement.scrollTo({ behavior: 'smooth', top: MAX_HEIGHT * index })
      preventedScroll = true
    }
  }

  onMount(() => {
    const index = props.option.indexOf(props.selected!)

    if (index > -1) {
      listElement.scrollTo({ top: MAX_HEIGHT * index })
      preventedScroll = true
    }
  })

  return (
    <div
      class={clsx('relative flex-grow overflow-hidden', props.classes?.wrapper)}
      ontouchstart={() => setTouchEvent('in')}
      ontouchend={() => setTouchEvent('out')}
      onclick={onClick}
    >
      <ul
        ref={(el) => (listElement = el)}
        onscroll={onScroll}
        class={clsx(styles.ul, props.classes?.ul, {
          'pl-4 pr-8': props.index() > 0,
          'pl-8 pr-4': props.index() === 0,
        })}
      >
        {props.option.map((value) => (
          <li data-value={value} class={clsx(styles.li, props.classes?.li)}>
            <p class={clsx(styles.li_item, props.classes?.p)}>{value}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

const PickerList: FC<PickerList> = (props) => {
  const [scroller, setScroller] = createStore<PickerState>({
    values: props.items.map((item) => item.selected || item.option[0]),
    state: props.items.map((item) => ({
      isScrolling: false,
      value: item.selected ?? item.option[0],
    })),
  })

  createEffect(() => {
    const updatedValue = props.onchange?.(scroller.values)
    const isUnchanged = Array.isArray(updatedValue)
      ? compare(scroller.values, updatedValue)
      : true

    if (!Array.isArray(updatedValue) || isUnchanged) {
      return
    }

    setScroller('values', (prev) =>
      compare(updatedValue, prev) ? prev : updatedValue
    )
  })

  createEffect(() => {
    if (!scroller.state.some((state) => !!state.isScrolling)) {
      const values = scroller.state.map((state) => state.value)

      setScroller('values', (prev) => (compare(values, prev) ? prev : values))
    }
  })

  return (
    <div class={clsx(styles.outer, props.classes?.outer)}>
      <div
        class={clsx(styles.inner, props.classes?.inner)}
        style={{ 'font-size': MAX_HEIGHT + 'px' }}
      >
        <For each={props.items}>
          {(item, index) => (
            <PickerItem
              classes={item.classes}
              option={item.option}
              selected={item.selected}
              //
              // private
              //
              scroller={scroller}
              setScroller={setScroller}
              index={index}
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

export const Roller: FC<PickerProps> = (props) => {
  const [picker, popup] = splitProps(props, ['onchange', 'classes', 'items'])

  return (
    <Popup
      {...popup}
      trigger={{ ...popup.trigger, children: props.children }}
      children={<PickerList {...picker} />}
    />
  )
}

const styles = {
  outer: clsx('flex bg-gray-200'),
  inner: clsx('relative inline-flex'),
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
    'flex w-full flex-grow select-none flex-col justify-center',
    'text-picker font-medium -tracking-heading text-black'
  ),
  mask_top: clsx(
    'pointer-events-none absolute left-0 right-0 top-0 z-10 h-[3em]',
    'bg-gradient-to-b from-gray-200 from-[40%] to-[rgb(228_228_228_/_50%)]'
  ),
  mask_bottom: clsx(
    'pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[3em]',
    'bg-gradient-to-t from-gray-200 from-[40%] to-[rgb(228_228_228_/_50%)]'
  ),
}

export default Roller

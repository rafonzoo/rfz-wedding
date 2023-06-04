import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, onMount } from 'solid-js'
import { delay, isMobile } from '@app/helpers/util'
import clsx from 'clsx'

const MAX_HEIGHT = 28
const MAX_LENGTH = 7
const MAX_DELAY = 150

interface ScrollPickerProps {
  defaultValue?: string
  items: string[]
}

const ScrollPicker: FC<ScrollPickerProps> = ({ defaultValue, items }) => {
  const [state, setState] = createStore({
    value: '',
    isCapturing: !!defaultValue,
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
    const selected = Array.from(element.querySelectorAll('button')).find(
      (li) => li.dataset.value === value
    )

    if (selected) {
      delay(MAX_DELAY).then(() => setState('value', value))
      element.scrollTo({
        behavior,
        top: MAX_HEIGHT * items.indexOf(selected.dataset.value!),
      })
    }
  }

  onMount(() => defaultValue && scrollTo(defaultValue))

  createEffect(() => {
    if (isMobile() && state.isCapturing) {
      return scrollValue(element)
    }
  })

  return (
    <div>
      <div class='mx-auto flex bg-gray-200 text-black'>
        <div
          class={clsx('relative')}
          ontouchend={() => isMobile() && setState('isCapturing', true)}
        >
          <div
            class={clsx('absolute left-1 right-1 top-21 flex h-7 items-center')}
          >
            <span class=' block h-1.5 w-1.5 rounded-full bg-blue-500' />
          </div>
          <ul
            ref={(el) => (element = el)}
            style={{ 'max-height': `${MAX_HEIGHT * MAX_LENGTH}px` }}
            onscroll={(e) => scrollValue(e.target as HTMLElement)}
            class={clsx(
              'relative z-10 flex flex-col px-4 py-21 snap-y-mandatory overflow-y-touch'
            )}
          >
            {items.map((item) => (
              <li class='flex h-7 snap-center text-picker font-medium leading-7'>
                <button
                  data-value={item}
                  onclick={({ currentTarget: target }) => {
                    scrollTo(target.dataset.value!, 'smooth')
                  }}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
          <div
            class={clsx(
              'pointer-events-none absolute h-21 opacity-50',
              'left-4 right-4 top-0 z-10 bg-gray-200'
            )}
          />
          <div
            class={clsx(
              'pointer-events-none absolute h-21 opacity-50',
              'bottom-0 left-4 right-4 z-10 bg-gray-200'
            )}
          />
        </div>
      </div>
      <br />
      Value is: {state.value}
    </div>
  )
}

export default ScrollPicker

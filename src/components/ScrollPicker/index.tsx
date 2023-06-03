import type { FC } from '@app/types'
import { createStore } from 'solid-js/store'
import { createEffect, onMount } from 'solid-js'
import { isMobile } from '@app/helpers/util'
import clsx from 'clsx'

const ITEM_HEIGHT = 28

interface ScrollPickerProps {
  defaultValue?: string
  items: string[]
}

const ScrollPicker: FC<ScrollPickerProps> = ({ defaultValue, items }) => {
  const [state, setState] = createStore({
    value: '',
    isCapturing: true,
  })

  let element: HTMLElement
  let tickingTime: NodeJS.Timeout

  function scrollValue(target: HTMLElement) {
    const children = target.querySelectorAll('li')
    const atSnappingPoint = target.scrollTop % ITEM_HEIGHT === 0

    if (isMobile() && atSnappingPoint && !state.isCapturing) {
      return
    }

    clearTimeout(tickingTime)

    tickingTime = setTimeout(() => {
      if (!atSnappingPoint) return

      const offset = Array.from(children).map(
        (child, i) => child.clientHeight * (i + 1)
      )

      const snapped = offset.find((child) => target.scrollTop === child)
      const val = children[offset.indexOf(snapped!)]?.textContent ?? ''

      setState((prev) => ({
        value: val === '' || prev.value === val ? prev.value : val,
        isCapturing: isMobile() ? false : prev.isCapturing,
      }))
    }, 150)
  }

  onMount(() => {
    const selected = Array.from(element.children).find(
      (li) => li.textContent === defaultValue
    )

    if (selected) {
      element.scrollTo({
        top: ITEM_HEIGHT * (items.indexOf(selected.textContent!) + 1),
      })
    }
  })

  createEffect(() => {
    if (isMobile() && state.isCapturing) {
      return scrollValue(element)
    }
  })

  return (
    <div>
      <div class='mx-auto max-w-[262px] bg-gray-200 text-black'>
        <div class='relative'>
          <ul
            ref={(el) => (element = el)}
            style={{ 'max-height': `${ITEM_HEIGHT * 5}px` }}
            onscroll={(e) => scrollValue(e.target as HTMLElement)}
            onTouchEnd={() => isMobile() && setState('isCapturing', true)}
            class={clsx(
              'snap-y-mandatory flex w-full flex-wrap overflow-auto bg-red-200',
              'before:content-[" "] before:sticky before:top-14 before:h-7 before:w-full',
              'before:outline before:outline-amber-500'
            )}
          >
            {items.map((item, index) => (
              <>
                {index === 0 && <div class='block h-14 w-full'></div>}
                <li
                  class=' basis-full snap-center text-picker'
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  {item}
                </li>
                {index === items.length - 1 && (
                  <div class='block h-14 w-full'></div>
                )}
              </>
            ))}
          </ul>
        </div>
      </div>
      <br />
      Value is: {state.value}
    </div>
  )
}

export default ScrollPicker

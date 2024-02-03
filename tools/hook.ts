'use client'

import type { MutableRefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { tw } from '@/tools/lib'
import { isLocal, isObjectEqual, preventDefault } from '@/tools/helper'
import { AppConfig } from '@/tools/config'
import { useLocalePathname } from '@/locale/config'

interface PressHandlers<T> {
  onLongPress: (e: React.MouseEvent<T> | React.TouchEvent<T>) => void
  onClick?: (e: React.MouseEvent<T> | React.TouchEvent<T>) => void
}

interface Options {
  delay?: number
  shouldPreventDefault?: boolean
}

export const useLongPress = <T>(
  { onLongPress, onClick }: PressHandlers<T>,
  { delay = 500, shouldPreventDefault = true }: Options = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()
  const target = useRef<EventTarget>()

  const start = (e: React.MouseEvent<T> | React.TouchEvent<T>) => {
    e.persist()
    const clonedEvent = { ...e }

    if (shouldPreventDefault && e.target) {
      e.target.addEventListener('touchend', preventDefault, {
        passive: false,
      })
      target.current = e.target
    }

    timeout.current = setTimeout(() => {
      onLongPress(clonedEvent)
      setLongPressTriggered(true)
    }, delay)
  }

  const clear = (
    e: React.MouseEvent<T> | React.TouchEvent<T>,
    shouldTriggerClick = true
  ) => {
    timeout.current && clearTimeout(timeout.current)
    shouldTriggerClick && !longPressTriggered && onClick?.(e)

    setLongPressTriggered(false)

    if (shouldPreventDefault && target.current) {
      target.current.removeEventListener('touchend', preventDefault)
    }
  }

  return {
    onMouseDown: (e: React.MouseEvent<T>) => start(e),
    onTouchStart: (e: React.TouchEvent<T>) => start(e),
    onMouseUp: (e: React.MouseEvent<T>) => clear(e),
    onMouseLeave: (e: React.MouseEvent<T>) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent<T>) => clear(e),
  }
}

export const useIsEditorOrDev = () => {
  const haveId = !!useParams().wid

  return isLocal()
  return haveId
}

export const useFeatureDetection = () => {
  const [{ pointerEvent }, setFeatures] = useState({
    pointerEvent: true, // Most is supported.
  })

  useMountedEffect(() =>
    setFeatures({
      pointerEvent: window.onpointerdown !== undefined,
    })
  )

  return { pointerEvent }
}

export const useOutlinedClasses = () => {
  const { pointerEvent } = useFeatureDetection()

  return (isFocused = false, additionalClasses?: string) => {
    if (!pointerEvent) {
      return tw(
        'transition-shadow',
        !isFocused && 'shadow-none',
        isFocused && 'shadow-focus'
      )
    }

    return tw(
      'outline transition-[outline-offset,outline-color] focus-visible:outline-[color:-webkit-focus-ring-color]',
      !isFocused && 'outline-2 outline-offset-0 outline-transparent',
      isFocused && '!outline-blue-400 ' + (additionalClasses ?? 'outline-4 outline-offset-[5px]') // prettier-ignore
    )
  }
}

export const useIntersection = (
  target: MutableRefObject<HTMLElement | null>,
  option?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useMountedEffect(() => {
    if (!target.current) return

    const current = target.current
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          obs.unobserve(entry.target)
        }
      })
    }, option)

    observer.observe(current)
    return () => observer.unobserve(current)
  })

  return isIntersecting
}

export const useUtilities = () => {
  const timeout = useRef<NodeJS.Timeout>()
  const controller = useRef<AbortController | null>(null)

  function debounce(cbFn: () => void) {
    clearTimeout(timeout.current)
    timeout.current = setTimeout(cbFn, AppConfig.Timeout.Debounce)
  }

  function getSignal() {
    controller.current = new AbortController()
    return controller.current.signal
  }

  function abort() {
    return controller.current?.abort()
  }

  function cancelDebounce() {
    return clearTimeout(timeout.current)
  }

  return { abort, cancelDebounce, debounce, getSignal }
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(
      () =>
        setDebouncedValue((prev) =>
          typeof value === 'object' && isObjectEqual(value, prev) ? prev : value
        ),
      delay || 1000
    )

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export const useRouterEffect = (cb: (path: string) => void) => {
  const pathname = useLocalePathname()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => cb(pathname), [pathname])
}

export const useMountedEffect = (cb: () => void) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => cb(), [])
}

'use client'

import type { MutableRefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { tw } from '@/tools/lib'
import { isObjectEqual } from '@/tools/helper'
import { AppConfig } from '@/tools/config'
import { useLocalePathname } from '@/locale/config'

export const useIsEditorOrDev = () => {
  const haveId = !!useParams().wid

  // return isLocal() || haveId
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
      'outline transition-[outline-offset,outline-color] focus-visible:outline-amber-500',
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

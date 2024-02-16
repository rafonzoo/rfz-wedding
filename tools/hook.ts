'use client'

import type { MutableRefObject } from 'react'
import type { Guest, Payment, Wedding } from '@wedding/schema'
import type { Session } from '@supabase/auth-helpers-nextjs'
import type { Dictionary } from '@/tools/config'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { RiContactsLine, RiExchangeDollarFill } from 'react-icons/ri'
import { LuMailOpen } from 'react-icons/lu'
import { QueryWedding, WeddingConfig } from '@wedding/config'
import { QueryAccount } from '@account/config'
import { tw } from '@/tools/lib'
import { exact, iOSVersion, isObjectEqual } from '@/tools/helpers'
import { AppConfig, DefaultLocale, Route } from '@/tools/config'
import { default as pathnames } from '@/locale/route'
import { useLocalePathname } from '@/locale/config'

export const useWeddingNavigator = () => {
  const locale = useLocale() as `${Dictionary}`
  const localePath = locale === DefaultLocale ? '' : `/${locale}`
  const items = [
    {
      title: 'Undangan',
      pathname: localePath + pathnames[Route.weddingList][locale],
      Icon: LuMailOpen,
      className: void 0,
    },
    {
      title: 'Transaksi',
      pathname: localePath + pathnames[Route.weddingPurchase][locale],
      Icon: RiExchangeDollarFill,
      className: tw('!text-2xl'),
    },
    {
      title: 'Akunku',
      pathname: localePath + pathnames[Route.account][locale],
      Icon: RiContactsLine,
      className: void 0,
    },
  ] as const

  return items
}

export const useWeddingPayment = () => {
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()
  const guests = queryClient.getQueryData<Guest[]>(QueryWedding.weddingGuests)
  const sumOfAdditionalGuest = useMemo(
    () =>
      detail.payment
        .map((item) => item.additionalGuest)
        .reduce((acc, val) => acc + val, 0),
    [detail.payment]
  )

  // prettier-ignore
  const payment = (detail.payment[detail.payment.length - 1] ?? null) as Payment | null
  const guestTrackCounts = WeddingConfig.GuestFree + sumOfAdditionalGuest
  const addMoreGuest = guests ? guests.length >= guestTrackCounts : false
  const fullQuota = guests ? guests.length >= WeddingConfig.GuestMax : false
  const isForeverActive = detail.payment.some((pay) => !!pay.foreverActive)
  const isGuestMax = guestTrackCounts === WeddingConfig.GuestMax

  return {
    guestTrackCounts,
    isRequirePayment: payment ? addMoreGuest : false,
    isGuestMaxout: fullQuota,
    isForeverActive,
    isPaymentComplete: isGuestMax && isForeverActive,
  }
}

export const useWeddingDetail = () => {
  const queryClient = useQueryClient()
  const detail = exact(
    queryClient.getQueryData<Wedding | undefined>(QueryWedding.weddingDetail)
  )

  return detail
}

export const useWeddingGuests = <T extends boolean>(ex?: T) => {
  const queryClient = useQueryClient()
  const guests = queryClient.getQueryData<Guest[] | undefined>(
    QueryWedding.weddingGuests
  )

  return (ex ? exact(guests) : guests) as T extends true
    ? Guest[]
    : typeof guests
}

export const useWeddingGetAll = <T extends boolean>(ex?: T) => {
  const queryClient = useQueryClient()
  const myWedding = queryClient.getQueryData<Wedding[] | undefined>(
    QueryWedding.weddingGetAll
  )

  return (ex ? exact(myWedding) : myWedding) as T extends true
    ? Wedding[]
    : typeof myWedding
}

export const useAccountSession = () => {
  const queryClient = useQueryClient()
  const session = queryClient.getQueryData<Session | undefined>(
    QueryAccount.accountSession
  )

  return session
}

export const useIsEditorOrDev = () => {
  const haveId = !!useParams().wid

  // return isLocal()
  return haveId
}

export const useIOSVersion = () => {
  const [iosVer, setIosVer] = useState<
    | {
        version: string
        array: number[]
      }
    | undefined
  >()

  useMountedEffect(() => setIosVer(iOSVersion()))
  return iosVer
}

export const useOutlinedClasses = () => {
  const iOSVersion = useIOSVersion()
  const isIOS12 = iOSVersion && iOSVersion.array[0] <= 12

  return (isFocused = false, additionalClasses?: string) => {
    if (isIOS12) {
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

export const useDebounce = <T>(value: T, delay?: number): T => {
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

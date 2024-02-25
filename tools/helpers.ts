import type { OpUnitType } from 'dayjs'
import { djs } from '@/tools/lib'
import { AppConfig } from '@/tools/config'
import Compressor from 'compressorjs'

export function isObjectEqual<T1, T2>(
  obj1: T1,
  obj2: T2,
  option?: { dateComparedBy?: OpUnitType; decodeString?: boolean }
) {
  // prettier-ignore
  if (
    typeof obj1 !== 'object' && obj1 !== null &&
    typeof obj2 !== 'object' && obj2 !== null
  ) {
    return false
  }

  const ObjArr = Object.keys(obj1 as object)
  const ObjArr2 = Object.keys(obj2 as object)

  if (ObjArr.length !== ObjArr2.length) {
    return false
  }

  for (const key1 in obj1) {
    const value2 = obj2[key1 as keyof object]
    const value1 = obj1[key1 as keyof object]

    if (typeof value1 === 'object') {
      if (!isObjectEqual(value1 as object, value2)) {
        // console.log(value1, value2)
        return false
      }
    } else if (Array.isArray(value1) && Array.isArray(value2)) {
      const value1Arr = value1 as unknown[]
      const value2Arr = value2 as unknown[]
      if (
        !(
          value1Arr.length === value2Arr.length &&
          value1Arr.every((itm) => value2Arr.includes(itm))
        )
      ) {
        return false
      }
    } else {
      if (
        option?.dateComparedBy &&
        djs(value1).isValid() &&
        djs(value2).isValid() &&
        !djs(value1).isSame(djs(value2), option.dateComparedBy)
      ) {
        // console.log(value1, value2)
        return false
      }

      if (value1 !== value2) {
        // console.log(value1, value2)
        return false
      }
    }
  }

  return true
}

export function isArrayEqual<A1 extends unknown[], A2 extends unknown[]>(
  arr1: A1,
  arr2: A2
) {
  if (arr1.length !== arr2.length) return false

  for (let i = 0; i < arr1.length; i++) {
    const el1 = arr1[i]
    const el2 = arr2[i]

    if (typeof el1 !== typeof el2) {
      return false
    }

    if (typeof el1 === 'function') {
      return false
    }

    if (typeof el1 === 'object' && !isObjectEqual(el1, el2)) {
      return false
    }

    if (el1 !== el2) return false
  }

  return true
}

export function isTouchEvent(event: Event) {
  return 'touches' in event
}

export function preventDefault(event: Event) {
  if (!isTouchEvent(event)) return

  if (
    event instanceof TouchEvent &&
    event.touches.length < 2 &&
    event.preventDefault
  ) {
    event.preventDefault()
  }
}

export function isLocal() {
  return ['localhost', '127.0.0.1'].some(
    (url) => new URL(abspath()).hostname === url
  )
}

export function abspath(str?: string) {
  return [process.env.NEXT_PUBLIC_SITE_URL, str].filter(Boolean).join('')
}

export function qstring<T extends object>(data?: T, prefixUrl = '') {
  const prefix = prefixUrl ? prefixUrl + '?' : ''
  const str: unknown[] = []

  for (const key in data) {
    if (!data[key]) continue
    str.push([key, encodeURI(data[key] as string)].join('='))
  }

  return prefix + [str.join('&')].filter(Boolean).join()
}

export function cleaner<T extends object>(obj: T) {
  return keys(obj).reduce((acc, key) => {
    const item = obj[key]

    if (!item) {
      return acc
    }

    if (typeof item === 'object') {
      acc[key] = Object.create({})

      for (const key2 in item) {
        const item2 = item[key2]

        if (!item2) {
          return acc
        }

        acc[key][key2] = item2
      }
    }

    acc[key] = item
    return acc
  }, Object.create({})) as T
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
) {
  const newObj = Object.create({}) as T

  for (const key in obj) {
    if (keys.includes(key)) {
      continue
    }

    newObj[key] = obj[key]
  }

  return newObj as Omit<T, K>
}

export function exact<T>(data: T | null | undefined) {
  return data as NonNullable<T>
}

export function delay(num?: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, num ?? AppConfig.Timeout.Debounce)
  )
}

export function numbers(length = 4) {
  let result = ''

  for (let i = 0; i < length; i++) {
    const value = Math.floor(Math.random() * (9 + 1))

    if (!value && !i) {
      result += Math.floor(Math.random() * (9 + 1) + 1)
    }

    result += value
  }

  return result
}

export function iOSVersion() {
  if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
    const v = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/)
    const older = typeof navigator.maxTouchPoints === 'undefined'
    if (v && (older || navigator.maxTouchPoints > 1)) {
      const arr = [
        parseInt(v[1], 10),
        parseInt(v[2], 10),
        ...(v[3] ? [parseInt(v[3], 10)] : []),
      ]

      return {
        version: arr.join('.'),
        array: arr,
      }
    }
  }

  return void 0
}

export function debounceOnOlderDevice(cb: () => void, timer = 50) {
  const ver = iOSVersion()
  const isIOS12 = ver && ver.array[0] <= 12
  isIOS12 ? setTimeout(() => cb(), timer) : cb()
}

export function secondsToHms(second: number) {
  second = Number(second)

  const d = Math.floor(second / (3600 * 24))
  const h = Math.floor(second / 3600)
  const m = Math.floor((second % 3600) / 60)
  const s = Math.floor((second % 3600) % 60)

  return [
    ('0' + (d > 90 ? 90 : d)).slice(-2),
    ('0' + (h > 24 ? 24 : h)).slice(-2),
    ('0' + (m > 59 ? 0 : m)).slice(-2),
    ('0' + (s > 59 ? 0 : s)).slice(-2),
  ].map((str) => str.replace(/-/, '0'))
}

export function keys<T extends object>(obj: T) {
  return Object.keys(obj) as (keyof T)[]
}

export function compress(qty: number, file: File | Blob) {
  return new Promise<File | Blob>((resolve) => {
    new Compressor(file, {
      quality: qty / 10,
      checkOrientation: false,
      success: resolve,
    })
  })
}

export function blobToUri(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

export function sanitizeFormdata(value: unknown) {
  return encodeURI((value ?? '') as string)
}

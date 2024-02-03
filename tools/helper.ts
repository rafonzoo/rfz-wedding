import type { MutableRefObject } from 'react'
import type { OpUnitType } from 'dayjs'
import { djs } from '@/tools/lib'
import { ASSETS_PATH, AppConfig, UPLOADS_PATH } from '@/tools/config'

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

export function assets(path: string) {
  //.../..../assets/v1/<global | tropical | callout>
  const version = '/v' + (process.env.NEXT_PUBLIC_STORAGE_ASSETS_VERSION ?? 1)
  const url = process.env.NEXT_PUBLIC_IMAGEKIT_URL + ASSETS_PATH

  return [url, version, path].join('')
}

export function uploads(path: string) {
  const envKey = process.env.NEXT_PUBLIC_SITE_ENV as keyof typeof env
  const env = {
    development: '/d',
    staging: '/s',
    production: '/p',
  }

  return [UPLOADS_PATH, env[envKey], path].join('')
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

export function keys<T extends object>(obj: T) {
  return Object.keys(obj) as (keyof T)[]
}

export function swatches(key: keyof typeof colorClasses) {
  const colorClasses = {
    red: 'bg-red-500',
    pink: 'bg-pink-500',
    blue: 'bg-blue-500',
    sky: 'bg-sky-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
    yellow: 'bg-yellow-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    green: 'bg-green-500',
    lime: 'bg-lime-500',
    orange: 'bg-orange-500',
    cyan: 'bg-cyan-500',
    fuchsia: 'bg-fuchsia-500',
    rainbow: 'bg-rainbow',
    unity: 'bg-unity',
    fall: 'bg-fall',
  }

  return colorClasses[key]
}

export function retina(url?: string, r: 'w' | 'h' = 'w', ...raw: string[]) {
  const path = process.env.NEXT_PUBLIC_IMAGEKIT_URL

  if (!url) {
    return {
      thumbnail: void 0,
      blur: void 0,
      src: void 0,
      srcSet: void 0,
    }
  }

  // prettier-ignore
  return {
    thumbnail: [path + `/tr:${[r + '-0.25', 'ar-1-1,fo-auto,q-75', ...raw].join(',')}` + url].join(' '),
    blur: [path + `/tr:${[r + '-0.25', 'q-10,bl-10,fo-auto', ...raw].join(',')}` + url].join(' '),
    src: [path + `/tr:${[r + '-0.25', 'q-75', ...raw].join(',')}` + url].join(' '),
    srcSet: [
      [path + `/tr:${[r + '-0.25', 'q-75', ...raw].join(',')}` + url].join(' '),
      [path + `/tr:${[r + '-0.50', 'q-75', ...raw].join(',')}` + url, '2x'].join(' '),
      [path + `/tr:${[r + '-0.75', 'q-75', ...raw].join(',')}` + url, '3x'].join(' '),
      [path + `/tr:${['q-75', ...raw].join(',')}` + url, '4x'].join(' '),
    ].join(', '),
  }
}

export function blobToUri(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

export function placeName(text: string) {
  return text
    .split(AppConfig.Wedding.NewlineSymbol)
    .map((item) => item.trim())
    .join(' ')
}

export function groupMatch(text: string) {
  return text.match(/\(([^()]*)\)/g)?.[0]
}

export function groupName(text: string) {
  return groupMatch(text)?.replace(/\(|\)/g, '').replace(/\s+/g, ' ').trim()
}

export function guestName(text: string) {
  const group = groupMatch(text)
  return (group ? text.replace(group, '') : text).trim()
}

export function guestAlias(slug: string) {
  return slug.replace(/-/g, ' ')
}

export function createInitial(name: string) {
  const group = groupMatch(name)

  if (group) {
    name = name.replace(group, '')
  }

  const char = (at: number) =>
    name
      .split(' ')
      .filter(Boolean)
      .filter((str) => str.match(/^[\d\w]/g))
      .slice(0, 2)
      .map((t) => t.toUpperCase().charAt(at))

  const names = char(0)
  return names.length === 1 ? [...names, ...char(1)].join('') : names.join('')
}

export function sheetFocus(
  element: MutableRefObject<HTMLElement | null>,
  option?: { bound: 'bottom' | 'center'; canScroll?: boolean }
) {
  delay(50).then(() => {
    let sheet = document.querySelector<HTMLDivElement>('[role=dialog]')

    if (!sheet || !element.current) {
      return
    }

    const { offsetTop } = sheet
    const margin = 32

    const scrollHeight = parseInt(
      getComputedStyle(document.body).getPropertyValue('top')
    )

    const snapHeight = parseInt(
      getComputedStyle(sheet).getPropertyValue('--snap-point-height')
    )

    const { top, bottom } = element.current.getBoundingClientRect()
    const elementHeight = element.current.clientHeight
    const boundedTo = {
      top: offsetTop + top - margin,
      bottom: bottom + margin,
      center: bottom + (offsetTop - elementHeight) / 2,
    }

    const height = isNaN(snapHeight) ? 0 : snapHeight
    const scrollY = isNaN(scrollHeight) ? window.scrollY : scrollHeight

    // prettier-ignore
    const ceil = (
      scrollY + offsetTop + height - boundedTo[option?.bound ?? 'bottom']
    )

    // This is `modal=false`
    if (isNaN(scrollHeight)) {
      sheet = document.querySelector<HTMLDivElement>('[role=dialog]')

      if (!sheet) {
        return
      }

      if (option?.bound === 'center') {
        if (!(top <= 0 || bottom >= sheet.offsetTop)) {
          return
        }

        const offset = sheet.offsetTop
        const margin = (offset - elementHeight) / 2

        return window.scroll({
          top: window.scrollY - (offset - top) + elementHeight + margin,
        })
      }

      return window.scroll({
        top: Math.ceil(window.scrollY - (sheet.offsetTop - bottom - margin)),
      })
    }

    document.body.style.top = `${Math.ceil(ceil)}px`
  })
}

export function sanitizeValue(
  val: string,
  option?: { trim?: boolean; contentEditable?: boolean }
) {
  const { trim, contentEditable } = {
    trim: true,
    contentEditable: false,
    ...option,
  }

  val = trim ? val.trim() : val
  val = contentEditable ? val : val.replace(/\s+/g, ' ')

  return val
}

export function trimBy(symbol: string, text: string) {
  let result = ''

  for (let i = 0; i < text.length; i++) {
    if ((!i || i === text.length - 1) && text[i] === symbol) {
      continue
    }

    result += text[i]
  }

  return result
}

export function periodFocus(target?: HTMLElement | null, timer = 180) {
  const input = document.createElement('input')

  input.classList.add(...'w-0 h-0 m-0 p-0 border-none opacity-0'.split(' '))
  document.body.appendChild(input)
  input.focus()

  return setTimeout(() => {
    target?.focus()
    document.body.removeChild(input)
  }, timer)
}

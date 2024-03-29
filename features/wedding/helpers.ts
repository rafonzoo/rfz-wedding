import { type Payment, weddingEventType } from '@wedding/schema'
import {
  ASSETS_PATH,
  OVERVIEW_PATH,
  UPLOADS_PATH,
  WeddingConfig,
} from '@wedding/config'
import { djs } from '@/tools/lib'

export function midtrans(path: string) {
  const envKey = process.env.NEXT_PUBLIC_SITE_ENV as keyof typeof env
  const env = {
    development: 'https://app.sandbox.midtrans.com',
    staging: 'https://app.sandbox.midtrans.com',
    production: 'https://app.midtrans.com',
  }

  return [env[envKey], path].join('')
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

export function overview(path: string) {
  const url = process.env.NEXT_PUBLIC_IMAGEKIT_URL + OVERVIEW_PATH
  return [url, path].join('')
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
    fall: 'bg-[conic-gradient(from_90deg,#e35859,#fba869,#ad5052,#e35859)]', // prettier-ignore
    unity: 'bg-[conic-gradient(from_90deg,red,yellow,green,red)]', // prettier-ignore
    rainbow: 'bg-[conic-gradient(from_90deg,violet,indigo,blue,green,yellow,orange,red,violet)]', // prettier-ignore
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

export function price(num: number, locale = '') {
  const isDollar = locale === 'en'
  const current = isDollar ? num / 15649 : num
  const value = current.toLocaleString(isDollar ? 'en-US' : 'id-ID')

  return !locale ? value : isDollar ? '$' + value : 'IDR. ' + value
}

export function localThousand(num: number, locale = '') {
  const isDollar = locale === 'en'
  return isDollar ? '$' + num / 1000 : num / 1000 + 'rb'
}

export function placeName(text: string) {
  return text
    .split(WeddingConfig.NewlineSymbol)
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

export function guestAlias(slugOrName: string) {
  return slugOrName.replace(/-/g, ' ')
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

export function isPassed(ev: unknown) {
  const events = weddingEventType.array().parse(ev)
  return events.some((event) =>
    djs()
      .tz()
      .isAfter(
        djs(event.date)
          .add(+event.timeStart.split(':')[0], 'h')
          .add(+event.timeStart.split(':')[1], 'm')
          .add(1, 'D')
          .tz(),
        'h'
      )
  )
}

export function isHardLimit(ev: unknown, payments: Payment[]) {
  const events = weddingEventType.array().parse(ev)
  const activeTime = events.some((event) =>
    // Mapped like
    // [
    //   'Sabtu, 22 Februari 2025. 01:00:00',
    //   'Selasa, 20 Mei 2025. 13:36:52'
    // ]
    djs()
      .tz()
      .isBefore(
        djs(event.date)
          .add(+event.timeStart.split(':')[0], 'h')
          .add(+event.timeStart.split(':')[1], 'm')
          .add(1, 'y')
          .tz(),
        'h'
      )
  )

  return !activeTime && payments.every((payment) => !payment.foreverActive)
}

export function formatTimeTransaction(
  transaction: (Payment & { wid: string; name: string })[]
) {
  transaction = transaction.map((item) => {
    if (!item.transaction.transaction_time) return item

    const [date, time] = item.transaction.transaction_time.split(' ')
    const [hours, minutes, seconds] = time.split(':')
    const formattedDateTime = djs(date)
      .add(+hours, 'h')
      .add(+minutes, 'm')
      .add(+seconds, 's')
      .tz()

    return {
      ...item,
      transaction: {
        ...item.transaction,
        transaction_time: formattedDateTime.toISOString(),
      },
    }
  })

  transaction = transaction.sort((a, b) =>
    djs(b.transaction.transaction_time)
      .tz()
      .isAfter(djs(a.transaction.transaction_time).tz())
      ? 1
      : -1
  )

  return transaction
}

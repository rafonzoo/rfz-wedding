export async function delay(timer = 1000) {
  return new Promise((res) => setTimeout(res, timer))
}

export async function promise<T = boolean>(value?: T) {
  return new Promise<T>((res) => res(value!))
}

export function compare<T extends unknown[], P extends unknown[]>(
  arr1: T,
  arr2: P
) {
  return JSON.stringify(arr1) === JSON.stringify(arr2)
}

export function leading<T>(data: T, attr = '0', slice = -2) {
  return `${attr}${data}`.slice(slice)
}

export function callable<T>(
  param: T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): T extends (...args: any) => any ? ReturnType<T> : T {
  return typeof param === 'function' ? param() : param
}

// export function isTouchDevice() {
//   return (
//     'ontouchstart' in window ||
//     navigator.maxTouchPoints > 0 ||
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-expect-error
//     navigator.msMaxTouchPoints > 0
//   )
// }

// export function keys<T extends object, K extends keyof T>(o: T) {
//   return Object.keys(o) as Array<K>
// }

// // prettier-ignore
// export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]) {
//   return keys.reduce((o, v) => (o[v] = obj[v]) && o, {} as T) as { [P in K]: T[P] }
// }

// export function camelToSnake(str: string) {
//   return str?.replace(/[A-Z]/g, (s) => `-${s.toLowerCase()}`) ?? str
// }

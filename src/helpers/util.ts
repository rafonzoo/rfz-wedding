export async function delay(timer = 1000) {
  return new Promise((res) => setTimeout(res, timer))
}

export function callable<T>(
  param: T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): T extends (...args: any) => any ? ReturnType<T> : T {
  return typeof param === 'function' ? param() : param
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function classList(props: any): { [k: string]: boolean } {
  return { ...props.classList, [props.class!]: !!props.class }
}

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

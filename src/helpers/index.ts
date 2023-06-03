import type { iScreen } from '@app/types'
import { useLocation, useNavigate, useSearchParams } from '@solidjs/router'
import { store } from '@app/state/store'
import { delay, promise } from '@app/helpers/util'
import { THEME } from '@app/config/theme'
import { ROUTES } from '@app/config'
import dictionary from '@app/locale/dictionary.json'
import definition from '@app/locale/definition.json'

const translation = { ...definition, ...dictionary }

export function text(key: keyof typeof translation) {
  return translation[key][store.locale] ?? translation[key][0]
}

export function lazied<T extends string>(key: T) {
  return import(`../screen/${key}/index.tsx`) as never
}

export function currentPage() {
  const { pathname } = useLocation()
  return ROUTES.find((route) => pathname === route.path)!
}

export function createHook() {
  const go = useNavigate()
  const [param, setParam] = useSearchParams()

  const screen: iScreen = (props) => {
    const { name, params, callback, delay: d, ...opt } = props
    const path = ROUTES.find((item) => item.alias === name)?.path
    const second = THEME.animation.duration[d || 'panel']

    if (!path) {
      throw new Error(`Route path is not found. Alias: "${name}"`)
    }

    if (!callback) {
      return promise()
        .then(() => go(path, opt))
        .then(() => params && setParam({ ...param, ...params }))
    }

    return promise()
      .then(() => callback?.())
      .then(() => delay(second))
      .then(() => go(path, opt))
      .then(() => params && setParam({ ...param, ...params }))
  }

  return { screen }
}

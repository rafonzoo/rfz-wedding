import type { Unarray } from '@app/types'
import type { ROUTES_NAME } from '@app/config'
import { useLocation, useNavigate } from '@solidjs/router'
import { store } from '@app/state/store'
import { delay } from '@app/helpers/util'
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

  return {
    screen: (
      name: Unarray<typeof ROUTES_NAME>,
      callback?: () => void,
      duration?: keyof typeof THEME.animation.duration
    ) => {
      const path = ROUTES.find((item) => item.alias === name)?.path
      const second = THEME.animation.duration[duration || 'panel']

      if (!path) {
        throw new Error(`Route path is not found. Alias: "${name}"`)
      }

      return !callback
        ? go(path)
        : delay(0)
            .then(() => callback?.())
            .then(() => delay(second))
            .then(() => go(path))
    },
  }
}

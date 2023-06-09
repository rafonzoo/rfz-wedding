import type { Callable, Unarray } from '@app/types'
import type { Params, NavigateOptions } from '@solidjs/router'
import { ROUTES_NAME } from '@app/config'
import { THEME } from '@app/config/theme'

export type iNavbar = {
  path: string
}

export type iState = {
  show: () => boolean
  setShow: (isOpen: boolean) => void
}

export type iScreen = <T extends Params>(
  opt: Partial<NavigateOptions> & {
    delay?: keyof typeof THEME.animation.duration
    name: Unarray<typeof ROUTES_NAME>
    params?: T
    callback?: () => void
  }
) => void

import type { Component } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import { Button as KButton } from '@kobalte/core'
import { classList } from '@app/helpers/util'

const ButtonBase: Component<ButtonRootProps> = (props) => {
  return (
    <KButton.Root
      {...props}
      class='flex appearance-none items-center justify-center rounded-md text-center text-base -tracking-base outline-none focus:shadow-none focus-visible:shadow-focus'
      classList={{ ...classList(props) }}
    />
  )
}

export default ButtonBase

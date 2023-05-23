import type { Component, JSX } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import { splitProps } from 'solid-js'
import { classList } from '@app/helpers/util'
import ButtonBase from '@app/components/Button/Base'

interface iButtonIcon {
  icon: JSX.Element
}

const ButtonIcon: Component<iButtonIcon & ButtonRootProps> = (props) => {
  const [{ icon }, rest] = splitProps(props, ['icon'])
  return (
    <ButtonBase
      {...rest}
      class='text-blue-600 dark:text-blue-400'
      classList={{ ...classList(rest) }}
    >
      {icon}
    </ButtonBase>
  )
}

export default ButtonIcon

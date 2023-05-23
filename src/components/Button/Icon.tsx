import type { Component, JSX } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import { classList } from '@app/helpers/util'
import ButtonBase from '@app/components/Button/Base'

interface iButtonIcon {
  icon: JSX.Element
}

const ButtonIcon: Component<iButtonIcon & ButtonRootProps> = ({ icon, ...props }) => {
  return (
    <ButtonBase
      {...props}
      class='text-blue-600 dark:text-blue-400'
      classList={{ ...classList(props) }}
    >
      {icon}
    </ButtonBase>
  )
}

export default ButtonIcon

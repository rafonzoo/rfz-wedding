import type { Component, JSX } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import { splitProps } from 'solid-js'
import { Button as KButton } from '@kobalte/core'
import { classList } from '@app/helpers/util'

interface iButtonIcon {
  icon: JSX.Element
  label: string
}

const ButtonIcon: Component<iButtonIcon & ButtonRootProps> = (props) => {
  const [{ icon, label }, rest] = splitProps(props, ['icon', 'label'])
  return (
    <KButton.Root
      {...rest}
      class='appearance-none text-base -tracking-base text-blue-600 dark:text-blue-400'
      classList={{ ...classList(rest) }}
    >
      {icon}
      <span class='sr-only'>{label}</span>
    </KButton.Root>
  )
}

export default ButtonIcon

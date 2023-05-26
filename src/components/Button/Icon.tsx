import type { Component, JSX } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import clsx from 'clsx'
import ButtonBase from '@app/components/Button/Base'

interface ButtonIconProps {
  icon: JSX.Element
}

const ButtonIcon: Component<ButtonIconProps & ButtonRootProps> = ({
  icon,
  ...props
}) => {
  return (
    <ButtonBase
      {...props}
      class={clsx('text-primary dark:text-primary-dark', props.class)}
    >
      {icon}
    </ButtonBase>
  )
}

export default ButtonIcon

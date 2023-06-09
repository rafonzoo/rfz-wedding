import type { Component, JSX } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import { splitProps } from 'solid-js'
import clsx from 'clsx'
import ButtonBase from '@app/components/Button/Base'

interface ButtonIconProps extends ButtonRootProps {
  icon: JSX.Element
}

const ButtonIcon: Component<ButtonIconProps> = (props) => {
  const [{ icon }, rest] = splitProps(props, ['icon'])

  return (
    <ButtonBase
      {...rest}
      class={clsx('text-primary dark:text-primary-dark', rest.class)}
    >
      {icon}
    </ButtonBase>
  )
}

export default ButtonIcon

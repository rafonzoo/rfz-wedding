import type { JSX } from 'solid-js'
import type { FC } from '@app/types'
import { splitProps } from 'solid-js'
import clsx from 'clsx'
import ButtonBase from '@app/components/Button/Base'

interface ButtonIconProps {
  icon: JSX.Element
}

const ButtonIcon: FC<ButtonIconProps & JSX.IntrinsicElements['button']> = (
  props
) => {
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

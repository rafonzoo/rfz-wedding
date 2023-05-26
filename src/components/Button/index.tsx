import type { Component } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import { splitProps } from 'solid-js'
import clsx from 'clsx'
import ButtonBase from '@app/components/Button/Base'

interface ButtonProps extends ButtonRootProps {
  model?: 'default' | 'action'
}

const Button: Component<ButtonProps> = (props) => {
  const [{ model = 'default' }, rest] = splitProps(props, ['model'])
  return (
    <ButtonBase
      {...rest}
      class={clsx(styles.base, props.class, {
        [styles.action]: model === 'action',
      })}
    />
  )
}

const styles = {
  action: clsx('h-14 w-full !rounded-lg font-semibold'),
  base: clsx(
    'bg-primary px-3 py-1 text-white outline-none transition-colors',
    'duration-200 ease-in-out hover:bg-blue-700 active:bg-blue-800'
  ),
}

export default Button

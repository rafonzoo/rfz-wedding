import type { JSX } from 'solid-js'
import type { FC } from '@app/types'
import { splitProps } from 'solid-js'
import clsx from 'clsx'
import ButtonBase from '@app/components/Button/Base'

interface ButtonProps {
  model?: 'default' | 'action'
}

const Button: FC<ButtonProps & JSX.IntrinsicElements['button']> = (props) => {
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

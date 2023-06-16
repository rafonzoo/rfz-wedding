import type { JSX } from 'solid-js'
import type { FC } from '@app/types'
import clsx from 'clsx'

const ButtonBase: FC<JSX.IntrinsicElements['button']> = (props) => {
  return <button {...props} class={clsx(styles.index, props.class)} />
}

const styles = {
  index: clsx(
    'flex appearance-none items-center justify-center',
    'rounded-md text-center text-base -tracking-base',
    'outline-none focus-visible:shadow-focus',
    'disabled:pointer-events-none disabled:opacity-50'
  ),
}

export default ButtonBase

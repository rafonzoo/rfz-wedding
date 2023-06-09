import type { Component } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import { Button as KButton } from '@kobalte/core'
import clsx from 'clsx'

const ButtonBase: Component<ButtonRootProps> = (props) => {
  return <KButton.Root {...props} class={clsx(styles.index, props.class)} />
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

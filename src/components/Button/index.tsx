import type { Component } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import { splitProps } from 'solid-js'
import { Button as KButton } from '@kobalte/core'
import { classList } from '@app/helpers/util'

interface iButton {
  model?: 'default' | 'action'
}

const Button: Component<iButton & ButtonRootProps> = (props) => {
  const [{ model = 'default' }, rest] = splitProps(props, ['model'])
  return (
    <KButton.Root
      {...rest}
      class='flex appearance-none items-center justify-center rounded-md bg-blue-600 px-3 py-1 text-center -tracking-base text-white transition-colors duration-200 ease-in-out hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:bg-blue-800'
      classList={{
        'h-14 w-full !rounded-lg font-semibold': model === 'action',
        ...classList(rest),
      }}
    />
  )
}

export default Button

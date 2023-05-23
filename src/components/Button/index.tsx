import type { Component } from 'solid-js'
import type { ButtonRootProps } from '@kobalte/core/dist/types/button'
import { splitProps } from 'solid-js'
import { classList } from '@app/helpers/util'
import ButtonBase from '@app/components/Button/Base'

interface iButton extends ButtonRootProps {
  model?: 'default' | 'action'
}

const Button: Component<iButton> = (props) => {
  const [{ model = 'default' }, rest] = splitProps(props, ['model'])
  return (
    <ButtonBase
      {...rest}
      class='bg-blue-600 px-3 py-1 text-white outline-none transition-colors duration-200 ease-in-out hover:bg-blue-700 active:bg-blue-800'
      classList={{
        'h-14 w-full !rounded-lg font-semibold': model === 'action',
        ...classList(rest),
      }}
    />
  )
}

export default Button

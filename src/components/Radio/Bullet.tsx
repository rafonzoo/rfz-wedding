import type { Callable, ForwardRef } from '@app/types'
import { splitProps } from 'solid-js'
import { callable } from '@app/helpers/util'

interface iRadioBullet {
  active?: Callable<boolean>
  size?: number
}

const RadioBullet: ForwardRef<'span', iRadioBullet> = (props) => {
  const [{ active = false, size = 24 }] = splitProps(props, ['active', 'size'])
  return (
    <span
      class='flex items-center justify-center rounded-full border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      style={{ width: `${size}px`, height: `${size}px` }}
      classList={{ '!border-blue-400': callable(active) }}
    >
      <span
        style={{ width: `${size - 12}px`, height: `${size - 12}px` }}
        class='block origin-center scale-0 rounded-full bg-blue-600 transition-transform duration-200 ease-in-out'
        classList={{ 'scale-100': callable(active) }}
      />
    </span>
  )
}

export default RadioBullet

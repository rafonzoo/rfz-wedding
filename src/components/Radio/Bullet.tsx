import type { Callable, ForwardRef } from '@app/types'
import { splitProps } from 'solid-js'
import { callable } from '@app/helpers/util'
import clsx from 'clsx'

interface iRadioBullet {
  active?: Callable<boolean>
  size?: number
}

const RadioBullet: ForwardRef<'span', iRadioBullet> = (props) => {
  const [{ active = false, size = 24 }] = splitProps(props, ['active', 'size'])
  return (
    <span
      class={clsx(styles.wrapper, { '!border-blue-400': callable(active) })}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <span
        style={{ width: `${size - 12}px`, height: `${size - 12}px` }}
        class={clsx(styles.bullet, { 'scale-100': callable(active) })}
      />
    </span>
  )
}

const styles = {
  bullet: clsx(
    'block origin-center scale-0 rounded-full bg-primary',
    'transition-transform duration-200 ease-in-out'
  ),
  wrapper: clsx(
    'flex items-center justify-center rounded-full border-2',
    'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
  ),
}

export default RadioBullet

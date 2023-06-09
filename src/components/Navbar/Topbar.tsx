import type { ForwardRef } from '@app/types'
import { splitProps } from 'solid-js'
import clsx from 'clsx'

interface TopbarProps {
  position?: 'sticky' | 'relative' | 'absolute'
  separator?: boolean
}

const Topbar: ForwardRef<'div', TopbarProps> = (props) => {
  const [{ position = 'absolute', separator = false }, rest] = splitProps(
    props,
    ['position', 'separator']
  )
  return (
    <div
      {...rest}
      class={clsx(styles.index, position, props.class, {
        [styles.border]: separator,
        [styles.backdrop]: position !== 'relative',
      })}
    />
  )
}

const styles = {
  backdrop: clsx('bg-blur-light backdrop-blur-md dark:bg-blur-dark'),
  border: clsx('border-b border-b-gray-200 dark:border-b-gray-800'),
  index: clsx(
    'left-0 top-0 flex h-12 w-full items-center justify-between px-3'
  ),
}

export default Topbar

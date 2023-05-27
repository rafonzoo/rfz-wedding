import type { ForwardRef } from '@app/types'
import clsx from 'clsx'

interface TopbarProps {
  position?: 'absolute' | 'relative'
}

const Topbar: ForwardRef<'nav', TopbarProps> = ({
  position = 'absolute',
  ...props
}) => {
  return (
    <nav
      {...props}
      class={clsx(styles.index, props.class, {
        [styles.ontop]: position === 'absolute',
      })}
    />
  )
}

const styles = {
  index: clsx('flex h-12 items-center justify-between px-3'),
  ontop: clsx('absolute right-0 top-0 w-full'),
}

export default Topbar

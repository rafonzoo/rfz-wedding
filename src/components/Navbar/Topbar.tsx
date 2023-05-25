import type { ForwardRef } from '@app/types'
import clsx from 'clsx'

const Topbar: ForwardRef<'nav'> = (props) => {
  return <nav {...props} class={clsx(styles.index, props.class)} />
}

const styles = {
  index: clsx('flex h-[56px] items-center justify-between px-3'),
}

export default Topbar

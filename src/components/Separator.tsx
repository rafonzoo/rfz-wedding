import type { ForwardRef } from '@app/types'
import clsx from 'clsx'

const Separator: ForwardRef<'hr'> = (props) => {
  return (
    <hr
      {...props}
      class={clsx('border-gray-200 dark:border-gray-800', props.class)}
    />
  )
}

export default Separator

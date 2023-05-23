import type { ForwardRef } from '@app/types'
import { classList } from '@app/helpers/util'

const Separator: ForwardRef<'hr'> = (props) => {
  return (
    <hr
      {...props}
      class='border-gray-200 dark:border-gray-800'
      classList={{ ...classList(props) }}
    />
  )
}

export default Separator

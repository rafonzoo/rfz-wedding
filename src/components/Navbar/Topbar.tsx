import type { ForwardRef } from '@app/types'
import { classList } from '@app/helpers/util'

const Topbar: ForwardRef<'nav'> = ({ children, ...props }) => {
  return (
    <nav
      {...props}
      class='flex h-[56px] items-center justify-between px-3 md:items-end md:px-6'
      classList={{ ...classList(props) }}
    >
      {children}
    </nav>
  )
}

export default Topbar

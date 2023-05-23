import type { ForwardRef } from '@app/types'
import { splitProps } from 'solid-js'
import { classList } from '@app/helpers/util'

interface IconSvg {
  size?: number
  fill?: string
  label?: string
}

const IconSvg: ForwardRef<'svg', IconSvg> = (props) => {
  const [{ label, size = 24, fill = 'currentColor' }, rest] = splitProps(
    props,
    ['size', 'fill', 'label']
  )

  return (
    <>
      <svg
        width='1em'
        height='1em'
        fill={fill}
        class='pointer-events-none'
        viewBox='0 0 24 24'
        {...rest}
        style={{ 'font-size': size + 'px' }}
        xmlns='http://www.w3.org/2000/svg'
        classList={{ ...classList(rest) }}
      />
      {label && <span class='sr-only'>{label}</span>}
    </>
  )
}

export type Icon<T = {}> = ForwardRef<'svg', IconSvg & T>
export default IconSvg

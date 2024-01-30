import { forwardRef } from 'react'
import { assets } from '@/tools/helper'

type SpinnerProps = Omit<Tag<'img'>, 'height' | 'width'> & {
  size?: number
}

const Spinner = forwardRef<HTMLImageElement, SpinnerProps>(function SpinnerRef(
  { size = 24, ...props },
  ref
) {
  return (
    <img
      {...props}
      ref={ref}
      src={assets(`/global/tr:q-75/spinner.gif`)}
      alt={props.alt ?? 'Loading...'}
      width={size}
      height={size}
      style={{ width: size, height: size, ...props.style }}
    />
  )
})

export default Spinner

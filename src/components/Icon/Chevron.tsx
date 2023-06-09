import type { Icon } from '@app/components/Icon/Base'
import { splitProps } from 'solid-js'
import clsx from 'clsx'
import IconSvg from '@app/components/Icon/Base'

interface ChevronProps {
  dir?: 'top' | 'bottom' | 'right' | 'left'
  weight?: string
}

const IconChevron: Icon<ChevronProps> = (props) => {
  const [{ dir = 'top', weight = '2' }, rest] = splitProps(props, [
    'dir',
    'weight',
  ])

  return (
    <IconSvg
      {...rest}
      fill='none'
      viewBox='0 0 16 9'
      class={clsx(rest.class, {
        'scale-y-[-1]': dir === 'bottom',
        'rotate-90': dir === 'right',
      })}
    >
      <path
        stroke='currentColor'
        stroke-linecap='round'
        stroke-linejoin='round'
        stroke-width={weight}
        d='m1 8 7-7 7 7'
      />
    </IconSvg>
  )
}

export default IconChevron

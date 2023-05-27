import type { Icon } from '@app/components/Icon/Base'
import IconSvg from '@app/components/Icon/Base'

const IconCirclePerson: Icon = (props) => {
  return (
    <IconSvg {...props}>
      <g clip-path='url(#a)'>
        <path
          fill='currentColor'
          d='M12 0c6.624 0 12 5.376 12 12s-5.376 12-12 12S0 18.624 0 12 5.376 0 12 0ZM4.828 16.1c1.761 2.627 4.406 4.3 7.364 4.3 2.957 0 5.603-1.672 7.363-4.3a10.762 10.762 0 0 0-7.363-2.9 10.762 10.762 0 0 0-7.364 2.9ZM12 10.8a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z'
        />
      </g>
      <defs>
        <clipPath id='a'>
          <path fill='#fff' d='M0 0h24v24H0z' />
        </clipPath>
      </defs>
    </IconSvg>
  )
}

export default IconCirclePerson

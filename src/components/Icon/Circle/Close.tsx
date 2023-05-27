import type { Icon } from '@app/components/Icon/Base'
import IconSvg from '@app/components/Icon/Base'

const IconCircleClose: Icon = (props) => {
  return (
    <IconSvg {...props}>
      <g clip-path='url(#a)'>
        <path
          fill='currentColor'
          d='M24 12a12 12 0 1 1-24 0 12 12 0 0 1 24 0ZM8.031 6.969a.751.751 0 1 0-1.062 1.062L10.939 12l-3.97 3.969a.75.75 0 1 0 1.062 1.062L12 13.061l3.969 3.97a.752.752 0 0 0 1.062-1.062L13.061 12l3.97-3.969a.753.753 0 0 0-.244-1.225.751.751 0 0 0-.818.163L12 10.939 8.031 6.97Z'
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

export default IconCircleClose

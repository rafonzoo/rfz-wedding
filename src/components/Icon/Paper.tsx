import type { Icon } from '@app/components/Icon/Base'
import { splitProps } from 'solid-js'
import IconSvg from '@app/components/Icon/Base'

interface IconPaperProps {
  filled?: boolean
}

const IconPaper: Icon<IconPaperProps> = (props) => {
  const [{ filled = false }, rest] = splitProps(props, ['filled'])
  return (
    <IconSvg {...rest}>
      <path
        fill='#fff'
        d='M20.75 6.947v15.79c0 .698-.56 1.263-1.25 1.263H3.25C2.56 24 2 23.435 2 22.737V1.263C2 .565 2.56 0 3.25 0h10.625l6.875 6.947Z'
      />
      <path
        fill='#60A5FA'
        d='M13.875 0v5.625c0 .69.56 1.25 1.25 1.25h5.625L13.875 0Z'
      />
      {filled && (
        <path
          fill='#D4D4D8'
          d='M4.625 4.5h8.25v-.75h-8.25v.75ZM4.625 6.75h8.25V6h-8.25v.75ZM18.125 9h-13.5v-.75h13.5V9ZM4.625 11.25h13.5v-.75h-13.5v.75ZM18.125 13.5h-13.5v-.75h13.5v.75ZM4.625 15.75h13.5V15h-13.5v.75ZM18.125 18h-13.5v-.75h13.5V18ZM4.625 20.25h13.5v-.75h-13.5v.75Z'
        />
      )}
    </IconSvg>
  )
}

export default IconPaper

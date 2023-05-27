import type { Icon } from '@app/components/Icon/Base'
import IconSvg from '@app/components/Icon/Base'

const IconSpinner: Icon = (props) => {
  return (
    <IconSvg {...props} viewBox='0 0 100 100'>
      <circle
        class='animate-spinner fill-none stroke-current opacity-0'
        style={{
          'stroke-width': '8px',
          'stroke-linecap': 'round',
          'stroke-dasharray': '1 98',
          'stroke-dashoffset': '-300',
        }}
        cx='50'
        cy='50'
        r='45'
      />
    </IconSvg>
  )
}

export default IconSpinner

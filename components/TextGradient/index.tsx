import { tw } from '@/tools/lib'

type TextGradientProps = {
  color?: 'yellow-red' | 'cyan-yellow' | 'orange-cyan' | 'blue-pink'
}

const TextGradient: RFZ<TextGradientProps> = ({ children, color }) => {
  const className = {
    'yellow-red': 'from-yellow-500 to-red-600',
    'cyan-yellow': 'from-teal-500 to-yellow-500',
    'orange-cyan': 'from-orange-500 to-cyan-500',
    'blue-pink': 'from-blue-500 to-pink-500',
  }
  return (
    <span
      className={tw(
        'bg-gradient-to-br bg-clip-text [-webkit-text-fill-color:transparent]',
        className[color || 'yellow-red']
      )}
    >
      {children}
    </span>
  )
}

export type { TextGradientProps }

export default TextGradient

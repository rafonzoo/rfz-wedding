import { FontFamilyWedding } from '@wedding/config'
import { tw } from '@/tools/lib'
import Text from '@wedding/components/Text'

type TextCardProps = Tag<'span'> & {
  className?: string
  family?: `${FontFamilyWedding}`
  useMinMax?: boolean
}

const TextCard: RFZ<TextCardProps> = ({
  family = FontFamilyWedding.cinzel,
  useMinMax = true,
  className,
  children,
  ...span
}) => {
  return (
    <h3>
      <Text
        family={family}
        className={tw(
          'break-words text-white',
          useMinMax &&
            'line-clamp-2 text-[min(34px,max(25px,7.692307692307693vw))]',
          className
        )}
        {...span}
      >
        {children}
      </Text>
    </h3>
  )
}

export default TextCard

import { FontFamilyWedding } from '@wedding/config'
import { tw } from '@/tools/lib'
import Text from '@wedding/components/Text'

type TextTitleProps = {
  className?: string
  family?: `${FontFamilyWedding}`
}

const TextTitle: RFZ<TextTitleProps> = ({
  family = FontFamilyWedding.cinzel,
  children,
  className,
}) => {
  return (
    <h2 className='px-6 pt-[min(108px,max(79px,24.615384615384615vw))]'>
      <Text
        family={family}
        className={tw(
          'relative flex flex-col text-[min(54px,max(40px,12.307692307692308vw))]',
          className
        )}
      >
        {typeof children === 'string'
          ? children.split(' ').map((text, i) => (
              <span key={i} className={tw('block', { 'opacity-50': i > 0 })}>
                {!i ? text + ' ' : text}
              </span>
            ))
          : children}
      </Text>
    </h2>
  )
}

export default TextTitle

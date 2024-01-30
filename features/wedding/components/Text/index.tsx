import { Cinzel, Poiret_One } from 'next/font/google'

type TextProps = Tag<'span'> & {
  family?: keyof typeof fontClasses
}

const CinzelFont = Cinzel({
  weight: 'variable',
  display: 'swap',
  subsets: ['latin'],
  preload: true,
})

const PoiretFont = Poiret_One({
  weight: '400',
  display: 'swap',
  subsets: ['latin'],
  preload: true,
})

const fontClasses = {
  cinzel: {
    ...CinzelFont,
    class: 'leading-[1.25] uppercase tracking-[-0.03em]',
  },
  poiret: { ...PoiretFont, class: 'leading-[1.25]' },
}

const Text: RFZ<TextProps> = ({ children, family, ...props }) => {
  const fontClassName = !family
    ? null
    : family in fontClasses
      ? [fontClasses[family].className, fontClasses[family].class]
          .filter(Boolean)
          .join(' ')
      : null

  const defaultClasses = props.className?.includes('line-clamp') ? '' : 'block'
  const textClasses = [fontClassName, defaultClasses, props.className]
    .filter(Boolean)
    .join(' ')

  return (
    <span {...props} className={textClasses}>
      {children}
    </span>
  )
}

export default Text

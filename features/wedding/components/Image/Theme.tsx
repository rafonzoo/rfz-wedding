'use client'

import { useRef } from 'react'
import { useParams } from 'next/navigation'
import { assets } from '@wedding/helpers'
import { tw } from '@/tools/lib'
import { useIntersection, useWeddingDetail } from '@/tools/hook'
import dynamic from 'next/dynamic'

type ImageThemeProps = {
  className?: string
  size: keyof typeof sizeClasses
}

const SheetLoadout = dynamic(
  () => import('@wedding/components/Sheet/Loadout'),
  {
    ssr: false,
  }
)

const sizeClasses = {
  195: 'w-[min(220px,max(160px,50vw))]',
  169: 'w-[min(190px,max(139px,43.333333333333333vw))]',
  134: 'w-[min(151px,max(110px,34.358974358974359vw))]',
  256: 'w-[min(289px,max(210px,65.641025641025641vw))]',
  390: 'w-full',
}

const ImageTheme: RFZ<ImageThemeProps> = ({ className, size }) => {
  const { theme, background, foreground } = useWeddingDetail().loadout
  const param = useParams()
  const imageRef = useRef(null)
  const isEditor = !!param.wid
  const isIntersecting = useIntersection(imageRef, { threshold: 0.1 })

  return (
    <div className={tw('pt-[100%]', sizeClasses[size], className)}>
      <img
        ref={imageRef}
        className={tw('absolute left-0 top-0 h-full w-full', {
          'transition-opacity duration-300': !isEditor,
          'opacity-90': background === 'black',
          '!opacity-0': !isIntersecting,
        })}
        width={size}
        height={size}
        src={
          !isIntersecting
            ? void 0
            : assets(`/${theme}/theme/tr:w-0.25,q-75/${foreground}.png`)
        }
        alt={[theme, foreground].join('-')}
        srcSet={
          !isIntersecting
            ? void 0
            : [
                assets(`/${theme}/theme/tr:w-0.50,q-75/${foreground}.png 2x`),
                assets(`/${theme}/theme/tr:w-0.75,q-75/${foreground}.png 3x`),
                assets(`/${theme}/theme/tr:q-75/${foreground}.png 4x`),
              ].join(',')
        }
      />
      {size === 195 && <SheetLoadout />}
    </div>
  )
}

export default ImageTheme

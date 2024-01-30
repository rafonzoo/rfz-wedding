'use client'

import type { Wedding } from '@wedding/schema'
import { useRef } from 'react'
import { useParams } from 'next/navigation'
import { tw } from '@/tools/lib'
import { useIntersection } from '@/tools/hook'
import { assets } from '@/tools/helper'

type ImageThemeProps = Wedding['loadout'] & {
  className?: string
  size: keyof typeof sizeClasses
}

const sizeClasses = {
  195: 'w-[min(220px,max(160px,50vw))]',
  169: 'w-[min(190px,max(139px,43.333333333333333vw))]',
  134: 'w-full',
  256: 'w-full',
  390: 'w-full',
}

const ImageTheme: RFZ<ImageThemeProps> = ({ className, size, ...loadout }) => {
  const { theme, background, foreground } = loadout
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
    </div>
  )
}

export default ImageTheme

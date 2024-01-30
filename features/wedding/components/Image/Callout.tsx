'use client'

import type { Wedding } from '@wedding/schema'
import { useRef } from 'react'
import { useParams } from 'next/navigation'
import { tw } from '@/tools/lib'
import { useIntersection } from '@/tools/hook'
import { assets } from '@/tools/helper'

type ImageCalloutProps = {
  model: 'bird' | 'wave'
  foreground: Wedding['loadout']['foreground']
  className?: string
}

const ImageCallout: RFZ<ImageCalloutProps> = ({
  model,
  foreground,
  className,
}) => {
  const param = useParams()
  const imageRef = useRef(null)
  const isEditor = !!param.wid
  const isIntersecting = useIntersection(imageRef, { threshold: 0.5 })

  return (
    <img
      ref={imageRef}
      className={tw(
        'w-full',
        {
          'transition-opacity duration-300': !isEditor,
          '!opacity-0': !isIntersecting,
        },
        className
      )}
      width={366}
      height={366}
      src={
        !isIntersecting
          ? void 0
          : assets(`/callout/${model}/tr:w-0.50,q-75/${foreground}.png`)
      }
      alt={[`callout-${model}`, foreground].join('-')}
      srcSet={
        !isIntersecting
          ? void 0
          : [
              assets(`/callout/${model}/tr:w-0.50,q-75/${foreground}.png 2x`),
              assets(`/callout/${model}/tr:w-0.75,q-75/${foreground}.png 3x`),
              assets(`/callout/${model}/tr:q-75/${foreground}.png 4x`),
            ].join(',')
      }
    />
  )
}

export default ImageCallout

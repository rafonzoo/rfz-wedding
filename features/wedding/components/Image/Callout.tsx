'use client'

import { useRef } from 'react'
import { useParams } from 'next/navigation'
import { assets } from '@wedding/helpers'
import { tw } from '@/tools/lib'
import { useIntersection, useWeddingDetail } from '@/tools/hook'

type ImageCalloutProps = {
  model: 'bird' | 'wave'
  className?: string
}

const ImageCallout: RFZ<ImageCalloutProps> = ({ model, className }) => {
  const { foreground } = useWeddingDetail().loadout
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

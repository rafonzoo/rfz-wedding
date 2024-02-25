'use client'

import type { WeddingEvent } from '@wedding/schema'
import { useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { tw } from '@/tools/lib'
import { useIOSVersion, useIntersection } from '@/tools/hook'

const EventMaps: RF<
  Pick<WeddingEvent, 'placeName' | 'district' | 'province'>
> = ({ placeName, district, province }) => {
  const divRef = useRef<HTMLDivElement | null>(null)
  const isIntersecting = useIntersection(divRef)
  const isPublic = !!useParams().name
  const isLocalDev = process.env.NEXT_PUBLIC_SITE_ENV !== 'development'
  const iOSVersion = useIOSVersion()
  const isIOS12 = iOSVersion && iOSVersion.array[0] <= 12

  const mapSearch = [
    placeName.replace(/\s?-+\s?/g, ' ').trim(),
    district,
    province,
  ].join(', ')

  return (
    <>
      <div
        ref={divRef}
        className={tw(
          'pt-[75.128205128205128%]',
          isIOS12 && 'relative overflow-hidden bg-zinc-800'
        )}
      >
        {(isPublic || isLocalDev) && isIntersecting && (
          <>
            {isIOS12 ? (
              <>
                <a
                  href={`https://google.com/maps/search/${mapSearch.replace(/\s/g, '+')}`}
                  target='_blank'
                  className='absolute right-3 top-3 z-10 flex items-center justify-center space-x-2 rounded-lg bg-blue-950/50 p-3 text-blue-400'
                >
                  <span className='block text-sm'>
                    <FaMapMarkerAlt />
                  </span>
                  <span className='block text-center text-sm'>
                    Buka di maps
                  </span>
                </a>
                <Image
                  src='/assets/img/map-not-support.jpg'
                  alt='Unsupported device map'
                  width={366}
                  height={255}
                  className='absolute left-0 top-0 h-full w-full object-cover object-center blur-sm'
                />
              </>
            ) : (
              <iframe
                className='absolute left-0 top-0 h-full w-full hue-rotate-180 invert-[0.9] filter'
                src={`https://www.google.com/maps/embed/v1/place?q=${mapSearch.replace(/\s/g, '+')}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`}
                allowFullScreen={false}
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              />
            )}
          </>
        )}
      </div>
    </>
  )
}

export default EventMaps

'use client'

import type { WeddingEvent } from '@wedding/schema'
import type { EventTimeErrorRef } from '@wedding/components/Section/Events/Time'
import type { EventDateErrorRef } from '@wedding/components/Section/Events/Date'
import { type MutableRefObject } from 'react'
import { useParams } from 'next/navigation'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { tw } from '@/tools/lib'
import { useFeatureDetection } from '@/tools/hook'
import EventTime from '@wedding/components/Section/Events/Time'
import EventDate from '@wedding/components/Section/Events/Date'

type EventProps = WeddingEvent & {
  isActive: boolean
  dateErrorRef: MutableRefObject<EventDateErrorRef>
  timeErrorRef: MutableRefObject<EventTimeErrorRef>
}

const Event: RFZ<EventProps> = ({
  children,
  id,
  placeName,
  district,
  province,
  country,
  date,
  eventName,
  mapUrl,
  opensTo,
  isActive,
  timeStart,
  timeEnd,
  localTime,
  detail,
  dateErrorRef,
  timeErrorRef,
}) => {
  const isPublic = !!useParams().name
  const isLocalDev = process.env.NEXT_PUBLIC_SITE_ENV !== 'development'
  const { pointerEvent } = useFeatureDetection()
  const time = {
    id,
    eventName,
    isActive,
    timeStart,
    timeEnd,
    localTime,
    previousError: timeErrorRef,
  }

  const dateAndAddress = {
    id,
    date,
    placeName,
    isActive,
    district,
    province,
    country,
    mapUrl,
    detail,
    opensTo,
    previousError: dateErrorRef,
  }

  return (
    <li className='flex min-w-full flex-col'>
      <EventDate {...dateAndAddress} />
      <div className='relative mr-6 mt-6 overflow-hidden rounded-br-2xl rounded-tr-2xl'>
        <div
          className={tw(
            'pt-[75.128205128205128%]',
            !pointerEvent && 'bg-zinc-800'
          )}
        >
          {(isPublic || isLocalDev) && !pointerEvent && (
            <a
              href={`https://google.com/maps/search/${detail.replace(/\s/g, '+')}`}
              target='_blank'
              className='absolute right-3 top-3 z-10 flex items-center justify-center space-x-2 rounded-md bg-blue-950/50 p-3 text-blue-400'
            >
              <span className='block text-sm'>
                <FaMapMarkerAlt />
              </span>
              <span className='block text-center text-sm'>Buka di maps</span>
            </a>
          )}
        </div>
        {(isPublic || isLocalDev) && pointerEvent && (
          <iframe
            className='absolute left-0 top-0 h-full w-full hue-rotate-180 invert-[0.9] filter'
            src={mapUrl}
            allowFullScreen={false}
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'
          />
        )}
      </div>
      <EventTime {...time}>{children}</EventTime>
    </li>
  )
}

export default Event

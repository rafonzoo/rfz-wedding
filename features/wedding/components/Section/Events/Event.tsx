'use client'

import type { WeddingEvent } from '@wedding/schema'
import type { EventTimeErrorRef } from '@wedding/components/Section/Events/Time'
import type { EventDateErrorRef } from '@wedding/components/Section/Events/Date'
import { type MutableRefObject } from 'react'
import EventTime from '@wedding/components/Section/Events/Time'
import EventMaps from '@wedding/components/Section/Events/Maps'
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
  date,
  eventName,
  opensTo,
  isActive,
  timeStart,
  timeEnd,
  localTime,
  detail,
  dateErrorRef,
  timeErrorRef,
}) => {
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
    detail,
    opensTo,
    previousError: dateErrorRef,
  }

  const maps = { placeName, district, province }

  return (
    <li className='flex min-w-full flex-col'>
      <EventDate {...dateAndAddress} />
      <div className='relative mr-6 mt-6 overflow-hidden rounded-br-2xl rounded-tr-2xl'>
        <EventMaps {...maps} />
      </div>
      <EventTime {...time}>{children}</EventTime>
    </li>
  )
}

export default Event

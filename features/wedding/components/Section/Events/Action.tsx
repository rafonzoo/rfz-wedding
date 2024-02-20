'use client'

import type { WeddingEvent } from '@wedding/schema'
import { useRef } from 'react'
import { MdModeEdit } from 'react-icons/md'
import { BsPlusLg } from 'react-icons/bs'
import { placeName } from '@wedding/helpers'
import { tw } from '@/tools/lib'
import { useIsEditorOrDev, useWeddingDetail } from '@/tools/hook'
import dayjs from 'dayjs'
import { atcb_action } from 'add-to-calendar-button-react'

type EventsActionProps = WeddingEvent & {
  isFirstIndex: boolean
  isActive: boolean
  onClick?: () => void
}

const EventsAction: RF<EventsActionProps> = ({
  isFirstIndex,
  isActive,
  onClick,
  ...event
}) => {
  const isEditor = useIsEditorOrDev()
  const detail = useWeddingDetail()
  const isPublic = !isEditor
  const publicButton = useRef<HTMLButtonElement | null>(null)

  function saveToCalendar() {
    const name = detail.displayName
      .split(' & ')
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
      .join(' & ')

    const title = `The Wedding of ${name}`
    const dateStart = dayjs(event.date)
      .set('h', +event.timeStart.split(':')[0])
      .set('m', +event.timeStart.split(':')[1])
      .tz()

    const dateEnd = dayjs(event.date)
      .set('h', +event.timeEnd.split(':')[0])
      .set('m', +event.timeEnd.split(':')[1])
      .tz()

    atcb_action({
      name: title + ` (${event.eventName})`,
      options: ['Apple', 'Google', 'Outlook.com', 'MicrosoftTeams'],
      location: [placeName(event.placeName), event.detail].join('. '),
      startDate: dateStart.format('YYYY-MM-DD'),
      endDate: dateEnd.format('YYYY-MM-DD'),
      startTime: dateStart.format('HH:mm'),
      endTime: dateEnd.format('HH:mm'),
      timeZone: 'Asia/Jakarta',
    })
  }

  return isPublic ? (
    <button
      ref={publicButton}
      tabIndex={isActive ? 0 : -1}
      aria-label='Save to calendar'
      className='ml-5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-2xl text-white'
      onClick={saveToCalendar}
    >
      <BsPlusLg />
    </button>
  ) : (
    <div className='ml-5 h-10 w-10'>
      <button
        aria-label='Tambah / hapus acara'
        tabIndex={isActive && !isFirstIndex ? 0 : -1}
        onClick={isFirstIndex ? void 0 : onClick}
        className={tw(
          'flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-xl text-white',
          isFirstIndex && 'opacity-50'
        )}
      >
        <MdModeEdit />
      </button>
    </div>
  )
}

export default EventsAction

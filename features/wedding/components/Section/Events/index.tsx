'use client'

import type { Wedding, WeddingEvent } from '@wedding/schema'
import type { EventTimeErrorRef } from '@wedding/components/Section/Events/Time'
import type { EventDateErrorRef } from '@wedding/components/Section/Events/Date'
import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import { updateWeddingEventQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import { useUtilities } from '@/tools/hook'
import { exact, groupName, guestAlias } from '@/tools/helper'
import { AppConfig, Queries } from '@/tools/config'
import { DUMMY_EVENT } from '@/dummy'
import dynamic from 'next/dynamic'
import Event from '@wedding/components/Section/Events/Event'
import EventsAction from '@wedding/components/Section/Events/Action'
import ImageTheme from '@wedding/components/Image/Theme'
import ImageCallout from '@wedding/components/Image/Callout'
import Spinner from '@/components/Loading/Spinner'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const SectionEvents: RFZ<Wedding> = (wedding) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [open, onOpenChange] = useState(false)
  const [isLoading, setIsLoading] = useState<'add' | 'delete' | null>(null)
  const { abort, getSignal } = useUtilities()
  const isPublic = !!useParams().name
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const guestSlug = useSearchParams().get('to') ?? ''
  const group = groupName(guestAlias(guestSlug))

  // prettier-ignore
  const opensToOnlyEvents = (
    !isPublic
      ? wedding.events
      : !group
        ? wedding.events.filter((event) => !event.opensTo)
        : wedding.events.filter((event) => {
            const lowerGroup = group.toLowerCase()
            const eventGroup = event.opensTo
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
              .find((item) => lowerGroup.includes(item))

            return !event.opensTo || (eventGroup && lowerGroup.includes(eventGroup))
          })
  )

  // In case group doesn't match any, show all event.
  // prettier-ignore
  const groupedEvents = (
    !opensToOnlyEvents.length ? wedding.events : opensToOnlyEvents
  )

  const events = groupedEvents.map((item, index) => ({
    ...item,
    isActive: index === activeIndex,
  }))

  const dateErrorRef = useRef<EventDateErrorRef>([])
  const timeErrorRef = useRef<EventTimeErrorRef>([])
  const eventIds = events.map((event) => event.id)
  const biggestId = Math.max.apply(null, !eventIds.length ? [0] : eventIds)
  const wid = useParams().wid as string
  const { mutate: updateEvent, isLoading: updateLoading } = useMutation<
    WeddingEvent[],
    unknown,
    {
      payload: WeddingEvent[]
      onSuccess: (latestEvents: WeddingEvent[]) => void
    }
  >({
    mutationFn: ({ payload }) => {
      const signal = getSignal()

      return updateWeddingEventQuery({
        wid,
        signal,
        payload,
      })
    },
    onSettled: () => {
      onOpenChange(false)
      setIsLoading(null)
    },
    onSuccess: (latestEvents, { onSuccess }) => {
      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) => {
          return !prev
            ? prev
            : {
                ...prev,
                events: latestEvents,
              }
        }
      )

      onSuccess(latestEvents)
    },
  })

  const buttons = [
    {
      label: 'Tambah acara',
      id: 'add' as const,
      onClick: () => {
        if (isMax || isLoading) {
          return
        }

        setIsLoading('add')
        updateEvent({
          payload: [
            ...detail.events,
            {
              ...DUMMY_EVENT,
              id: biggestId + 1,
            },
          ],
          onSuccess: (latestEvents) => {
            setActiveIndex(latestEvents.length - 1)
          },
        })
      },
    },
    {
      label: 'Hapus',
      id: 'delete' as const,
      className: 'text-red-500',
      onClick: () => {
        if (events.length === 1 || isLoading) {
          return
        }

        setIsLoading('delete')
        updateEvent({
          payload: detail.events.filter(
            (item) => item.id !== events[activeIndex]?.id
          ),
          onSuccess: (latestEvents) => {
            if (activeIndex === latestEvents.length) {
              setActiveIndex((prev) => prev - 1)
            }
          },
        })
      },
    },
  ]

  const isMax = events.length === AppConfig.Wedding.MaxEvent
  const actions =
    events.length === 1 || !activeIndex
      ? buttons.filter((item) => item.id !== 'delete')
      : isMax
        ? buttons.filter((item) => item.id !== 'add')
        : buttons

  const isDisabledPrevious = !activeIndex
  const isDisabledNext = activeIndex === events.length - 1

  return (
    <section className='relative overflow-hidden'>
      <div className='relative'>
        {events.length > 1 && (
          <div className='absolute right-[6.153846153846154%] top-[min(46px,max(32px,10.256410256410256vw))] z-[2] flex h-8 text-zinc-500'>
            <button
              aria-label='Previous'
              disabled={isDisabledPrevious}
              onClick={() =>
                !isDisabledPrevious && setActiveIndex((prev) => prev - 1)
              }
              className={tw(
                '-mr-4 -mt-2 box-content flex h-8 w-8 items-center justify-center rounded-full p-2 text-[21px]',
                isDisabledPrevious && 'text-zinc-300 dark:text-zinc-700' // prettier-ignore
              )}
            >
              <FaChevronLeft />
            </button>
            <button
              aria-label='Next'
              disabled={isDisabledNext}
              onClick={() =>
                !isDisabledNext && setActiveIndex((prev) => prev + 1)
              }
              className={tw(
                '-mr-2 -mt-2 box-content flex h-8 w-8 items-center justify-center rounded-full p-2 text-[21px]',
                isDisabledNext && 'text-zinc-300 dark:text-zinc-700' // prettier-ignore
              )}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
        <div className='relative z-[1] max-w-full overflow-hidden'>
          <ul
            className='relative flex flex-nowrap transition-transform duration-300'
            style={{ transform: `translate3d(${-100 * activeIndex + '%'},0,0)` }} // prettier-ignore
          >
            {events.map((event, index) => (
              <Event
                key={index}
                {...event}
                dateErrorRef={dateErrorRef}
                timeErrorRef={timeErrorRef}
              >
                <EventsAction
                  isActive={activeIndex === index}
                  onClick={() => onOpenChange(true)}
                  isFirstIndex={
                    !index && events.length === AppConfig.Wedding.MaxEvent
                  }
                />
              </Event>
            ))}
          </ul>
        </div>
        <div className='absolute bottom-0 left-0 flex w-full items-center justify-center space-x-1 pb-[24.615384615384615%]'>
          {[...Array.from(events.keys())].map((index, i, array) => (
            <span
              key={index}
              className={tw(
                'h-1.5 w-1.5 rounded-full transition-[width,background-color] duration-200',
                {
                  '!w-8 bg-zinc-500': activeIndex === index,
                  'bg-zinc-300 delay-100 dark:bg-zinc-700': activeIndex !== index, // prettier-ignore
                  'opacity-0': array.length === 1,
                }
              )}
            />
          ))}
        </div>
      </div>
      <div className='absolute bottom-24 left-6 right-0'>
        <ImageCallout model='bird' foreground={wedding.loadout.foreground} />
      </div>
      <div className='absolute bottom-0 right-0'>
        <ImageTheme {...wedding.loadout} size={169} className='rotate-90' />
      </div>
      <BottomSheet
        root={{ open, onOpenChange }}
        onCloseClicked={abort}
        option={{ isTransparent: true, useOverlay: true }}
        footer={{ useClose: true }}
      >
        <div className='px-6 pb-0.5'>
          <ul className='space-y-2'>
            {actions.map(({ id, label, className, onClick }, index) => (
              <li key={index}>
                <button
                  onClick={onClick}
                  disabled={isLoading === id}
                  className={tw(
                    'flex h-14 w-full items-center justify-center rounded-xl px-3 text-center font-semibold -tracking-base',
                    id === 'delete' && 'bg-zinc-100 text-red-600',
                    id === 'add' && 'bg-blue-600 text-white',
                    className
                  )}
                >
                  {isLoading === id && updateLoading ? <Spinner /> : label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </BottomSheet>
    </section>
  )
}

export default SectionEvents

'use client'

import type { ChangeEvent, MutableRefObject } from 'react'
import type { Wedding, WeddingEventTime } from '@wedding/schema'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { ZodError } from 'zod'
import { PiWarningCircleFill } from 'react-icons/pi'
import { weddingEventType } from '@wedding/schema'
import { updateWeddingEventTimeQuery } from '@wedding/query'
import { djs, tw } from '@/tools/lib'
import { useIsEditorOrDev, useUtilities } from '@/tools/hook'
import { exact, isObjectEqual, omit } from '@/tools/helper'
import { Queries } from '@/tools/config'
import dynamic from 'next/dynamic'
import Notify from '@/components/Notification/Notify'
import Spinner from '@/components/Loading/Spinner'
import FieldText from '@/components/Field/Text'
import FieldGroup from '@/components/Field/Group'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const LOCAL_TIME = ['WIB', 'WIT', 'WITA'] as const

type EventTimeErrorRef = Partial<WeddingEventTime & { id: number }>[]

type EventTimeProps = WeddingEventTime & {
  id: number
  isActive: boolean
  previousError: MutableRefObject<EventTimeErrorRef>
}

const EventTime: RFZ<EventTimeProps> = ({
  children,
  id,
  isActive,
  previousError,
  ...props
}) => {
  const { abort, cancelDebounce, debounce, getSignal } = useUtilities()
  const [time, setTime] = useState(props)
  const [open, onOpenChange] = useState(false)
  const [errors, setErrors] = useState<{ key: string; message: string }[]>([])
  const hasError = !!previousError.current.find((item) => item.id === id)
  const { timeStart, timeEnd, eventName, localTime } = time
  const isEditor = useIsEditorOrDev()
  const caption = `Pukul ${timeStart} ${localTime} — ${timeEnd} ${localTime}`
  const wid = useParams().wid as string
  const query = useQueryClient()
  const detail = exact(query.getQueryData<Wedding>(Queries.weddingDetail))
  const [previousLength, setPreviousLength] = useState(detail.events.length)
  const { mutate: updateTime, isLoading } = useMutation<
    WeddingEventTime,
    unknown,
    Partial<WeddingEventTime>
  >({
    mutationFn: (payload) => {
      const signal = getSignal()
      const updatedEvents = detail.events.map((event) => {
        if (event.id !== id) {
          return event
        }

        return { ...event, ...payload }
      })

      return updateWeddingEventTimeQuery({
        wid,
        id,
        signal,
        payload: updatedEvents,
      })
    },
    onSuccess: (result) => {
      previousError.current = previousError.current.filter(
        (item) => item.id !== id
      )

      query.setQueryData<Wedding | undefined>(Queries.weddingDetail, (prev) =>
        !prev
          ? prev
          : {
              ...prev,
              events: prev.events.map((event) => {
                if (event.id !== id) {
                  return event
                }

                return { ...event, ...result }
              }),
            }
      )
    },
    onError: (e, payload) => {
      if ((e as Error)?.message.includes('AbortError')) {
        return
      }

      previousError.current = [
        ...previousError.current.filter((item) => item.id !== id),
        {
          ...payload,
          id,
        },
      ]
    },
  })

  const isMainEvent = !detail.events.findIndex((event) => event.id === id)

  useEffect(() => {
    const anyActionEvent = detail.events.length !== previousLength

    if (anyActionEvent) {
      let incoming = {
        eventName: props.eventName,
        timeStart: props.timeStart,
        timeEnd: props.timeEnd,
        localTime: props.localTime,
      }

      const errorUnsavedEvent = previousError.current.find(
        (item) => item.id === id
      )

      if (errorUnsavedEvent) {
        const { id, ...rest } = errorUnsavedEvent
        incoming = { ...incoming, ...rest }
      } else {
        const errorIds = detail.events.map((itm) => itm.id)

        previousError.current = previousError.current.filter(
          (item) => item.id && errorIds.includes(item.id)
        )
      }

      setTime(incoming)
      setPreviousLength(detail.events.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.events, id, previousLength, props])

  function isInvalidTime(key: 'timeStart' | 'timeEnd', value: string) {
    const isTimeStart = key === 'timeStart'
    const [hrStart, minStart] = (isTimeStart ? value : timeStart).split(':')
    const [hrEnds, minEnds] = (isTimeStart ? timeEnd : value).split(':')
    const timeStarts = djs().set('h', +hrStart).set('m', +minStart)
    const timeEnds = djs().set('h', +hrEnds).set('m', +minEnds)

    if (!value) {
      return true
    }

    if (timeStarts.isSame(timeEnds, 'minute')) {
      return true
    }

    return isTimeStart
      ? timeStarts.isAfter(timeEnds, 'minute')
      : timeEnds.isBefore(timeStarts, 'minute')
  }

  function valueSetter<T extends keyof WeddingEventTime>(key: T) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      let currentError: string[] = [...errors].map((item) => item.key)

      if (key === 'eventName') {
        try {
          weddingEventType.shape.eventName.parse(e.target.value)

          currentError = currentError.filter((keyed) => key !== keyed)
          setErrors((prev) => prev.filter((item) => item.key !== key))
        } catch (e) {
          if (!(e instanceof ZodError)) return
          const { message } = e.issues[0]

          currentError = [...currentError.filter((keyed) => key !== keyed), key]
          setErrors((prev) => [
            ...prev.filter((item) => item.key !== key),
            { key, message },
          ])
        }
      } else if (key === 'timeStart' || key === 'timeEnd') {
        const isInvalid = isInvalidTime(key, e.target.value)

        !isInvalid
          ? (currentError = currentError.filter((keyed) => keyed !== 'time'))
          : (currentError = [
              ...currentError.filter((keyed) => 'time' !== keyed),
              'time',
            ])

        setErrors((prev) =>
          !isInvalid
            ? prev.filter((item) => item.key !== 'time')
            : [
                ...prev.filter((item) => item.key !== key),
                {
                  key: 'time',
                  message: 'Starting time should before times end.',
                },
              ]
        )
      }

      abort()
      cancelDebounce()
      setTime((prev) => ({ ...prev, [key]: e.target.value }))

      const actualErrors = !currentError.includes('time')
        ? currentError
        : [...currentError, 'timeStart', 'timeEnd']

      const propsWithoutError = omit(props, ...(actualErrors as []))
      const payload = omit(
        { ...time, [key]: e.target.value.trim() },
        ...(actualErrors as [])
      ) as Partial<WeddingEventTime>

      if (isObjectEqual(payload, propsWithoutError)) {
        return (previousError.current = previousError.current.filter(
          (item) => item.id !== id
        ))
      }

      // Mutate here
      debounce(() => updateTime(payload))
    }
  }

  return (
    <div className='mb-[min(179px,max(129px,40.512820512820513vw))] mr-0 mt-5 flex justify-center'>
      <p className='relative flex flex-col items-end text-right text-sm tracking-normal text-zinc-500'>
        <span>{caption}</span>
        <span>
          ({[isMainEvent ? 'Utama' : '', eventName].filter(Boolean).join(' / ')}
          )
        </span>
        {isEditor && isActive && (
          <BottomSheet
            trigger={{
              asChild: true,
              children: (
                <button
                  onClick={() => onOpenChange(true)}
                  className={tw(
                    'absolute flex flex-col items-end text-right text-sm tracking-normal text-zinc-500',
                    '-bottom-1 -left-2 -right-2 -top-1 rounded-2xl outline-offset-4',
                    open ? 'shadow-focus outline-none' : 'shadow-outlined'
                  )}
                >
                  {hasError && !isLoading && (
                    <span className='absolute -right-3 -top-3 flex items-center justify-center rounded-full bg-white text-2xl text-red-600'>
                      <PiWarningCircleFill />
                    </span>
                  )}
                </button>
              ),
            }}
            footer={{ useClose: true }}
            root={{ open, onOpenChange }}
            header={{
              title: 'Edit acara',
              useBorder: hasError,
              append: (
                <>
                  {isLoading && <Spinner />}
                  {hasError && !isLoading && (
                    <button
                      className='relative text-blue-600 dark:text-blue-400'
                      onClick={() => updateTime(time)}
                    >
                      Simpan
                    </button>
                  )}
                </>
              ),
            }}
          >
            {hasError && (
              <div className='px-6 py-6'>
                <Notify
                  severity='error'
                  title='Failed to save a changes.'
                  description='Please tap "Save" above to keep your data up to date.'
                />
              </div>
            )}
            <FieldGroup title='Nama/Waktu'>
              <FieldText
                required
                isAlphaNumeric
                label='Nama'
                name='eventName'
                value={eventName}
                onChange={valueSetter('eventName')}
                errorMessage={
                  errors.find((item) => item.key === 'eventName')?.message
                }
              />
              <FieldGroup classNames={{ w2: 'px-0 pt-0' }}>
                <div className='flex space-x-4'>
                  <FieldText
                    required
                    label='Mulai'
                    name='timeStart'
                    type='time'
                    errorMessage={errors.some((item) => item.key === 'time')}
                    value={timeStart}
                    onChange={valueSetter('timeStart')}
                  />
                  <FieldText
                    required
                    label='Selesai'
                    name='timeEnd'
                    value={timeEnd}
                    type='time'
                    errorMessage={errors.some((item) => item.key === 'time')}
                    onChange={valueSetter('timeEnd')}
                  />
                </div>
                {errors.some((item) => item.key === 'time') && (
                  <p className='!mt-0 px-3 pt-2 text-xs tracking-wide text-red-500'>
                    {errors.find((item) => item.key === 'time')?.message}
                  </p>
                )}
                <div className='flex space-x-4'>
                  {LOCAL_TIME.map((item, index) => (
                    <label
                      htmlFor={`localTimeCode-${index}`}
                      key={index}
                      className='flex w-1/3 flex-col space-y-2 rounded-md border p-3 dark:border-zinc-700'
                    >
                      <input
                        required
                        id={`localTimeCode-${index}`}
                        name={`localTimeCode-${index}`}
                        type='radio'
                        checked={localTime === item}
                        value={item.toUpperCase()}
                        onChange={valueSetter('localTime')}
                      />
                      <span className='text-center text-sm uppercase'>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </FieldGroup>
            </FieldGroup>
          </BottomSheet>
        )}
      </p>
      {children}
    </div>
  )
}

export type { EventTimeErrorRef }

export default EventTime

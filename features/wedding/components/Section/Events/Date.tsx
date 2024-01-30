'use client'

import type { MutableRefObject } from 'react'
import type { Wedding, WeddingEventAddress } from '@wedding/schema'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ZodError, z } from 'zod'
import { PiWarningCircleFill } from 'react-icons/pi'
import { FaChevronRight } from 'react-icons/fa6'
import { weddingEventAddressType } from '@wedding/schema'
import { updateWeddingEventDateQuery } from '@wedding/query'
import { FontFamilyWedding } from '@wedding/config'
import { djs, tw } from '@/tools/lib'
import { useIsEditorOrDev, useUtilities } from '@/tools/hook'
import { exact, isObjectEqual, keys, omit, placeName } from '@/tools/helper'
import { AppConfig, Queries } from '@/tools/config'
import dynamic from 'next/dynamic'
import Text from '@wedding/components/Text'
import Notify from '@/components/Notification/Notify'
import Spinner from '@/components/Loading/Spinner'
import FieldTextArea from '@/components/Field/TextArea'
import FieldText from '@/components/Field/Text'
import FieldGroup from '@/components/Field/Group'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

type FieldError = {
  key: keyof Omit<EventDateProps, 'isActive' | 'id' | 'previousError'>
  message: string
}

type EventDateErrorRef = Partial<
  WeddingEventAddress & { date: string; id: number }
>[]

type EventDateProps = WeddingEventAddress & {
  id: number
  date: string
  isActive: boolean
  previousError: MutableRefObject<EventDateErrorRef>
}

const EventDate: RF<EventDateProps> = ({
  id,
  isActive,
  previousError,
  ...address
}) => {
  const { abort, cancelDebounce, debounce, getSignal } = useUtilities()
  const [open, onOpenChange] = useState(false)
  const [publicDetail, setPublicDetail] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [getAddress, setAddress] = useState(address)
  const [getErrors, setErrors] = useState<FieldError[]>([])
  const hasError = !!previousError.current.find((item) => item.id === id)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const isIndonesian = getAddress.country.toLowerCase().includes('indonesia')
  const isEditor = useIsEditorOrDev()
  const isPublic = !!useParams().name
  const isEnabledDetail = isPublic && isActive
  const countryBasedKey = isIndonesian
    ? ({ province: getAddress.province } as const)
    : ({ country: getAddress.country } as const)

  const formatAddress = keys({
    placeName: getAddress.placeName,
    district: getAddress.district,
    ...countryBasedKey,
  })

  const t = useTranslations()
  const query = useQueryClient()
  const detail = exact(query.getQueryData<Wedding>(Queries.weddingDetail))
  const dateOrNow = djs(getAddress.date || djs())
  const dateValue = djs(getAddress.date).isValid()
    ? djs(getAddress.date).format(AppConfig.Wedding.DateFormat)
    : ''

  const isOptionalEvent = !!detail.events.findIndex((event) => event.id === id)
  const displayAddress = formatAddress.map((itm, i) => {
    const divider = AppConfig.Wedding.NewlineSymbol
    const value = getAddress[itm].replace(divider, '\n').trim()
    const isNewLine = getAddress[itm].includes(divider)
    const isShowCaret = i === formatAddress.length - 1
    const groupedPlace = getAddress[itm].split(divider)

    return (
      <Text
        key={i}
        family={FontFamilyWedding.cinzel}
        className={tw(
          'whitespace-pre-line text-[min(34px,max(24px,7.692307692307693vw))]',
          {
            'line-clamp-3': itm === 'placeName' && !isNewLine,
            'line-clamp-2': itm === 'placeName' && isNewLine,
            'relative inline-flex max-w-full': i > 0,
          }
        )}
      >
        {i > 0 ? (
          <>
            <span className='block truncate'>
              {[value, itm !== 'province' ? ',' : '.'].join('')}
            </span>
            {isShowCaret && (
              <span className='mt-[0.4em] block text-[0.5em] text-zinc-400'>
                <FaChevronRight />
              </span>
            )}
          </>
        ) : isNewLine ? (
          groupedPlace.map((str, idx) => (
            <span key={idx} className={tw('block', idx > 0 && 'truncate')}>
              {idx === 0 ? (str + '\n').trim() : str.trim()}
            </span>
          ))
        ) : (
          value
        )}
      </Text>
    )
  })

  const wid = useParams().wid as string
  const [previousLength, setPreviousLength] = useState(detail.events.length)
  const { mutate: updateDate, isLoading } = useMutation<
    WeddingEventAddress & { date: string },
    unknown,
    Partial<WeddingEventAddress & { date: string }>
  >({
    mutationFn: (payload) => {
      const signal = getSignal()
      const updatedEvents = detail.events.map((event) => {
        if (event.id !== id) {
          return event
        }

        return { ...event, ...payload }
      })

      return updateWeddingEventDateQuery({
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

  function errorMessage<T extends keyof typeof getAddress>(key: T) {
    return getErrors.find((item) => item.key === key)?.message
  }

  function setterValue<T extends keyof typeof getAddress>(key: T) {
    return (value: string) => {
      let errors = getErrors.map((code) => code.key)

      try {
        if (key === 'date' && Boolean(value)) {
          value = djs(value).toISOString()
        }

        const parser = weddingEventAddressType.merge(
          z.object({
            mapUrl: z
              .string()
              .refine(
                (data) =>
                  data.length === 0 ||
                  (z.string().url().safeParse(data).success &&
                    !data.match(/ |\s+/g) &&
                    !(
                      data.includes('maps.app.goo.gl') ||
                      !data.includes('google.com/maps/embed')
                    )),
                {
                  message: t('error.field.invalidEmbed'),
                }
              ),
            date: z
              .string()
              .datetime()
              .refine(
                (data) => {
                  const timePicked = djs(data)
                  const next3Month = djs().add(
                    AppConfig.Wedding.MaxMonthRange,
                    'month'
                  )

                  return !(
                    timePicked.isBefore(djs()) || timePicked.isAfter(next3Month)
                  )
                },
                {
                  message: t('error.field.invalidDate', {
                    maxMonth: AppConfig.Wedding.MaxMonthRange,
                  }),
                }
              ),
          })
        )

        value = parser.pick({ [key]: true }).parse({ [key]: value })?.[key] ?? '' // prettier-ignore
        errors = errors.filter((code) => code !== key)
        setErrors((prev) => prev.filter((item) => item.key !== key))
      } catch (e) {
        if (e instanceof ZodError) {
          const { fieldErrors } = e.flatten()
          const getValue = fieldErrors[key]

          if (getValue) {
            const [message] = getValue

            errors = [...errors.filter((code) => code !== key), key]
            setErrors((prev) => [
              ...prev.filter((item) => item.key !== key),
              { key, message },
            ])
          }
        }
      }

      abort()
      cancelDebounce()
      setAddress((prev) => ({ ...prev, [key]: value }))

      const previous = omit(address, ...errors)
      const payload = omit(
        { ...getAddress, [key]: value.trim().replace(/\s+/g, ' ') },
        ...errors
      ) as Partial<typeof getAddress>

      if (isObjectEqual(payload, previous, { dateComparedBy: 'date' })) {
        return (previousError.current = previousError.current.filter(
          (item) => item.id !== id
        ))
      }

      // Mutate here
      debounce(() => updateDate(payload))
    }
  }

  useEffect(() => {
    const anyDeletedEvent = detail.events.length !== previousLength

    if (anyDeletedEvent) {
      let incoming = {
        placeName: address.placeName,
        district: address.district,
        province: address.province,
        country: address.country,
        detail: address.detail,
        mapUrl: address.mapUrl,
        date: address.date,
        opensTo: address.opensTo,
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

      setAddress(incoming)
      setPreviousLength(detail.events.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.events, previousLength, address, id])

  return (
    <div className='relative mx-6 mt-[min(108px,max(79px,24.615384615384615vw))] flex'>
      <div className='flex w-[34.558823529411765%] flex-col text-right text-[min(97px,max(71px,22.051282051282051vw))] font-black'>
        {[
          dateOrNow.format('DD'),
          dateOrNow.format('MM'),
          dateOrNow.format('YY'),
        ].map((itm, key) => (
          <Text
            key={key}
            className={tw('!leading-[.9]', { 'opacity-50': key === 2 })}
            family={FontFamilyWedding.cinzel}
          >
            {itm}
          </Text>
        ))}
      </div>
      <div className='relative ml-auto flex w-[calc(100%_-_24px_-_34.558823529411765%)] items-end'>
        <div
          onClick={() => isMounted && isEnabledDetail && setPublicDetail(true)}
          tabIndex={isEnabledDetail ? 0 : -1}
          className={tw(
            'flex w-full cursor-pointer flex-col text-left',
            publicDetail && 'underline outline-none',
            isEnabledDetail && 'z-[1]',
            publicDetail && 'underline'
          )}
        >
          {displayAddress}
        </div>
        <BottomSheet
          onLoad={() => setIsMounted(true)}
          header={{ title: 'Detil alamat', useBorder: true }}
          footer={{ useClose: true }}
          option={{ useOverlay: true }}
          content={{ className: tw('min-h-[50%]') }}
          root={{ open: publicDetail, onOpenChange: setPublicDetail }}
        >
          <div className='space-y-4 whitespace-pre-line px-6 pt-6'>
            <p>
              {[
                placeName(getAddress.placeName),
                getAddress.district,
                getAddress.province,
              ].join(', ')}
              .
            </p>
            <hr className='border-zinc-300 dark:border-zinc-700' />
            <p>{getAddress.detail}</p>
          </div>
        </BottomSheet>
      </div>
      {isEditor && isActive && (
        <BottomSheet
          header={{
            title: 'Edit acara',
            useBorder: hasError,
            append: (
              <>
                {isLoading && <Spinner />}
                {hasError && !isLoading && (
                  <button
                    className='relative text-blue-600 dark:text-blue-400'
                    onClick={() => updateDate(getAddress)}
                  >
                    Simpan
                  </button>
                )}
              </>
            ),
          }}
          option={{ useOverlay: true }}
          root={{ open, onOpenChange }}
          trigger={{
            asChild: true,
            children: (
              <button
                ref={buttonRef}
                onClick={() => onOpenChange(true)}
                aria-label='Edit date & address'
                className={tw(
                  'absolute -bottom-2 -left-2 -right-2 -top-2 rounded-2xl outline-offset-4',
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
          <FieldGroup title='Waktu/lokasi'>
            <FieldText
              label='Tanggal'
              name='date'
              type='date'
              value={dateValue}
              onChange={(e) => setterValue('date')(e.target.value)}
              errorMessage={errorMessage('date')}
              min={djs().add(1, 'day').format(AppConfig.Wedding.DateFormat)}
              max={djs()
                .add(AppConfig.Wedding.MaxMonthRange, 'month')
                .format(AppConfig.Wedding.DateFormat)}
            />
            <FieldText
              isSpecialChars
              label='Gmaps'
              name='mapUrl'
              value={getAddress.mapUrl || ''}
              onChange={(e) => setterValue('mapUrl')(e.target.value)}
              errorMessage={errorMessage('mapUrl')}
              onPaste={(e) => {
                const iframeRaw = e.clipboardData.getData('text/plain')

                if (e.clipboardData) {
                  const iframeSrc = iframeRaw.match(/src=["']([^"']*)["']/g)

                  if (iframeSrc) {
                    setterValue('mapUrl')(iframeSrc[0].replace(/src=|"/g, ''))
                    e.currentTarget.blur()
                  }
                }
              }}
              infoMessage={
                <>
                  Embed url untuk Google maps.{' '}
                  <a
                    href='#'
                    className='text-blue-600 dark:text-blue-400'
                    onClick={(e) => e.preventDefault()}
                  >
                    Mendapatkan embed url
                  </a>
                </>
              }
            />
          </FieldGroup>
          <FieldGroup title='Alamat/detil' classNames={{ root: 'mt-6' }}>
            <FieldText
              isAlphaNumeric
              label='Tempat'
              name='placeName'
              value={getAddress.placeName}
              onChange={(e) => setterValue('placeName')(e.target.value)}
              errorMessage={errorMessage('placeName')}
              // infoMessage='Placing double dash "--" will create a new line.'
              infoMessage='Menulis dua dash "--" akan membuat baris baru.'
            />
            <FieldText
              isAlphaNumeric
              label='Kab/Kec'
              name='district'
              value={getAddress.district}
              onChange={(e) => setterValue('district')(e.target.value)}
              errorMessage={errorMessage('district')}
            />
            <FieldText
              isAlphaNumeric
              label='Provinsi'
              name='province'
              value={getAddress.province}
              onChange={(e) => setterValue('province')(e.target.value)}
              errorMessage={errorMessage('province')}
            />
            <FieldTextArea
              label='Detail'
              name='detail'
              value={getAddress.detail}
              onChange={(e) => setterValue('detail')(e.target.value)}
              errorMessage={errorMessage('detail')}
              // infoMessage="Additional information like street name, home number, etc, This field also used for your guest that can't open the maps."
              infoMessage='Informasi tambahan seperti nama jalan, nomor rumah, dll. Kolom ini juga digunakan tamu Anda yang tidak dapat membuka maps.'
            />
          </FieldGroup>
          {isOptionalEvent && (
            <FieldGroup title='Advanced' classNames={{ root: 'mt-6' }}>
              <FieldText
                isAlphaNumeric
                label='Grup'
                name='opensTo'
                infoMessage={
                  <>
                    {/* Only show to a group of guests that contains the group name.
                    Separated by a commas.{' '} */}
                    Hanya tampil ke grup tamu yang mengandung nama grup diatas.
                    Dipisahkan oleh koma.{' '}
                    <a
                      href='#'
                      className='text-blue-600 dark:text-blue-400'
                      onClick={(e) => e.preventDefault()}
                    >
                      Learn more
                    </a>
                  </>
                }
                value={getAddress.opensTo}
                onChange={(e) => setterValue('opensTo')(e.target.value)}
                errorMessage={errorMessage('opensTo')}
              />
            </FieldGroup>
          )}
        </BottomSheet>
      )}
    </div>
  )
}

export type { EventDateErrorRef }

export default EventDate

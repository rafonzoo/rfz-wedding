'use client'

import type { MouseEvent, ReactNode } from 'react'
import type { Guest, Wedding } from '@wedding/schema'
import { useRef, useState } from 'react'
import { useQueryClient } from 'react-query'
import { IoCopyOutline, IoLogoInstagram, IoLogoWhatsapp } from 'react-icons/io5'
import { HiMiniMinusCircle } from 'react-icons/hi2'
import { GoShare } from 'react-icons/go'
import { djs, tw } from '@/tools/lib'
import { useUtilities } from '@/tools/hook'
import { abspath, exact, guestAlias, qstring } from '@/tools/helper'
import { Queries, Route } from '@/tools/config'
import { LocaleLink } from '@/locale/config'
import * as clipboard from 'clipboard-polyfill'
import dynamic from 'next/dynamic'

type SheetGuestShareProps = Guest & {
  editedGuestId: number
  isModeEdit: boolean
  isSynced: boolean
  previousGuest: Guest[]
  onClick?: (id: number) => void
}

const SheetGuestShareTemplateID: RF<{
  name: ReactNode
  bride: ReactNode
  groom: ReactNode
  date: ReactNode
  link: ReactNode
}> = ({ name, bride, groom, date, link }) => {
  return (
    <>
      Assalamualaikum Wr Wb.{'\n'}
      Salam Sejahtera.{'\n\n'}
      Tanpa mengurangi rasa hormat, perkenankan kami mengundang {name} untuk
      menghadiri acara pernikahan kami {bride} dan {groom} pada hari {date}
      {'\n\n'}
      Untuk informasi lebih lengkap, berikut link undangan kami {link}
      {'\n\n'}
      Merupakan suatu kebahagiaan bagi kami apabila Bpk/Ibu/Saudara/i berkenan
      untuk hadir dan memberikan doa restu kepada kami.
      {'\n\n'}
      Terima kasih.{'\n'}Wassalamualaikum Wr Wb.
    </>
  )
}

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const SheetGuestShare: RF<SheetGuestShareProps> = ({
  editedGuestId,
  isModeEdit,
  isSynced,
  previousGuest,
  onClick,
  ...guest
}) => {
  const [showActionSheet, setShowActionSheet] = useState(false)
  const { debounce, cancelDebounce } = useUtilities()
  const { debounce: debounceIg, cancelDebounce: cancelIg } = useUtilities()
  const { id, slug, name, token } = guest
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null)
  const templateRef = useRef<HTMLDivElement | null>(null)

  // prettier-ignore
  const isRemainSame = (
    previousGuest.find((guest) => guest.id === id)?.slug === slug
  )

  const isShareShow = !isModeEdit && editedGuestId === id && isRemainSame
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const [couple1, couple2] = detail.couple.map(({ fullName }) => fullName)
  const groupName = guest.group
  const events = !groupName
    ? detail.events.filter((e, i) => i === 0)
    : detail.events.filter((event) => {
        const lowerGroup = groupName.toLowerCase()
        const eventGroup = event.opensTo
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .find((item) => lowerGroup.includes(item))

        return !event.opensTo || (eventGroup && lowerGroup.includes(eventGroup))
      })

  const url = qstring(
    {
      to: guest.slug,
      cid: guest.token,
    },
    abspath(`/${detail.name}`)
  )

  const isEditable = guest.id > 1
  const shareActions = [
    {
      id: 'copy' as const,
      label: 'Salin Tautan',
      icon: <IoCopyOutline />,
    },
    {
      id: 'instagram' as const,
      label: 'Salin Instagram',
      icon: <IoLogoInstagram />,
    },
    {
      id: 'whatsapp' as const,
      label: 'Buka WhatsApp',
      icon: <IoLogoWhatsapp />,
    },
  ]

  function formatDate(date: string, eventName: string) {
    return `${djs(date).tz().format('dddd, DD MMMM YYYY')} \\(${eventName}\\)`
  }

  function rawText(symbol = '', encode = false) {
    if (!templateRef.current?.textContent) {
      return ''
    }

    const text = templateRef.current.textContent
    let raw = text.replace(
      new RegExp(
        `(${name}|${couple1}|${couple2}|${events.map((ev) => formatDate(ev.date, ev.eventName)).join('|')})`,
        'gm'
      ),
      `${[symbol, symbol].join('$1')}`
    )

    raw = raw.replace(new RegExp(`\\*${name}\\*&`, 'g'), `${name}&`)
    return encode ? encodeURIComponent(raw) : raw
  }

  function onClickShare(
    id: (typeof shareActions)[number]['id'],
    label: string
  ) {
    return (e: MouseEvent<HTMLButtonElement>) => {
      const target = e.currentTarget

      // prettier-ignore
      const labelEl = (
        target.parentElement?.nextElementSibling
      )

      if (id === 'whatsapp') {
        return window.open(`//api.whatsapp.com/send?text=${rawText('*', true)}`)
      }

      id === 'instagram' ? cancelIg() : cancelDebounce()
      clipboard.writeText(rawText('*')).then(() => {
        if (!labelEl) return

        labelEl.textContent = 'Disalin'
        id === 'instagram'
          ? debounceIg(() => (labelEl.textContent = label))
          : debounce(() => (labelEl.textContent = label))
      })
    }
  }

  return (
    <li
      key={id}
      className={tw(
        'relative overflow-hidden border-zinc-300 pl-6 pr-11 [.dark_&]:border-zinc-700',
        editedGuestId === id && 'bg-zinc-100'
      )}
    >
      <div className='relative translate-z-0'>
        <div
          className={tw(
            'flex min-h-11 w-full items-center overflow-hidden py-2 transition-transform duration-300',
            !isEditable && '-translate-x-0',
            !isModeEdit && isEditable && '-translate-x-11',
            isModeEdit && isEditable && '-translate-x-6'
          )}
        >
          {isEditable && (
            <button
              aria-label='Remove guest'
              tabIndex={isModeEdit ? 0 : -1}
              className={tw(
                'flex h-full min-w-11 items-center justify-center text-2xl text-red-500 transition-opacity translate-z-0',
                !isModeEdit && 'pointer-events-none opacity-0'
              )}
              onClick={() => {
                if (!isModeEdit) return

                queryClient.setQueryData<Guest[] | undefined>(
                  Queries.weddingGuests,
                  (prev) =>
                    !prev ? prev : prev.filter((item) => item.id !== id)
                )
              }}
            >
              <HiMiniMinusCircle />
            </button>
          )}
          <p
            className={tw('w-full translate-z-0', !isEditable && 'opacity-40')}
          >
            {guestAlias(slug)}
          </p>
        </div>
      </div>
      {isEditable && (
        <div
          className={tw(
            'absolute bottom-0 left-0 right-0 top-0 flex',
            isModeEdit && '-z-[1]'
          )}
        >
          <button
            aria-label='Select guest'
            tabIndex={isModeEdit ? -1 : 0}
            className='flex-grow'
            onClick={() => onClick?.(id)}
          />

          <BottomSheet
            root={{
              open: showActionSheet,
              onOpenChange: setShowActionSheet,
            }}
            option={{
              useOverlay: true,
              isTransparent: true,
              triggerRef: cancelButtonRef,
            }}
            wrapper={{ className: tw('h-full') }}
            footer={{
              wrapper: {
                className: tw('!p-2'),
              },
              append: (
                <button
                  ref={cancelButtonRef}
                  className='flex h-14 w-full items-center justify-center rounded-xl bg-zinc-300 px-3 text-center font-semibold -tracking-base [.dark_&]:bg-zinc-700'
                  onClick={() => setShowActionSheet(false)}
                >
                  Batal
                </button>
              ),
            }}
            trigger={
              isShareShow
                ? {
                    'aria-label': 'Share',
                    className: tw(
                      'h-full z-[2] min-w-[44px] font-semibold text-blue-500 text-xl flex justify-center items-center'
                    ),
                    children: (
                      <span className='-translate-x-1'>
                        <GoShare />
                      </span>
                    ),
                  }
                : void 0
            }
          >
            <div className='mx-2 flex h-full flex-col justify-end space-y-3'>
              <div className='flex max-h-full w-full flex-col rounded-2xl bg-white [.dark_&]:bg-zinc-800'>
                <p className='flex items-center justify-center px-2 py-3 font-semibold'>
                  Bagikan
                </p>
                <hr className='border-zinc-300 [.dark_&]:border-zinc-700' />
                <div className='p-3'>
                  <p className='flex space-x-1 text-sm tracking-normal'>
                    <span className='text-zinc-500 [.dark_&]:text-zinc-400'>
                      ke:
                    </span>
                    <span>{name}</span>
                  </p>
                </div>
                <hr className='border-zinc-300 [.dark_&]:border-zinc-700' />
                <div className='h-full overflow-auto overflow-touch'>
                  <div
                    ref={templateRef}
                    className='min-h-[320px] whitespace-pre-line p-3 text-sm'
                  >
                    <SheetGuestShareTemplateID
                      name={<b className='font-semibold'>{name}</b>}
                      bride={<b className='font-semibold'>{couple1}</b>}
                      groom={<b className='font-semibold'>{couple2}</b>}
                      date={events.map((ev, index, arr) => (
                        <span key={index}>
                          <span>
                            {arr.length === 1
                              ? ''
                              : arr.length === 2
                                ? index > 0 && ' dan '
                                : index === arr.length - 1
                                  ? ', dan '
                                  : index === 0
                                    ? ''
                                    : ', '}
                          </span>
                          <b key={index}>
                            {formatDate(ev.date, ev.eventName).replace(
                              /\\/g,
                              ''
                            )}
                          </b>
                        </span>
                      ))}
                      link={
                        <LocaleLink
                          target='_blank'
                          className='text-blue-600 [.dark_&]:text-blue-400'
                          href={{
                            pathname: Route.weddingPublic,
                            params: { name: detail.name },
                            search: qstring({ to: slug, cid: token }),
                          }}
                        >
                          {url}
                        </LocaleLink>
                      }
                    />
                  </div>
                </div>
                <hr className='border-zinc-300 [.dark_&]:border-zinc-700' />
                <div className='mx-4 mb-3 mt-4'>
                  <ul className='flex w-full flex-nowrap space-x-4 overflow-x-auto p-px overflow-touch'>
                    {shareActions.map(({ id, label, icon }, index) => (
                      <li
                        key={index}
                        className='relative flex w-[64px] flex-col justify-start space-y-1.5'
                      >
                        <div className='relative h-[64px] w-full pt-[100%]'>
                          <button
                            className='absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center rounded-2xl bg-zinc-100 text-2xl text-blue-500 [.dark_&]:bg-zinc-700'
                            aria-label='Share'
                            onClick={onClickShare(id, label)}
                          >
                            {icon}
                          </button>
                        </div>
                        <p className='whitespace-pre-line text-center text-[11px] leading-[.85rem] tracking-base'>
                          {label}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </BottomSheet>
        </div>
      )}
    </li>
  )
}

export default SheetGuestShare

'use client'

import type { Wedding, WeddingLoadout } from '@wedding/schema'
import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { MdModeEdit } from 'react-icons/md'
import { GoMoon, GoSun } from 'react-icons/go'
import { colorType } from '@wedding/schema'
import { updateWeddingLoadoutQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import {
  useIsEditorOrDev,
  useOutlinedClasses,
  useUtilities,
} from '@/tools/hook'
import {
  assets,
  debounceOnOlderDevice,
  exact,
  keys,
  swatches,
} from '@/tools/helper'
import { Queries } from '@/tools/config'
import { useTranslations } from 'use-intl'
import dynamic from 'next/dynamic'
import Toast from '@/components/Notification/Toast'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

type SheetLoadoutPayload = WeddingLoadout & {
  wid: string
}

const SheetLoadout: RF = () => {
  const [openSheet, setOpenSheet] = useState(false)
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const [{ theme, foreground, background }, setLoadout] = useState(
    detail.loadout
  )

  const ulRef = useRef<HTMLUListElement | null>(null)
  const isEditor = useIsEditorOrDev()
  const outlined = useOutlinedClasses()
  const myWedding = queryClient.getQueryData<Wedding[]>(Queries.weddingGetAll)
  const [prevDetail, setPrevDetail] = useState(detail)
  const [previousList, setPreviousList] = useState(myWedding)
  const { abort, getSignal } = useUtilities()
  const wid = useParams().wid as string
  const toast = new Toast()
  const focusRef = useRef<HTMLButtonElement | null>(null)
  const t = useTranslations()
  const updateLoadout = useMutation<
    WeddingLoadout,
    unknown,
    SheetLoadoutPayload
  >({
    mutationFn: ({ wid, ...payload }) => {
      const signal = getSignal()

      return updateWeddingLoadoutQuery({
        wid,
        signal,
        loadout: { ...payload },
      })
    },
    onSuccess: (loadout) => {
      setPrevDetail((prev) => ({ ...prev, loadout }))
      setPreviousList((prev) =>
        !prev
          ? prev
          : [
              ...prev.map((item) =>
                prevDetail.wid === item.wid ? { ...item, loadout } : item
              ),
            ]
      )
    },
    onError: (e) => {
      if ((e as Error).message.includes('AbortError')) {
        return
      }

      toast.error(t('error.general.failedToSave'))

      if (previousList) {
        queryClient.setQueryData<Wedding[] | undefined>(
          Queries.weddingGetAll,
          previousList
        )
      }

      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, loadout: prevDetail.loadout })
      )

      setLoadout(prevDetail.loadout)
    },
  })

  const suffix =
    background === 'black'
      ? `dark-${foreground}.png`
      : `light-${foreground}.png`

  function onClickSubmit(payload: Partial<WeddingLoadout>) {
    return () => {
      setLoadout((prev) => ({ ...prev, ...payload }))
    }
  }

  function onSaving() {
    setOpenSheet(false)

    const payload = { theme, background, foreground }
    const previous = exact(
      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) => {
          return !prev
            ? prev
            : { ...prev, loadout: { ...prev.loadout, ...payload } }
        }
      )
    )

    queryClient.setQueryData<Wedding[] | undefined>(
      Queries.weddingGetAll,
      (prev) => {
        return !prev
          ? prev
          : [
              ...prev.map((item) =>
                item.wid === previous.wid
                  ? { ...item, loadout: { ...item.loadout, ...payload } }
                  : item
              ),
            ]
      }
    )

    updateLoadout.isLoading && abort()
    updateLoadout.mutate({
      wid,
      ...payload,
    })
  }

  // prettier-ignore
  const prepend = (
    <button
      ref={focusRef}
      className='text-2xl text-zinc-500 [.dark_&]:text-zinc-400 rounded-full'
      onClick={onClickSubmit({
        background: background === 'black' ? 'white' : 'black',
      })}
    >
      {background === 'black' ? <GoSun /> : <GoMoon />}
    </button>
  )

  const append = (theme !== detail.loadout.theme ||
    foreground !== detail.loadout.foreground ||
    background !== detail.loadout.background) && (
    <button onClick={onSaving}>OK</button>
  )

  if (!isEditor) {
    return null
  }

  return (
    <div className='absolute right-0 top-0 z-[1] flex h-full w-full justify-end'>
      <BottomSheet
        root={{ open: openSheet, onOpenChange: setOpenSheet }}
        header={{ append, prepend, title: 'Tampilan' }}
        option={{ useOverlay: true }}
        trigger={{
          'aria-label': 'Ubah tampilan',
          children: <MdModeEdit />,
          className: tw(
            'flex h-10 w-10 mt-6 mr-6 border-2 border-white items-center justify-center rounded-full bg-blue-600 text-xl text-white'
          ),
        }}
        content={{
          onCloseAutoFocus: () => {
            setLoadout({
              theme: detail.loadout.theme,
              background: detail.loadout.background,
              foreground: detail.loadout.foreground,
            })
          },
          onOpenAutoFocus: () => {
            function goCenter() {
              const button = ulRef.current?.querySelector<HTMLElement>(
                'button[data-active=true]'
              )

              button?.scrollIntoView({ inline: 'center' })
              button?.focus()
            }

            debounceOnOlderDevice(goCenter)
          },
        }}
      >
        <div className='px-6'>
          <div className='rounded-lg bg-zinc-100 p-5 [.dark_&]:bg-zinc-700'>
            <div className='relative mx-auto w-full pt-[64.23841059602649%]'>
              <img
                className='absolute left-0 top-0 w-full'
                alt='Tampilan tema'
                src={assets(`/${theme}/figure/tr:w-0.3334,q-75/${suffix}`)}
                srcSet={[
                  assets(`/${theme}/figure/tr:w-0.3334,q-75/${suffix}`),
                  assets(`/${theme}/figure/tr:w-0.6667,q-75/${suffix} 2x`),
                  assets(`/${theme}/figure/tr:q-75/${suffix} 3x`),
                ].join(', ')}
              />
            </div>
          </div>
        </div>
        <div className='pb-8'>
          <div className='h-px w-full bg-zinc-200 [.dark_&]:bg-zinc-700' />
          <ul ref={ulRef} className='mt-4 flex space-x-4 overflow-x-auto p-2'>
            {keys(colorType.Enum).map((color, index) => (
              <li
                key={color}
                className={tw({
                  'pl-4': !index,
                  'pr-4': index === keys(colorType.Enum).length - 1,
                })}
              >
                <button
                  onClick={onClickSubmit({ foreground: color })}
                  data-active={foreground === color}
                  className={tw(
                    [swatches(color), 'h-8 w-8 rounded-full'].join(' '),
                    outlined(foreground === color, 'outline-offset-[3px]')
                  )}
                />
              </li>
            ))}
          </ul>
        </div>
      </BottomSheet>
    </div>
  )
}

export default SheetLoadout

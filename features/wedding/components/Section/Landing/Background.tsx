'use client'

import type { Wedding, WeddingGallery } from '@wedding/schema'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BsPlusLg } from 'react-icons/bs'
import { updateWeddingGalleryQuery } from '@wedding/query'
import { retina } from '@wedding/helpers'
import { QueryWedding, WeddingConfig } from '@wedding/config'
import { tw } from '@/tools/lib'
import {
  useIntersection,
  useIsEditor,
  useUtilities,
  useWeddingDetail,
} from '@/tools/hook'
import dynamic from 'next/dynamic'
import Toast from '@/components/Notification/Toast'

const SheetGallery = dynamic(
  () => import('@wedding/components/Sheet/Gallery'),
  {
    ssr: false,
    loading: () => (
      <p className='absolute bottom-0 left-0 right-0 top-0 z-[2]' />
    ),
  }
)

const SectionLandingBackground: RFZ = ({ children }) => {
  const isEditor = useIsEditor()
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()
  const index = WeddingConfig.ImageryStartIndex
  const imageRef = useRef(null)
  const { abort, getSignal, debounce } = useUtilities()
  const [open, onOpenChange] = useState(false)
  const [background, setBackground] = useState(
    detail.galleries.find((item) => item.index === index)
  )

  const [position, setPosition] = useState('')
  const isIntersecting = useIntersection(imageRef)
  const coordinates = (position || background?.coordinate)?.split(':')
  const coordinate = {
    x: coordinates?.[0] ?? '0',
    y: coordinates?.[1] ?? '0',
  }

  const router = useRouter()
  const toast = new Toast()
  const t = useTranslations()
  const backgroundUrl = !background?.fileName
    ? void 0
    : retina(background?.fileName, 'h', 'ar-3-4', 'fo-auto')
  const wid = useParams().wid as string
  const mutation = useMutation<
    WeddingGallery[],
    unknown,
    WeddingGallery[],
    WeddingGallery
  >({
    mutationFn: (galleries) => {
      const signal = getSignal()

      return updateWeddingGalleryQuery({
        wid,
        signal,
        galleries,
        errorText: t('error.general.failedToSave'),
      })
    },
    onMutate: () => {
      return queryClient
        .getQueryData<Wedding>(QueryWedding.weddingDetail)
        ?.galleries.find((item) => item.index === index)
    },
    onError: (e, p, previous) => {
      if ((e as Error).message.includes('AbortError')) {
        return
      }

      toast.error((e as Error)?.message)
      setBackground(previous)
    },
    onSuccess: (galleries) => {
      router.refresh()

      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, galleries })
      )

      queryClient.setQueryData<Wedding[] | undefined>(
        QueryWedding.weddingGetAll,
        (prev) => {
          return !prev
            ? [{ ...detail, galleries }]
            : prev.map((item) =>
                item.wid === wid ? { ...item, galleries } : item
              )
        }
      )
    },
  })

  function onItemSelected(file?: Omit<WeddingGallery, 'index'>) {
    setBackground(!file ? void 0 : { ...file, index })
    mutation.isLoading && abort()

    setPosition((prev) => (!file ? '' : prev))
    const payload = !file
      ? detail.galleries.filter((item) => item.index !== index)
      : [
          ...detail.galleries.filter((item) => item.index !== index),
          { ...file, index },
        ]

    debounce(() => mutation.mutate(payload))
  }

  function onValueCommit(coordinate: string) {
    const prevCoordinates = detail.galleries.find(
      (item) => item.index === index
    )?.coordinate

    const payload = detail.galleries.map((gallery) =>
      gallery.index === index ? { ...gallery, coordinate: coordinate } : gallery
    )

    if (prevCoordinates === coordinate) {
      return
    }

    mutation.isLoading && abort()
    debounce(() => mutation.mutate(payload))
  }

  useEffect(() => {
    setBackground(detail.galleries.find((item) => item.index === index))
  }, [detail.galleries, index])

  return (
    <div
      ref={imageRef}
      className='relative flex h-full flex-col justify-end text-white'
    >
      <figure className='absolute bottom-0 left-0 right-0 top-0 z-[1]'>
        {backgroundUrl && (
          <>
            <img
              className='absolute left-0 top-0 h-full w-full rounded-[inherit] object-cover object-center'
              style={{ objectPosition: `${coordinate.x}% ${coordinate.y}%` }}
              src={backgroundUrl.blur}
              alt={`photo-${background?.fileName}`}
            />
            {isIntersecting && (
              <img
                className='absolute left-0 top-0 h-full w-full rounded-[inherit] object-cover object-center'
                style={{ objectPosition: `${coordinate.x}% ${coordinate.y}%` }}
                src={backgroundUrl.src}
                srcSet={backgroundUrl.srcSet}
                alt={`photo-${background?.fileName}`}
              />
            )}
          </>
        )}
        <span className='pointer-events-none absolute bottom-0 left-0 z-[2] block h-3/4 w-full rounded-[inherit] bg-gradient-to-t from-zinc-900 to-transparent' />
      </figure>

      {isEditor && (
        <SheetGallery
          defaultSelectedId={background?.fileId}
          content={{ onCloseAutoFocus: (e) => e.preventDefault() }}
          onItemPicked={onItemSelected}
          coordinate={{
            defaultCoordinate: background?.coordinate,
            allowedAxis: ['x'],
            onValueCommit,
            onChangedCoordinate: setPosition,
          }}
          root={{ open, onOpenChange }}
          trigger={{
            'aria-label': 'Tambah / hapus foto',
            className: tw('absolute top-0 left-0 right-0 bottom-0 z-[2]'),
            children: isEditor && !backgroundUrl && (
              <span className='absolute left-1/2 top-1/2 -mt-[50%] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500'>
                <BsPlusLg />
              </span>
            ),
          }}
        />
      )}

      <div className='relative z-[3]'>{children}</div>
    </div>
  )
}

export default SectionLandingBackground

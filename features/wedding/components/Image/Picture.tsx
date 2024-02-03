'use client'

import type { Wedding, WeddingGallery } from '@wedding/schema'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BsPlusLg } from 'react-icons/bs'
import { updateWeddingGalleryQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import {
  useIntersection,
  useIsEditorOrDev,
  useOutlinedClasses,
  useUtilities,
} from '@/tools/hook'
import { exact, retina } from '@/tools/helper'
import { Queries } from '@/tools/config'
import dynamic from 'next/dynamic'
import Toast from '@/components/Notification/Toast'

const SheetGallery = dynamic(
  () => import('@wedding/components/Sheet/Gallery'),
  {
    ssr: false,
    loading: () => (
      <p className='absolute bottom-0 left-0 right-0 top-0 z-[4] rounded-2xl' />
    ),
  }
)

const FigureImage: RFZ<{
  index: number
  className?: string
  isCenter?: boolean
}> = ({ index, isCenter, className, children }) => {
  const isEditor = useIsEditorOrDev()
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const defaultCommentPhoto = detail.galleries.find(
    (item) => item.index === index
  )

  const [isOpen, setIsOpen] = useState(false)
  const [photo, setPhoto] = useState(defaultCommentPhoto)
  const { abort, getSignal, debounce } = useUtilities()
  const outlinedClasses = useOutlinedClasses()
  const imageRef = useRef(null)
  const photoUrl = !photo?.fileName
    ? void 0
    : retina(photo?.fileName, 'h', 'ar-3-4', 'fo-auto')

  const wid = useParams().wid as string
  const t = useTranslations()
  const toast = new Toast()
  const isIntersecting = useIntersection(imageRef, { threshold: 1 })
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
        .getQueryData<Wedding>(Queries.weddingDetail)
        ?.galleries.find((item) => item.index === index)
    },
    onError: (e, p, previous) => {
      if ((e as Error).message.includes('AbortError')) {
        return
      }

      toast.error((e as Error)?.message)
      setPhoto(previous)
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, galleries: data })
      )
    },
  })

  function onItemSelected(file?: Omit<WeddingGallery, 'index'>) {
    setPhoto(!file ? void 0 : { ...file, index })
    mutation.isLoading && abort()

    const payload = !file
      ? detail.galleries.filter((item) => item.index !== index)
      : [
          ...detail.galleries.filter((item) => item.index !== index),
          { ...file, index },
        ]

    debounce(() => mutation.mutate(payload))
  }

  useEffect(
    () => setPhoto(detail.galleries.find((item) => item.index === index)),
    [detail.galleries, index]
  )

  return (
    <figure
      ref={imageRef}
      className={tw(
        'shadow-[0_1px_0_1px_rgb(160_160_160)] dark:shadow-[0_1px_0_1px_rgb(80_80_80_/_50%)]', // prettier-ignore
        'relative block w-full rounded-2xl bg-zinc-800 pt-[133.333333333333333%]', // prettier-ignore
        className
      )}
    >
      {photoUrl && (
        <>
          <img
            className='absolute left-0 top-0 h-full w-full rounded-[inherit] object-cover object-center'
            src={photoUrl.blur}
            alt={`photo-${photo?.fileName}`}
          />
          {isIntersecting && (
            <img
              className='absolute left-0 top-0 h-full w-full rounded-[inherit] object-cover object-center'
              src={photoUrl.src}
              srcSet={photoUrl.srcSet}
              alt={`photo-${photo?.fileName}`}
            />
          )}
        </>
      )}
      {children}
      {isEditor && (
        <SheetGallery
          defaultSelectedId={photo?.fileId}
          onItemPicked={onItemSelected}
          root={{ open: isOpen, onOpenChange: setIsOpen }}
          trigger={{
            'aria-label': 'Choose photo',
            className: tw(
              'absolute rounded-2xl bottom-0 left-0 right-0 top-0 z-[4]',
              outlinedClasses(isOpen)
            ),
            children: isEditor && !photo && (
              <span
                className={tw(
                  'absolute left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full text-zinc-500',
                  isCenter && 'top-1/2 -translate-y-1/2',
                  !isCenter && 'top-1/2 -mt-[33.333%] -translate-y-1/2'
                )}
              >
                <BsPlusLg />
              </span>
            ),
          }}
        />
      )}
    </figure>
  )
}

export default FigureImage

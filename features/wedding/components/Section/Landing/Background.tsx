'use client'

import type { Wedding, WeddingGallery } from '@wedding/schema'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BsPlusLg } from 'react-icons/bs'
import { updateWeddingGalleryQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import { useIntersection, useIsEditorOrDev, useUtilities } from '@/tools/hook'
import { exact, retina } from '@/tools/helper'
import { AppConfig, Queries } from '@/tools/config'
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
  const isEditor = useIsEditorOrDev()
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const index = AppConfig.Wedding.ImageryStartIndex
  const imageRef = useRef(null)
  const { abort, getSignal, debounce } = useUtilities()
  const isIntersecting = useIntersection(imageRef)
  const [open, onOpenChange] = useState(false)
  const [background, setBackground] = useState(
    detail.galleries.find((item) => item.index === index)
  )

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
        errorText: t('error.photo.failedToSave'),
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
      setBackground(previous)
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, galleries: data })
      )
    },
  })

  function onItemSelected(file?: Omit<WeddingGallery, 'index'>) {
    setBackground(!file ? void 0 : { ...file, index })
    mutation.isLoading && abort()

    const payload = !file
      ? detail.galleries.filter((item) => item.index !== index)
      : [
          ...detail.galleries.filter((item) => item.index !== index),
          { ...file, index },
        ]

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
              src={backgroundUrl.blur}
              alt={`photo-${background?.fileName}`}
            />
            {isIntersecting && (
              <img
                className='absolute left-0 top-0 h-full w-full rounded-[inherit] object-cover object-center'
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
          root={{ open, onOpenChange }}
          trigger={{
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

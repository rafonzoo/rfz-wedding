'use client'

import type { Wedding, WeddingGallery } from '@wedding/schema'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { updateWeddingGalleryQuery } from '@wedding/query'
import { QueryWedding } from '@wedding/config'
import { useIsEditorOrDev, useUtilities, useWeddingDetail } from '@/tools/hook'
import dynamic from 'next/dynamic'
import TextTitle from '@wedding/components/Text/Title'
import GalleriesPhoto from '@wedding/components/Section/Galleries/Photo'
import Toast from '@/components/Notification/Toast'

const SheetGallery = dynamic(
  () => import('@wedding/components/Sheet/Gallery'),
  { ssr: false }
)

const SectionGalleries = () => {
  const [index, setIndex] = useState(-1)
  const isEditor = useIsEditorOrDev()
  const isOpen = index > -1
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()
  const [photos, setPhotos] = useState(detail.galleries)
  const [isSheetMounted, setIsSheetMounted] = useState(false)
  const photoRef = useRef<HTMLDivElement | null>(null)
  const { abort, getSignal, debounce } = useUtilities()
  const wid = useParams().wid as string
  const t = useTranslations()
  const toast = new Toast()
  const mutation = useMutation<
    WeddingGallery[],
    unknown,
    WeddingGallery[],
    WeddingGallery[]
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
      return (
        queryClient.getQueryData<Wedding>(QueryWedding.weddingDetail)
          ?.galleries ?? []
      )
    },
    onError: (e, p, previous) => {
      if ((e as Error).message.includes('AbortError')) {
        return
      }

      toast.error((e as Error)?.message)
      setPhotos(previous ?? [])
    },
    onSuccess: (galleries) => {
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, galleries })
      )
    },
  })

  function openPhotoByIndex(idx: number) {
    return () => {
      if (isEditor) {
        const dialog = document.querySelector<HTMLElement>('[role=dialog]')
        const isAnimating =
          dialog?.dataset?.isAnimating === 'true' ||
          dialog?.dataset.state === 'closed'

        if (!isAnimating) {
          index === idx ? setIndex(-1) : setIndex(idx)
        }
      }
    }
  }

  function getPhotoByIndex(index: number) {
    return photos.find(({ index: idx }) => idx === index)
  }

  function onItemSelected(file?: Omit<WeddingGallery, 'index'>) {
    setPhotos((prev) =>
      !file
        ? prev.filter((item) => item.index !== index)
        : [...prev.filter((item) => item.index !== index), { ...file, index }]
    )

    mutation.isLoading && abort()
    const payload = !file
      ? photos.filter((item) => item.index !== index)
      : [...photos.filter((item) => item.index !== index), { ...file, index }]

    debounce(() => mutation.mutate(payload))
  }

  useEffect(() => setPhotos(detail.galleries), [detail.galleries])

  return (
    <section className='min-h-screen bg-black pb-[24.615384615384615%] [.dark_&]:bg-zinc-950'>
      <TextTitle className='text-white'>The Galleries</TextTitle>
      <div className='mx-6 mt-6 flex flex-wrap space-y-4'>
        <GalleriesPhoto
          className='w-full pt-[75%]'
          currentIndex={index}
          index={0}
          photo={getPhotoByIndex(0)}
          onClick={openPhotoByIndex(0)}
          parentRef={photoRef}
          isLoaded={isSheetMounted}
        />
        <div className='flex w-full space-x-4'>
          <div className='flex w-[30.214424951267057%] flex-col space-y-4'>
            <GalleriesPhoto
              currentIndex={index}
              index={1}
              photo={getPhotoByIndex(1)}
              onClick={openPhotoByIndex(1)}
              parentRef={photoRef}
              isLoaded={isSheetMounted}
            />
            <GalleriesPhoto
              currentIndex={index}
              index={2}
              photo={getPhotoByIndex(2)}
              onClick={openPhotoByIndex(2)}
              parentRef={photoRef}
              isLoaded={isSheetMounted}
            />
            <GalleriesPhoto
              currentIndex={index}
              index={3}
              photo={getPhotoByIndex(3)}
              onClick={openPhotoByIndex(3)}
              parentRef={photoRef}
              isLoaded={isSheetMounted}
            />
          </div>
          <GalleriesPhoto
            className='h-full flex-grow pt-0'
            currentIndex={index}
            index={4}
            photo={getPhotoByIndex(4)}
            onClick={openPhotoByIndex(4)}
            parentRef={photoRef}
            isLoaded={isSheetMounted}
          />
        </div>
        <GalleriesPhoto
          currentIndex={index}
          index={5}
          photo={getPhotoByIndex(5)}
          onClick={openPhotoByIndex(5)}
          parentRef={photoRef}
          isLoaded={isSheetMounted}
        />
        <div className='flex w-full space-x-4'>
          <GalleriesPhoto
            className='flex-grow pt-0'
            currentIndex={index}
            index={6}
            photo={getPhotoByIndex(6)}
            onClick={openPhotoByIndex(6)}
            parentRef={photoRef}
            isLoaded={isSheetMounted}
          />
          <div className='flex w-[30.214424951267057%] flex-col justify-between space-y-4'>
            <GalleriesPhoto
              currentIndex={index}
              index={7}
              photo={getPhotoByIndex(7)}
              onClick={openPhotoByIndex(7)}
              parentRef={photoRef}
              isLoaded={isSheetMounted}
            />
            <GalleriesPhoto
              currentIndex={index}
              index={8}
              photo={getPhotoByIndex(8)}
              onClick={openPhotoByIndex(8)}
              parentRef={photoRef}
              isLoaded={isSheetMounted}
            />
          </div>
        </div>
        <GalleriesPhoto
          className='w-full pt-[56.125%]'
          currentIndex={index}
          index={9}
          photo={getPhotoByIndex(9)}
          onClick={openPhotoByIndex(9)}
          parentRef={photoRef}
          isLoaded={isSheetMounted}
        />
      </div>
      {isEditor && (
        <>
          {isOpen && (
            <button
              aria-hidden={isOpen ? false : true}
              aria-label='Close gallery'
              onClick={() => setIndex(-1)}
              className='fixed bottom-0 left-0 right-0 top-0 z-50'
            />
          )}
          <SheetGallery
            onLoad={() => setIsSheetMounted(true)}
            defaultSelectedId={getPhotoByIndex(index)?.fileId}
            onItemPicked={onItemSelected}
            header={{ title: 'Pilih foto' }}
            content={{ onInteractOutside: (e) => e.preventDefault() }}
            root={{
              modal: false,
              open: isOpen,
              onOpenChange: (isOpen) => (!isOpen ? setIndex(-1) : void 0),
            }}
          />
        </>
      )}
    </section>
  )
}

export default SectionGalleries

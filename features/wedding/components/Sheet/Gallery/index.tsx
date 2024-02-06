'use client'

import type { Wedding, WeddingGalleries, WeddingGallery } from '@wedding/schema'
import type { BottomSheetProps } from '@/components/BottomSheet'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { useLocale } from 'next-intl'
import { IoCloudUploadOutline } from 'react-icons/io5'
import { CgClose } from 'react-icons/cg'
import { weddingGalleriesType } from '@wedding/schema'
import { tw } from '@/tools/lib'
import { useMountedEffect, useOutlinedClasses } from '@/tools/hook'
import { blobToUri, exact, qstring, uploads } from '@/tools/helper'
import { AppConfig, Queries, RouteApi } from '@/tools/config'
import Compressor from 'compressorjs'
import dynamic from 'next/dynamic'
import Toast from '@/components/Notification/Toast'
import Spinner from '@/components/Loading/Spinner'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const MAX_FILE_SIZE = AppConfig.Wedding.MaxFileSize * 1000 // byte

const SUPPORTED_FORMAT = ['image/png', 'image/jpg', 'image/jpeg']

type SheetGalleryProps = BottomSheetProps & {
  defaultSelectedId?: string
  onItemPicked?: (file?: Omit<WeddingGallery, 'index'>) => void
}

type SheetGallerySignal = {
  id: string
  controller: AbortController
}

const SheetGallery: RFZ<SheetGalleryProps> = ({
  defaultSelectedId,
  onItemPicked,
  ...sheetProps
}) => {
  const [isModeSelect, setIsModeSelect] = useState(false)
  const [isCancelable, setIsCancelable] = useState(false)
  const [isOnUploads, setIsOnUploads] = useState(false)
  const [isOnRemoval, setIsOnRemoval] = useState(false)
  const [selectionId, setSelectionId] = useState<string[]>([])
  const [uploadNames, setUploadNames] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState(defaultSelectedId)
  const [errors, setErrors] = useState<string[]>([])

  const toast = new Toast()
  const controller = useRef<SheetGallerySignal[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()
  const { name: path, wid } = exact(
    queryClient.getQueryData<Wedding>(Queries.weddingDetail)
  )

  const locale = useLocale()
  const outlinedClasses = useOutlinedClasses()
  const isUploadDisabled = uploadNames.length > 0 || isOnRemoval || isModeSelect
  const galleries = useQuery({
    queryKey: Queries.weddingGalleries,
    queryFn: async ({ signal }) => {
      const response = await fetch(
        qstring({ path, locale }, RouteApi.uploads),
        {
          signal,
        }
      )

      const json = (await response.json()) as {
        data: unknown
        message?: string
      }

      if (response.ok) {
        return weddingGalleriesType.array().parse(json.data)
      }

      toast.error(json.message)
      throw new Error(json.message)
    },
  })

  function isProcessing(id: string, name: string) {
    return (
      uploadNames.includes(name) || (isOnRemoval && selectionId.includes(id))
    )
  }

  function abortByAction(nameOrId: string) {
    controller.current.find((item) => item.id === nameOrId)?.controller.abort()
  }

  function abortAll() {
    controller.current
      .filter((item) => !item.controller.signal.aborted)
      .forEach((item) => item.controller.abort())

    controller.current.length > 0 && (controller.current = [])
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.currentTarget
    const files = Array.from(target?.files ?? []).slice(
      0,
      AppConfig.Wedding.MaxFileItem - (galleries.data?.length ?? 0)
    )

    if (!files || !target || !target.files?.[0]) {
      return
    }

    setErrors([])
    files.forEach(async (file, index, array) => {
      if (!SUPPORTED_FORMAT.includes(file.type)) {
        return setErrors((prev) => [...prev, `Unsupported file: ${file.type}`])
      }

      if (file.size > MAX_FILE_SIZE) {
        return setErrors((prev) => [...prev, `File size limit: ${file.name}`])
      }

      if (
        galleries.data &&
        galleries.data.some((fl) => fl.name.includes(file.name))
      ) {
        return setErrors((prev) => [...prev, `Duplicate file: ${file.name}`])
      }

      const uri = URL.createObjectURL(file)
      const ac = { id: file.name, controller: new AbortController() }
      controller.current.push(ac)

      setIsOnUploads(true)
      setUploadNames((prev) => [...prev, file.name])
      queryClient.setQueryData<WeddingGalleries[] | undefined>(
        Queries.weddingGalleries,
        (prev) => {
          return !prev
            ? prev
            : [
                ...prev,
                {
                  thumbnail: uri,
                  name: file.name,
                  fileId: '',
                },
              ]
        }
      )

      const compressedFile = new Compressor(file, {
        quality: 0.2,
        success: async (blob) => {
          const image = await blobToUri(blob)

          try {
            const response = await fetch(
              qstring({ locale }, RouteApi.uploads),
              {
                method: 'POST',
                signal: ac.controller.signal,
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({
                  cancelable: true,
                  fileName: file.name,
                  file: image,
                  path,
                  wid,
                }),
              }
            )

            const json = (await response.json()) as {
              data: unknown
              message?: string
            }

            if (!response.ok) {
              toast.error(json.message)

              throw new Error(json.message)
            }

            const data = weddingGalleriesType.parse(json.data)

            queryClient.setQueryData<WeddingGalleries[] | undefined>(
              Queries.weddingGalleries,
              (prev) => {
                if (!prev) return prev

                const copy = prev.filter((item) => item.name !== data.name)
                const previousIndex = prev.findIndex(
                  (item) => item.name === data.name
                )

                if (previousIndex < 0) {
                  return prev
                }

                copy.splice(previousIndex, 0, data)
                return copy
              }
            )
          } catch (e) {
            queryClient.setQueryData<WeddingGalleries[] | undefined>(
              Queries.weddingGalleries,
              (prev) => prev?.filter((item) => item.name !== file.name)
            )
          } finally {
            controller.current = controller.current.filter(
              (item) => item.id !== file.name
            )

            URL.revokeObjectURL(uri)
            setUploadNames((prev) => prev.filter((name) => name !== file.name))

            if (index === array.length - 1) {
              setIsOnUploads(false)
            }
          }
        },
      })

      // const image = await blobToUri(file)

      if (ac.controller.signal.aborted) {
        ac.controller.abort()
        compressedFile.abort()
      }
    })

    target.value = ''
  }

  function onDelete(selectedIds: string[]) {
    setIsOnRemoval(true)

    selectedIds.forEach(async (id, i, array) => {
      const ac = { id, controller: new AbortController() }
      controller.current.push(ac)

      try {
        const response = await fetch(
          qstring({ id, wid, locale }, RouteApi.uploads),
          {
            method: 'DELETE',
            signal: ac.controller.signal,
          }
        )

        if (!response.ok) {
          const json = (await response.json()) as { message?: string }

          toast.error(json.message)
          throw new Error(json.message)
        }

        queryClient.setQueryData<WeddingGalleries[] | undefined>(
          Queries.weddingGalleries,
          (prev) => {
            return !prev ? prev : prev.filter((prev) => prev.fileId !== id)
          }
        )

        queryClient.setQueryData<Wedding | undefined>(
          Queries.weddingDetail,
          (prev) => {
            return !prev
              ? prev
              : {
                  ...prev,
                  galleries: prev.galleries.filter(
                    (item) => item.fileId !== id
                  ),
                }
          }
        )
      } catch (e) {
      } finally {
        controller.current = controller.current.filter((item) => item.id !== id)

        if (i === array.length - 1) {
          setSelectionId([])
          setIsOnRemoval(false)
        }
      }
    })

    setIsModeSelect(false)
  }

  function onSelect(fileId: string, fileName: string) {
    return () => {
      if (!isModeSelect) {
        const isRemoving = selectedId === fileId

        setSelectedId(isRemoving ? void 0 : fileId)
        onItemPicked?.(
          isRemoving
            ? void 0
            : {
                fileId,
                fileName: uploads(`/${path}/${fileName}`),
              }
        )

        return
      }

      setSelectionId((ids) =>
        ids.includes(fileId)
          ? ids.filter((id) => id !== fileId)
          : [...ids.filter((id) => id !== fileId), fileId]
      )
    }
  }

  useMountedEffect(() => {
    return () => abortAll()
  })

  useEffect(() => {
    if (!sheetProps.root?.open) {
      setIsModeSelect((prev) => (!prev ? prev : false))

      if (!isModeSelect) {
        setSelectionId((prev) => (prev.length > 0 ? [] : prev))
      }
    }
  }, [isModeSelect, sheetProps.root?.open])

  useEffect(() => {
    if (
      (isOnUploads && uploadNames.length > 0) ||
      (isOnRemoval && selectionId.length > 0)
    ) {
      const timer = setTimeout(
        () => setIsCancelable(false),
        AppConfig.Timeout.TimeBeforeCancel
      )

      setIsCancelable(true)
      return () => clearTimeout(timer)
    }
  }, [isOnRemoval, isOnUploads, selectionId.length, uploadNames.length])

  useEffect(() => {
    if (defaultSelectedId !== selectedId) {
      setSelectedId(defaultSelectedId)
    }
  }, [defaultSelectedId, selectedId])

  // prettier-ignore
  const prepend = (
    galleries.data &&
    galleries.data.length > 0 &&
    !uploadNames.length &&
    isOnRemoval === false && (
      <button
        className='text-blue-600 dark:text-blue-400'
        onClick={() => {
          setIsModeSelect((prev) => !prev)
          isModeSelect && selectionId.length > 0 && setSelectionId([])
        }}
      >
        {isModeSelect ? 'Batal' : 'Edit'}
      </button>
    )
  )

  // prettier-ignore
  const append = (
    isModeSelect && selectionId.length > 0 ? (
      <button
        aria-label='Delete'
        onClick={() => onDelete(selectionId)}
      >
        Hapus
      </button>
    ) : !!galleries.data && (
      <button
        aria-label='Upload'
        disabled={isUploadDisabled}
        onClick={() => !isUploadDisabled && fileRef.current?.click()}
        className={tw('text-2xl', {
          'opacity-50': isUploadDisabled, // prettier-ignore
          invisible: galleries.isError,
        })}
      >
        <input
          ref={fileRef}
          type='file'
          className='sr-only invisible'
          onChange={onChange}
          accept={SUPPORTED_FORMAT.join(',')}
          multiple
        />
        <span className='pointer-events-none block'>
          <IoCloudUploadOutline />
        </span>
      </button>
    )
  )

  return (
    <BottomSheet
      {...sheetProps}
      header={{ append, prepend, title: 'Pilih foto', ...sheetProps.header }}
      root={{ ...sheetProps.root }}
      footer={{ useClose: true, ...sheetProps.footer }}
      content={{
        ...sheetProps.content,
        onPointerDownOutside: (e) => {
          if ((e.target as HTMLElement).closest('#section-galleries')) {
            e.preventDefault()
          }

          sheetProps.content?.onPointerDownOutside?.(e)
        },
        onOpenAutoFocus: (e) => {
          setErrors([])
          sheetProps.content?.onOpenAutoFocus?.(e)
        },
        onAnimationEnd: (e) => {
          if (!galleries.data) {
            galleries.refetch()
          }

          sheetProps.content?.onAnimationEnd?.(e)
        },
      }}
    >
      <div className='overflow-auto'>
        <div className='relative min-h-[min(max(56.25vw,180px),247.5px)]'>
          {!galleries.data ? (
            galleries.isError && !galleries.isLoading ? (
              <div className='absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2 text-center text-sm tracking-normal dark:text-zinc-300'>
                <p>Error while fetching data.</p>
                <a
                  href='#'
                  className='text-blue-600'
                  onClick={(e) => {
                    e.preventDefault()
                    galleries.refetch()
                  }}
                >
                  Try again
                </a>
              </div>
            ) : (
              <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm tracking-normal'>
                <Spinner />
              </div>
            )
          ) : !galleries.data.length ? (
            <div className='absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2 text-center text-sm tracking-normal dark:text-zinc-300'>
              Foto yang sudah diunggah akan muncul disini.
            </div>
          ) : (
            <ul className='grid w-full grid-cols-3 gap-6 px-6 py-2'>
              {galleries.data.map(({ fileId, name, thumbnail }, idx) => (
                <li key={idx} className='relative pt-[100%]'>
                  <button
                    style={{ backgroundImage: `url(${thumbnail})` }}
                    disabled={isProcessing(fileId, name)}
                    onClick={
                      !isProcessing(fileId, name)
                        ? onSelect(fileId, name)
                        : void 0
                    }
                    className={tw(
                      'absolute left-0 top-0 h-full w-full rounded-xl bg-zinc-100 bg-cover bg-center bg-no-repeat',
                      outlinedClasses(selectedId === fileId, 'outline-4 outline-offset-[4px]'), // prettier-ignore
                      isProcessing(fileId, name) && !isCancelable && 'animate-[pulse_500ms_ease-in-out_infinite]' // prettier-ignore
                    )}
                  >
                    <span
                      className={tw(
                        'absolute bottom-1 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border',
                        {
                          'bg-blue-600': selectionId.includes(fileId),
                          invisible: !isModeSelect,
                        }
                      )}
                    />
                  </button>

                  {isCancelable && isProcessing(fileId, name) && (
                    <>
                      <span className='absolute bottom-0 left-0 right-0 top-0 rounded-xl bg-black opacity-50'></span>
                      <button
                        className='absolute bottom-4 left-4 right-4 top-4 flex items-center justify-center rounded-full text-white'
                        onClick={() =>
                          abortByAction(
                            uploadNames.includes(name) ? name : fileId
                          )
                        }
                      >
                        <CgClose />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.length > 0 && (
          <div className='mx-6 mt-4'>
            <div className='rounded-lg bg-yellow-100 px-3 py-3 text-xs tracking-wide text-yellow-700'>
              <ul className='flex flex-col'>
                {errors.map((message, key) => (
                  <li key={key} className='overflow-hidden'>
                    <p className='truncate'>{message}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className='mx-6 mt-4'>
          <div className='rounded-lg bg-zinc-100 px-3 py-3 text-xs tracking-wide text-zinc-600'>
            <ul className='flex flex-col pl-4'>
              <li className='list-disc'>
                <p>Max files in gallery is 13 item.</p>
              </li>
              <li className='list-disc'>
                <p>Maximum file size is 1MB</p>
              </li>
              <li className='list-disc'>
                <p>
                  Only support{' '}
                  {SUPPORTED_FORMAT.join(', ').replace(/image\//g, '.')} format.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default SheetGallery

'use client'

import type { Wedding, WeddingGalleries, WeddingGallery } from '@wedding/schema'
import type { BottomSheetProps } from '@/components/BottomSheet'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { useLocale } from 'next-intl'
import { IoCloudUploadOutline } from 'react-icons/io5'
import { weddingGalleriesType } from '@wedding/schema'
import { uploads } from '@wedding/helpers'
import { QueryWedding, WeddingConfig } from '@wedding/config'
import { tw } from '@/tools/lib'
import {
  useMountedEffect,
  useOutlinedClasses,
  useWeddingDetail,
} from '@/tools/hook'
import { blobToUri, compress, qstring } from '@/tools/helpers'
import { RouteApi } from '@/tools/config'
import dynamic from 'next/dynamic'
import RangeSlider from '@/components/RangeSlider'
import Toast from '@/components/Notification/Toast'
import Spinner from '@/components/Loading/Spinner'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const Alert = dynamic(() => import('@/components/Notification/Alert'), {
  ssr: false,
})

const MAX_FILE_SIZE = WeddingConfig.MaxFileSize * 1000 // byte

const SUPPORTED_FORMAT = ['image/png', 'image/jpg', 'image/jpeg']

type SheetGalleryCoordinate = {
  defaultCoordinate?: string
  allowedAxis?: string[]
  onChangedCoordinate?: (coordinate: string) => void
  onValueCommit?: (coordinate: string) => void
}

type SheetGalleryProps = BottomSheetProps & {
  defaultSelectedId?: string
  coordinate?: SheetGalleryCoordinate
  onItemPicked?: (file?: Omit<WeddingGallery, 'index'>) => void
}

type SheetGallerySignal = {
  id: string
  controller: AbortController
}

const SheetGallery: RFZ<SheetGalleryProps> = ({
  defaultSelectedId,
  coordinate,
  onItemPicked,
  ...sheetProps
}) => {
  const [isModeSelect, setIsModeSelect] = useState(false)
  const [isOnRemoval, setIsOnRemoval] = useState(false)
  const [selectionId, setSelectionId] = useState<string[]>([])
  const [uploadNames, setUploadNames] = useState<string[]>([])
  const [coordinates, setCoordinates] = useState({ x: 50, y: 50 })
  const [selectedId, setSelectedId] = useState(defaultSelectedId)
  const [errors, setErrors] = useState<string[]>([])
  const allowedAxis = coordinate?.allowedAxis ?? ['x', 'y']
  const toast = new Toast()
  const controller = useRef<SheetGallerySignal[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()
  const { name: path, wid } = useWeddingDetail()

  const locale = useLocale()
  const outlinedClasses = useOutlinedClasses()
  const isUploadDisabled = uploadNames.length > 0 || isOnRemoval || isModeSelect
  const galleries = useQuery({
    queryKey: QueryWedding.weddingGalleries,
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

  const isInAction =
    galleries.isLoading || !!uploadNames.length || isOnRemoval || isModeSelect

  function isProcessing(id: string, name: string) {
    return (
      uploadNames.includes(name) || (isOnRemoval && selectionId.includes(id))
    )
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
      WeddingConfig.MaxFileItem - (galleries.data?.length ?? 0)
    )

    if (!files || !target || !target.files?.[0]) {
      return
    }

    setErrors([])
    files.forEach(async (file) => {
      if (!SUPPORTED_FORMAT.includes(file.type)) {
        return setErrors((prev) => [...prev, `Unsupported file: ${file.type}`])
      }

      if (file.size > MAX_FILE_SIZE) {
        return setErrors((prev) => [...prev, `File size limit: ${file.name}`])
      }

      const ac = { id: file.name, controller: new AbortController() }
      const uri = URL.createObjectURL(file)
      controller.current.push(ac)

      setUploadNames((prev) => [...prev, file.name])
      queryClient.setQueryData<WeddingGalleries[] | undefined>(
        QueryWedding.weddingGalleries,
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

      let quality = 8
      let blob = await compress(quality, file)

      while (quality > 1 && blob.size > 1500 * 1000) {
        blob = await compress(quality--, file)
      }

      try {
        const image = await blobToUri(blob)
        const response = await fetch(qstring({ locale }, RouteApi.uploads), {
          method: 'POST',
          signal: ac.controller.signal,
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            file: image,
            path,
            wid,
          }),
        })

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
          QueryWedding.weddingGalleries,
          (prev) => {
            if (!prev) return prev

            const pattern = /\.(jpg|jpeg|png)/g
            const copy = prev.filter(
              (item) => !data.name.includes(item.name.replace(pattern, ''))
            )

            const previousIndex = prev.findIndex((item) =>
              data.name.includes(item.name.replace(pattern, ''))
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
          QueryWedding.weddingGalleries,
          (prev) => prev?.filter((item) => item.name !== file.name)
        )
      } finally {
        controller.current = controller.current.filter(
          (item) => item.id !== file.name
        )

        URL.revokeObjectURL(uri)
        setUploadNames((prev) => prev.filter((name) => name !== file.name))
      }

      if (ac.controller.signal.aborted) {
        ac.controller.abort()
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
          QueryWedding.weddingGalleries,
          (prev) => {
            return !prev ? prev : prev.filter((prev) => prev.fileId !== id)
          }
        )

        queryClient.setQueryData<Wedding | undefined>(
          QueryWedding.weddingDetail,
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

        setCoordinates({ x: 50, y: 50 })
        setSelectedId(isRemoving ? void 0 : fileId)
        onItemPicked?.(
          isRemoving
            ? void 0
            : {
                fileId,
                fileName: uploads(`/${path}/${fileName}`),
                coordinate: '50:50',
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

  function onCoordinateChange(axis: 'x' | 'y') {
    return ([value]: number[]) => {
      if (!allowedAxis.includes(axis) || isInAction) {
        return
      }

      setCoordinates((prev) => ({ ...prev, [axis]: value }))
      coordinate?.onChangedCoordinate?.(
        (axis === 'x' ? [value, coordinates.y] : [coordinates.x, value]).join(
          ':'
        )
      )
    }
  }

  function onCoordinateCommit(axis: 'x' | 'y') {
    return ([value]: number[]) => {
      if (!allowedAxis.includes(axis) || isInAction) {
        return
      }

      coordinate?.onValueCommit?.(
        (axis === 'x' ? [value, coordinates.y] : [coordinates.x, value]).join(
          ':'
        )
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
    if (defaultSelectedId !== selectedId) {
      setSelectedId(defaultSelectedId)
    }
  }, [defaultSelectedId, selectedId])

  useEffect(() => {
    if (coordinate?.defaultCoordinate) {
      const coordinates = coordinate.defaultCoordinate
      const [x, y] = coordinates.split(':').map(Number)

      setCoordinates({ x, y })
    }
  }, [coordinate?.defaultCoordinate])

  // prettier-ignore
  const prepend = (
    galleries.data &&
    galleries.data.length > 0 &&
    !uploadNames.length &&
    isOnRemoval === false && (
      <button
        className='text-blue-600 [.dark_&]:text-blue-400'
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
      <Alert
        title={{ children: 'Hapus foto?' }}
        description={{
          children:
            'Foto yang dipilih akan dihapus dan dilepas dari gallery foto (jika ada). Lanjutkan?',
        }}
        cancel={{ children: 'Batal' }}
        action={{
          children: 'Hapus',
          className: tw('bg-red-600'),
          onClick: () => onDelete(selectionId),
        }}
        trigger={{
          asChild: true,
          children: <button>Hapus</button>
        }}
      />
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
              <div className='absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2 text-center text-sm tracking-normal [.dark_&]:text-zinc-300'>
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
            <div className='absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2 text-center text-sm tracking-normal [.dark_&]:text-zinc-300'>
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
                      isProcessing(fileId, name) && 'animate-[pulse_500ms_ease-in-out_infinite]' // prettier-ignore
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
          <div className='flex min-h-20 items-center rounded-lg bg-zinc-100 px-3 py-3 text-xs tracking-wide text-zinc-600 [.dark_&]:bg-zinc-700 [.dark_&]:text-zinc-300'>
            {galleries.data &&
            !galleries.isLoading &&
            selectedId &&
            coordinate ? (
              <div className='w-full'>
                {(['x', 'y'] as const).map((axis, index) => (
                  <div key={index} className='flex items-center space-x-3'>
                    <span
                      className={tw(
                        'block min-w-16',
                        (!allowedAxis.includes(axis) || isInAction) && 'opacity-40' // prettier-ignore
                      )}
                    >
                      {axis === 'x' ? 'Horizontal' : 'Vertical'}
                    </span>
                    <RangeSlider
                      root={{
                        className: tw('max-w-full'),
                        value: [coordinates[axis]],
                        disabled: !allowedAxis.includes(axis) || isInAction,
                        max: 100,
                        step: 1,
                        onValueCommit: onCoordinateCommit(axis),
                        onValueChange: onCoordinateChange(axis),
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ul className='flex w-full flex-col pl-4'>
                <li className='list-disc'>
                  <p>Max files in gallery is 13 item.</p>
                </li>
                <li className='list-disc'>
                  <p>
                    Maximum file size is{' '}
                    {(WeddingConfig.MaxFileSize / 1000).toFixed(0)} MB
                  </p>
                </li>
                <li className='list-disc'>
                  <p>
                    Supported files:{' '}
                    {SUPPORTED_FORMAT.join(', ').replace(/image\//g, '.')}{' '}
                  </p>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default SheetGallery

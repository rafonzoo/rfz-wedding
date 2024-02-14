'use client'

import type { ChangeEvent } from 'react'
import type { Wedding } from '@wedding/schema'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { BsGift } from 'react-icons/bs'
import { updateWeddingSurpriseQuery } from '@wedding/query'
import { QueryWedding } from '@wedding/config'
import { tw } from '@/tools/lib'
import { useIsEditorOrDev, useUtilities, useWeddingDetail } from '@/tools/hook'
import dynamic from 'next/dynamic'
import Notify from '@/components/Notification/Notify'
import markdownConfig from '@/components/Markdown/config'
import Spinner from '@/components/Loading/Spinner'
import FieldTextArea from '@/components/FormField/TextArea'

const Markdown = dynamic(() => import('@/components/Markdown'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full w-full items-center justify-center'>
      <Spinner />
    </div>
  ),
})

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
  loading: () => (
    <button className='mx-auto flex h-14 items-center justify-center rounded-xl bg-blue-200 px-6 font-semibold text-blue-700'>
      Suprise
      <span className='ml-2 block text-xl'>
        <BsGift />
      </span>
    </button>
  ),
})

const CommentSurprise: RF = () => {
  const isEditor = useIsEditorOrDev()
  const isPublic = !isEditor
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()
  const [viewParsed, setViewParsed] = useState(!!detail.surprise)
  const [surprise, setSurprise] = useState(detail.surprise)
  const [open, onOpenChange] = useState(false)
  const [isError, setIsError] = useState(false)
  const { abort, cancelDebounce, getSignal, debounce } = useUtilities()
  const wid = useParams().wid as string
  const { isLoading, mutate: updateSurprise } = useMutation<
    string,
    unknown,
    string
  >({
    mutationFn: (payload) => {
      return updateWeddingSurpriseQuery({
        wid,
        signal: getSignal(),
        surprise: payload,
      })
    },
    onSuccess: (updatedSurprise) => {
      setIsError(false)

      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, surprise: updatedSurprise })
      )
    },
    onError: (e) => {
      if ((e as Error)?.message.includes('AbortError')) {
        return
      }

      setIsError(true)
    },
  })

  function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const surprise = e.target.value

    abort()
    cancelDebounce()
    setSurprise(surprise)

    if (detail.surprise === surprise) {
      return setIsError(false)
    }

    debounce(() => updateSurprise(surprise))
  }

  if (!((isPublic && surprise) || isEditor)) {
    return null
  }

  return (
    <div className='mt-8'>
      <BottomSheet
        root={{ open, onOpenChange }}
        option={{ useOverlay: true }}
        footer={{
          useClose: true,
          useBorder: !viewParsed
            ? !!detail.surprise && isError && !isLoading
              ? void 0
              : false
            : void 0,
        }}
        content={{ className: tw('h-full') }}
        wrapper={{ className: tw('h-full') }}
        header={{
          title: 'Suprise',
          useBorder: true,
          prepend: isEditor && (
            <button
              className='text-blue-600 [.dark_&]:text-blue-400'
              onClick={() => setViewParsed((prev) => !prev)}
            >
              {viewParsed ? 'Edit' : 'Lihat'}
            </button>
          ),
          append: (
            <>
              {isLoading && <Spinner />}
              {isError && !isLoading && (
                <button
                  className='relative text-blue-600 [.dark_&]:text-blue-400'
                  onClick={() => updateSurprise(surprise)}
                >
                  Simpan
                </button>
              )}
            </>
          ),
        }}
        trigger={{
          asChild: true,
          children: (
            <button className='mx-auto flex h-14 items-center justify-center rounded-xl bg-blue-200 px-6 font-semibold text-blue-700'>
              Suprise
              <span className='ml-2 block text-xl'>
                <BsGift />
              </span>
            </button>
          ),
        }}
      >
        {isEditor && isError && (
          <div className='px-6 pt-6'>
            <Notify
              severity='error'
              title='Failed to save a changes.'
              description='Please tap "Save" above to keep your data up to date.'
            />
          </div>
        )}
        {isPublic ? (
          <div className='markdown h-[inherit] p-6'>
            <Markdown {...markdownConfig}>{surprise}</Markdown>
          </div>
        ) : viewParsed ? (
          <div className='h-[inherit] px-6 pb-1 pt-6'>
            <div className='markdown h-[inherit]'>
              <Markdown {...markdownConfig}>{surprise}</Markdown>
            </div>
          </div>
        ) : (
          <div className='h-full px-6 pb-1 pt-6'>
            <FieldTextArea
              label='Markdown'
              name='surprise'
              value={surprise}
              className='h-[inherit] font-mono text-sm'
              wrapper={{ className: tw('h-[inherit]') }}
              onChange={onChange}
            />
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

export default CommentSurprise

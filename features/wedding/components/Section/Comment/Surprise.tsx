'use client'

import type { ChangeEvent } from 'react'
import type { Wedding } from '@wedding/schema'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { BsGift } from 'react-icons/bs'
import { updateWeddingSurpriseQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import { useUtilities } from '@/tools/hook'
import { exact } from '@/tools/helper'
import { Queries } from '@/tools/config'
import dynamic from 'next/dynamic'
import Notify from '@/components/Notification/Notify'
import markdownConfig from '@/components/Markdown/config'
import Markdown from '@/components/Markdown'
import Spinner from '@/components/Loading/Spinner'
import FieldTextArea from '@/components/Field/TextArea'

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
  const isPublic = !!useParams().name
  const isEditor = !isPublic
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
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
        Queries.weddingDetail,
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

  return (
    <div className='mt-8'>
      <BottomSheet
        root={{ open, onOpenChange }}
        option={{ useOverlay: true }}
        footer={{
          useClose: true,
          useBorder: !!detail.surprise && isError && !isLoading,
        }}
        content={{ className: tw('h-full') }}
        wrapper={{ className: tw('h-full') }}
        header={{
          title: 'Suprise',
          useBorder: true,
          prepend: isEditor && (
            <button
              className='text-blue-600 dark:text-blue-400'
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
                  className='relative text-blue-600 dark:text-blue-400'
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
          <div className='markdown h-full p-6'>
            <Markdown {...markdownConfig}>{surprise}</Markdown>
          </div>
        ) : viewParsed ? (
          <div className='h-full px-6 pb-1 pt-6'>
            <div className='markdown h-full'>
              <Markdown {...markdownConfig}>{surprise}</Markdown>
            </div>
          </div>
        ) : (
          <div className='h-full px-6 pb-1 pt-6'>
            <FieldTextArea
              label='Markdown'
              name='surprise'
              value={surprise}
              className='h-full font-mono text-sm'
              wrapper={{ className: tw('h-full') }}
              onChange={onChange}
            />
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

export default CommentSurprise

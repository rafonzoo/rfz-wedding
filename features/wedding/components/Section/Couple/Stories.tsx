'use client'

import type { ChangeEvent } from 'react'
import type { Wedding } from '@wedding/schema'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { PiWarningCircleFill } from 'react-icons/pi'
import { BsPlusLg } from 'react-icons/bs'
import { updateWeddingStoriesQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import { useIsEditorOrDev, useUtilities } from '@/tools/hook'
import { exact } from '@/tools/helper'
import { Queries } from '@/tools/config'
import dynamic from 'next/dynamic'
import Notify from '@/components/Notification/Notify'
import markdownConfig from '@/components/Markdown/config'
import Spinner from '@/components/Loading/Spinner'
import FieldTextArea from '@/components/Field/TextArea'

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
})

const SectionCoupleStories: RFZ = () => {
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const [open, setOpen] = useState<'public' | 'editor' | 'idle'>('idle')
  const [reactiveStory, setReactiveStory] = useState(detail.stories)
  const [viewParsed, setViewParsed] = useState(!!detail.stories)
  const [isError, setIsError] = useState(false)
  const { abort, cancelDebounce, getSignal, debounce } = useUtilities()
  const wid = useParams().wid as string
  const isEditor = useIsEditorOrDev()
  const isPublic = !isEditor
  const { isLoading, mutate: updateStories } = useMutation<
    string,
    unknown,
    string
  >({
    mutationFn: (payload) => {
      if (!wid) {
        throw new Error('Illegal invocation')
      }

      return updateWeddingStoriesQuery({
        wid,
        signal: getSignal(),
        stories: payload,
      })
    },
    onSuccess: (updatedStories) => {
      setIsError(false)

      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, stories: updatedStories })
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
    const story = e.target.value

    abort()
    cancelDebounce()
    setReactiveStory(story)

    if (detail.stories === story) {
      return setIsError(false)
    }

    debounce(() => updateStories(story))
  }

  return (
    (isEditor || (isPublic && !!detail.stories)) && (
      <div className='mt-6 flex h-14 w-full justify-center'>
        {isEditor && (
          <BottomSheet
            root={{
              open: open === 'editor',
              onOpenChange: (isopen) => setOpen(!isopen ? 'idle' : 'editor'),
            }}
            footer={{
              useClose: true,
              useBorder: !viewParsed
                ? !!detail.stories && isError && !isLoading
                  ? void 0
                  : false
                : void 0,
            }}
            option={{ useOverlay: true }}
            content={{ className: tw('h-full') }}
            wrapper={{ className: tw('h-full') }}
            header={{
              title: 'Edit kisah',
              useBorder: true,
              prepend: (
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
                      onClick={() => updateStories(reactiveStory)}
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
                <button className='relative flex h-14 items-center space-x-3 rounded-full bg-black/70 pl-6 pr-4 font-semibold text-white backdrop-blur-lg [.dark_&]:bg-white/70 [.dark_&]:text-black'>
                  <span>Edit Kisah</span>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xl text-white'>
                    <BsPlusLg />
                  </span>
                  {isError && !isLoading && (
                    <span className='absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-white text-2xl text-red-600'>
                      <PiWarningCircleFill />
                    </span>
                  )}
                </button>
              ),
            }}
          >
            {isError && (
              <div className='px-6 pt-6'>
                <Notify
                  severity='error'
                  title='Failed to save a changes.'
                  description='Please tap "Save" above to keep your data up to date.'
                />
              </div>
            )}
            {viewParsed ? (
              <div className='h-[inherit] px-6 pb-1 pt-6'>
                <div className='markdown h-[inherit]'>
                  <Markdown {...markdownConfig}>{reactiveStory}</Markdown>
                </div>
              </div>
            ) : (
              <div className='h-[inherit] px-6 pb-1 pt-6'>
                <FieldTextArea
                  label='Markdown'
                  name='story'
                  value={reactiveStory}
                  className='h-[inherit] font-mono text-sm'
                  wrapper={{ className: tw('h-[inherit]') }}
                  onChange={onChange}
                />
              </div>
            )}
          </BottomSheet>
        )}
        {isPublic && !!detail.stories && (
          <BottomSheet
            root={{
              open: open === 'public',
              onOpenChange: (isopen) => setOpen(!isopen ? 'idle' : 'public'),
            }}
            footer={{ useClose: true }}
            option={{ useOverlay: true }}
            header={{ title: 'Kisah', useBorder: true }}
            content={{ className: tw('h-full') }}
            wrapper={{ className: tw('h-full') }}
            trigger={{
              asChild: true,
              children: (
                <button className='flex h-14 items-center space-x-3 rounded-full bg-black pl-6 pr-4 font-semibold text-white [.dark_&]:bg-white [.dark_&]:text-black'>
                  <span>Lihat Kisah</span>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xl text-white'>
                    <BsPlusLg />
                  </span>
                </button>
              ),
            }}
          >
            <div className='markdown h-[inherit] p-6'>
              <Markdown {...markdownConfig}>{detail.stories}</Markdown>
            </div>
          </BottomSheet>
        )}
      </div>
    )
  )
}

export default SectionCoupleStories

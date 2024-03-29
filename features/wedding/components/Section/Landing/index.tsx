'use client'

import type { ChangeEvent } from 'react'
import type { Wedding } from '@wedding/schema'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { PiWarningCircleFill } from 'react-icons/pi'
import {
  deleteWeddingSongQuery,
  updateWeddingDisplayNameQuery,
} from '@wedding/query'
import { guestName, isPassed } from '@wedding/helpers'
import { QueryWedding } from '@wedding/config'
import { djs, tw } from '@/tools/lib'
import { useIsEditor, useUtilities, useWeddingDetail } from '@/tools/hook'
import dynamic from 'next/dynamic'
import Text from '@wedding/components/Text'
import LandingMediaPlayer from '@wedding/components/Section/Landing/MediaPlayer'
import SectionLandingBackground from '@wedding/components/Section/Landing/Background'
import Spinner from '@/components/Loading/Spinner'
import FieldText from '@/components/FormField/Text'
import FieldGroup from '@/components/FormField/Group'

const SheetGuest = dynamic(() => import('@wedding/components/Sheet/Guest'), {
  ssr: false,
})

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const SectionLanding = () => {
  const { abort, cancelDebounce, getSignal, debounce } = useUtilities()
  const isEditor = useIsEditor()
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()
  const [open, onOpenChange] = useState(false)
  const [error, setError] = useState('')
  const [isError, setIsError] = useState(false)
  const [dname1, dname2] = detail.displayName.split(' & ')
  const [name1, setName1] = useState(dname1)
  const [name2, setName2] = useState(dname2)
  const trimmedName1 = name1.trim()
  const trimmedName2 = name2.trim()
  const to = useSearchParams().get('to')
  const guest = isEditor || !to ? null : guestName(to)?.replace(/-/g, ' ')
  const locale = useLocale()
  const displayName = [trimmedName1, trimmedName2].join(' & ')
  const textSizeViewport = (18 / (displayName.length * 1.384615384615385)) * 18
  const minTextSizeLength = (57 / (displayName.length * 4.384615384615385)) * 57
  const maxTextSizeLength = (79 / (displayName.length * 6.076923076923077)) * 79
  const wid = useParams().wid as string
  const passed = !!wid && isPassed(detail.events)

  const { isLoading: isRemoving, mutate: removeSong } = useMutation<
    null,
    unknown
  >({
    mutationFn: () => {
      if (!detail.music?.fileId) {
        throw new Error('Illegal invocation.')
      }

      return deleteWeddingSongQuery(locale, detail.music.fileId, wid)
    },
    onSuccess: () => {
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) =>
          !prev
            ? prev
            : {
                ...prev,
                music: null,
              }
      )
    },
  })

  const [date] = detail.events.map((event) =>
    djs(event.date).tz().format('DD:MM:YY')
  )

  const { mutate: updateName, isLoading: updateLoading } = useMutation<
    string,
    unknown,
    string
  >({
    mutationFn: (newDisplayName) => {
      return updateWeddingDisplayNameQuery({
        wid,
        signal: getSignal(),
        displayName: newDisplayName,
      })
    },
    onSuccess: (newDisplayName) => {
      setIsError(false)

      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, displayName: newDisplayName })
      )

      queryClient.setQueryData<Wedding[] | undefined>(
        QueryWedding.weddingGetAll,
        (prev) => {
          return !prev
            ? [{ ...detail, displayName: newDisplayName }]
            : prev.map((item) =>
                item.wid === wid
                  ? { ...item, displayName: newDisplayName }
                  : item
              )
        }
      )
    },
    onError: (e) => {
      if ((e as Error)?.message.includes('AbortError')) {
        return
      }

      setIsError(true)
    },
  })

  function setterValue(id: 'cname1' | 'cname2') {
    return (e: ChangeEvent<HTMLInputElement>) => {
      abort()
      cancelDebounce()
      setError('')

      let newDisplayName = ''

      if (id === 'cname1') {
        const value = e.target.value

        newDisplayName = [value.trim(), trimmedName2].join(' & ')
        setName1(value)
      } else {
        const value = e.target.value

        newDisplayName = [trimmedName1, value.trim()].join(' & ')
        setName2(value)
      }

      if (e.target.value.length < 3 || newDisplayName.length < 9) {
        return setError('String must contain at least 3 character(s)')
      }

      if (newDisplayName === detail.displayName) {
        return setIsError(false)
      }

      debounce(() => updateName(newDisplayName))
    }
  }

  return (
    <section className='h-screen max-h-[932px] min-h-[470px] bg-zinc-900'>
      <SectionLandingBackground>
        <div className='flex flex-col justify-end overflow-hidden px-6 pb-[min(108px,max(79px,24.615384615384615vw))] pt-6'>
          <div className='mx-auto'>
            <div className='relative'>
              <Text
                family='cinzel'
                className='flex flex-col text-center leading-[1.025]'
                style={{
                  fontSize:
                    displayName.length > 12
                      ? `min(${Math.ceil(maxTextSizeLength) > 79 ? 79 : Math.ceil(maxTextSizeLength)}px,max(${Math.ceil(minTextSizeLength)}px, ${Math.ceil(textSizeViewport)}vw))`
                      : `min(79px,max(57px, 18vw))`,
                }}
              >
                <span>
                  {trimmedName1.length <= trimmedName2.length
                    ? trimmedName1 + ` &`
                    : trimmedName1}
                </span>
                <span>
                  {trimmedName1.length > trimmedName2.length
                    ? `& ${trimmedName2}`
                    : trimmedName2}
                </span>
              </Text>

              {isEditor && (
                <BottomSheet
                  root={{ open, onOpenChange }}
                  header={{
                    title: 'Utama',
                    append: (
                      <>
                        {updateLoading && <Spinner />}
                        {isError && !updateLoading && (
                          <button
                            className='relative text-blue-600 [.dark_&]:text-blue-400'
                            onClick={() => updateName(displayName)}
                          >
                            Simpan
                          </button>
                        )}
                      </>
                    ),
                  }}
                  footer={{
                    useClose: true,
                    wrapper: {
                      className: tw(
                        detail.music && !isRemoving && 'grid-cols-3 justify-items-center' // prettier-ignore
                      ),
                    },
                    prepend: detail.music && !isRemoving && (
                      <button
                        className='mr-auto w-auto text-blue-600 [.dark_&]:text-blue-400'
                        onClick={() => removeSong()}
                      >
                        Hapus
                      </button>
                    ),
                  }}
                  trigger={{
                    asChild: true,
                    children: (
                      <button
                        aria-label='Edit name'
                        className={tw(
                          'absolute -bottom-0 -left-2 -right-2 -top-0 rounded-2xl outline-offset-4',
                          open ? 'shadow-focus outline-none' : 'shadow-outlined'
                        )}
                      >
                        {isError && !updateLoading && (
                          <span className='absolute -right-3 -top-3 flex items-center justify-center rounded-full bg-white text-2xl text-red-600'>
                            <PiWarningCircleFill />
                          </span>
                        )}
                      </button>
                    ),
                  }}
                >
                  <FieldGroup title='Info'>
                    <div className='flex space-x-4'>
                      <FieldText
                        label='Nama pasangan'
                        name='cname1'
                        value={name1}
                        blacklist=',-'
                        isAlphaNumeric
                        required
                        errorMessage={!!(name1.length < 3 && error)}
                        onChange={setterValue('cname1')}
                      />
                      <FieldText
                        label='Nama pasangan'
                        name='cname2'
                        value={name2}
                        blacklist=',-'
                        isAlphaNumeric
                        required
                        errorMessage={!!(name2.length < 3 && error)}
                        onChange={setterValue('cname2')}
                      />
                    </div>
                  </FieldGroup>
                  {error && (
                    <p className='px-9 pt-2 text-xs tracking-wide text-red-500'>
                      {error}
                    </p>
                  )}
                  <LandingMediaPlayer isRemoving={isRemoving} />
                </BottomSheet>
              )}
            </div>
          </div>
          <div className='mt-6 overflow-hidden text-center text-zinc-300'>
            <p>Undangan kepada yth,</p>
            <p className='min-h-6 truncate'>
              {isEditor ? <SheetGuest /> : passed ? '(Nama tamu)' : guest}
            </p>
          </div>
          <div className='mt-8 flex items-center justify-center space-x-4 text-center'>
            {date.split(':').map((time, index) => (
              <Text family='cinzel' key={index} className='block text-2xl'>
                {index > 0 ? (
                  <>
                    <span className='mr-4 opacity-50'>·</span>
                    {time}
                  </>
                ) : (
                  time
                )}
              </Text>
            ))}
          </div>
        </div>
      </SectionLandingBackground>
    </section>
  )
}

export default SectionLanding

'use client'

import type { ChangeEvent } from 'react'
import type { User } from '@supabase/auth-helpers-nextjs'
import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useTranslations } from 'next-intl'
import { ZodError } from 'zod'
import { BsPlusLg } from 'react-icons/bs'
import { type Wedding, weddingType } from '@wedding/schema'
import {
  addNewWeddingQuery,
  deleteWeddingQuery,
  getAllWeddingQuery,
} from '@wedding/query'
import { djs, supabaseClient, tw } from '@/tools/lib'
import { useIntersection, useLongPress, useUtilities } from '@/tools/hook'
import { abspath, retina, sanitizeValue, trimBy } from '@/tools/helper'
import { AppConfig, ErrorMap, Queries, Route } from '@/tools/config'
import { useLocaleRouter } from '@/locale/config'
import dynamic from 'next/dynamic'
import Toast from '@/components/Notification/Toast'
import NavWindow from '@/components/NavWindow'
import Spinner from '@/components/Loading/Spinner'
import FieldText from '@/components/Field/Text'
import FieldSearch from '@/components/Field/Search'
import FieldGroup from '@/components/Field/Group'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const MyWeddingAddNewSheet: RF<{ uid: string }> = ({ uid }) => {
  const [open, onOpenChange] = useState(false)
  const [coupleName, setCoupleName] = useState('')
  const [errorName, setErrorName] = useState('')
  const { cancelDebounce, getSignal, abort } = useUtilities()
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations()
  const toast = new Toast()
  const queryClient = useQueryClient()
  const { mutate: addNewWedding, isLoading } = useMutation<
    Wedding,
    unknown,
    string
  >({
    mutationFn: (name) => {
      return addNewWeddingQuery({
        signal: getSignal(),
        uid,
        name,
      })
    },
    onError: (e) => {
      const { name: errorName } = e as Error

      switch (errorName) {
        case ErrorMap.duplicateError: {
          return setErrorName(t('error.field.invalidNameExist'))
        }
        case ErrorMap.limitError: {
          return setErrorName(
            t('error.field.invalidLimit', {
              maxDraft: AppConfig.Wedding.MaxDraft,
            })
          )
        }
        case ErrorMap.abortError: {
          return
        }
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Wedding[] | undefined>(
        Queries.weddingGetAll,
        (prev) => (!prev ? prev : [...prev, data])
      )

      setCoupleName('')
      onOpenChange(false)
      toast.success(t('success.invitation.create'))
    },
  })

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const value = trimBy('-', e.target.value.replace(/-+/g, '-'))
    const sanitized = sanitizeValue(value).replace(/\s/g, '-')

    abort()
    cancelDebounce()
    setErrorName('')
    setCoupleName(sanitized.toLowerCase())
  }

  function onSubmit() {
    abort()
    cancelDebounce()
    setErrorName('')

    try {
      weddingType.shape.name.parse(coupleName)
    } catch (e) {
      if (!(e instanceof ZodError)) {
        return
      }

      return setErrorName(e.issues[0].message)
    }

    addNewWedding(coupleName)
  }

  return (
    <BottomSheet
      root={{ open, onOpenChange }}
      footer={{ useClose: true }}
      option={{ useOverlay: true, disableFocus: true }}
      onCloseClicked={() => {
        abort()
        inputRef.current?.blur()
      }}
      header={{
        title: 'Buat undangan',
        append: isLoading ? (
          <Spinner />
        ) : (
          coupleName && <button onClick={onSubmit}>Buat</button>
        ),
      }}
      content={{ onOpenAutoFocus: () => inputRef.current?.focus() }}
      trigger={{
        asChild: true,
        children: (
          <button
            aria-label='Add new invitation'
            className='flex h-8 w-8 items-center justify-center rounded-full text-2xl text-blue-600 dark:text-blue-400'
          >
            <BsPlusLg />
          </button>
        ),
      }}
    >
      <FieldGroup title='Publik ID' classNames={{ w2: tw('pb-1') }}>
        <FieldText
          ref={inputRef}
          isAlphaNumeric
          blacklist={/.,/g}
          label='Nama pasangan'
          name='username'
          className='lowercase'
          defaultValue={coupleName.replace(/-/g, ' ')}
          infoMessage={
            coupleName
              ? `${abspath(`/${coupleName}`)}`
              : `Kolom ini hanya untuk pencarian. Nama pengantin dapat diubah setelahnya.`
          }
          onChange={onChange}
          errorMessage={errorName}
        />
      </FieldGroup>
    </BottomSheet>
  )
}

const MyWeddingItems: RF<{
  index: number
  length: number
  wedding: Wedding
  isLoading: boolean
  onClick: () => void
  onDeletion: (payload: { wid: string; name: string }) => void
}> = ({ index, length, wedding, isLoading, onClick, onDeletion }) => {
  const refLi = useRef<HTMLLIElement | null>(null)
  const [open, onOpenChange] = useState(false)
  const [highlight, setHighlight] = useState(false)
  const isIntersecting = useIntersection(refLi)
  const heroImage = wedding.galleries.find(
    (photo) => photo.index === AppConfig.Wedding.ImageryStartIndex
  )

  const imageUrl = heroImage?.fileName
    ? retina(heroImage.fileName, 'w', 'ar-1-1')
    : void 0

  const longpressAction = useLongPress({
    onClick,
    onLongPress: () => {
      onOpenChange(true)
      setHighlight(true)
    },
  })

  return (
    <li
      ref={refLi}
      className={tw(
        'relative overflow-hidden',
        isLoading && 'animate-[pulse_500ms_ease-in-out_infinite]', // prettier-ignore
        highlight && 'z-[999] bg-zinc-100 dark:bg-zinc-900'
      )}
    >
      <button
        {...longpressAction}
        className={tw(
          'flex w-full touch-none select-none space-x-4 pl-4 hover:bg-zinc-100 dark:hover:bg-zinc-900',
          index === 0 ? 'pt-4' : 'pt-2'
        )}
      >
        <span className='relative block min-h-14 min-w-14 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800'>
          {imageUrl && (
            <img
              alt='Gambar utama'
              className='absolute h-full w-full object-cover'
              src={isIntersecting ? imageUrl.thumbnail : imageUrl.blur}
            />
          )}
        </span>
        <span className='flex w-full max-w-[calc(100%_-_56px_-_16px)] flex-col space-y-1 text-left'>
          <span className='flex flex-col'>
            <span className='flex space-x-2 truncate text-sm tracking-normal'>
              <span className='block truncate font-semibold uppercase'>
                {wedding.displayName}
              </span>
            </span>
            <span className='line-clamp-2 min-h-10 pr-4 text-sm tracking-normal text-zinc-600 dark:text-zinc-300'>
              {wedding.events[0].detail}
            </span>
            <span className='mt-1 flex justify-between'>
              <span className='flex min-w-[135px] space-x-1'>
                <span
                  className={tw(
                    'block text-xs font-semibold tracking-base',
                    wedding.status !== 'live' && 'text-[color:rgb(190_90_0)]', // prettier-ignore
                    wedding.status === 'live' && 'text-green-600'
                  )}
                >
                  {wedding.status.toUpperCase()}
                </span>
                <span className='flex space-x-1 truncate text-xs tracking-base text-zinc-500 dark:text-zinc-400'>
                  <span className='block'>·</span>
                  <span className='block truncate'>
                    {djs().tz().format('DD/MM/YYYY')}
                  </span>
                </span>
              </span>
              <span className='ml-1 mr-3 block truncate text-xs tracking-base text-zinc-500 dark:text-zinc-400'>
                {wedding.name}
              </span>
            </span>
            {index !== length - 1 ? (
              <hr className='mt-2 border-zinc-300 dark:border-zinc-700' />
            ) : (
              <span className='mt-2 block' />
            )}
          </span>
        </span>
      </button>
      <BottomSheet
        option={{ isTransparent: true, useOverlay: true }}
        footer={{ useClose: true }}
        root={{ open, onOpenChange }}
        content={{ onCloseAutoFocus: () => setHighlight(false) }}
      >
        <div className='px-6'>
          <button
            className='flex h-14 w-full items-center justify-center rounded-xl bg-red-600 px-3 text-center font-semibold -tracking-base text-white'
            onClick={() => {
              setTimeout(() => {
                console.log(window)

                if (
                  window.confirm(
                    'This action cannot be undone. Continue to delete?'
                  )
                ) {
                  onDeletion?.({ wid: wedding.wid, name: wedding.name })
                }

                onOpenChange(false)
              }, 150)
            }}
          >
            Hapus
          </button>
        </div>
      </BottomSheet>
    </li>
  )
}

const MyWeddingPageClient: RFZ<{ myWedding: Wedding[]; user: User }> = ({
  myWedding,
  user,
}) => {
  const queryClient = useQueryClient()
  const router = useLocaleRouter()
  const { data: weddings } = useQuery({
    queryKey: Queries.weddingGetAll,
    queryFn: () => getAllWeddingQuery(supabaseClient(), user.id),
    initialData: myWedding,
  })

  const prevDetail = queryClient.getQueryData<Wedding>(Queries.weddingDetail)
  const usermeta = user.user_metadata
  const avatar_url: string | undefined = usermeta.avatar_url ?? usermeta.picture
  const { getSignal } = useUtilities()
  const [withFilter] = useState<keyof typeof items>('createdAt')
  const toast = new Toast()
  const t = useTranslations()
  const allWedding = weddings ?? myWedding
  const items = {
    createdAt: allWedding.sort((a, b) =>
      djs(a.createdAt)
        .tz()
        .toISOString()
        .localeCompare(djs(b.createdAt).tz().toISOString())
    ),
  }

  const {
    mutate: deleteWedding,
    variables: deletedOption,
    isLoading,
  } = useMutation<string, unknown, { wid: string; path: string }>({
    mutationFn: ({ wid, path }) => {
      return deleteWeddingQuery({ path, wid, signal: getSignal() })
    },
    onSuccess: (d, { wid, path }) => {
      toast.success(t('success.invitation.delete'))

      queryClient.setQueryData<Wedding[] | undefined>(
        Queries.weddingGetAll,
        (prev) => {
          return !prev ? prev : prev.filter((item) => item.wid !== wid)
        }
      )
    },
    onError: (e) => {
      const err = e as Error
      if (err.message.includes('AbortError')) {
        return
      }

      toast.error(err.message)
    },
  })

  function gotoDetailPage(wedding: Wedding) {
    if (prevDetail && prevDetail.wid !== wedding.wid) {
      queryClient.setQueryData(Queries.weddingDetail, wedding)
      queryClient.resetQueries({ queryKey: Queries.weddingGalleries })
      queryClient.resetQueries({ queryKey: Queries.weddingGuests })
      queryClient.resetQueries({ queryKey: Queries.weddingComments })
    }

    router.push({
      pathname: Route.weddingEditor,
      params: { wid: wedding.wid },
    })
  }

  return (
    <div className='mx-auto max-w-[440px]'>
      <NavWindow avatarUrl={avatar_url}>
        <MyWeddingAddNewSheet uid={user.id} />
      </NavWindow>
      {weddings && weddings.length >= 5 && (
        <div className='border-b border-zinc-200 px-4 py-1'>
          <FieldSearch placeholder='Pencarian...' />
        </div>
      )}
      <ul>
        {items[withFilter].map((wedding, index, array) => (
          <MyWeddingItems
            key={index}
            wedding={wedding}
            index={index}
            isLoading={isLoading && deletedOption?.wid === wedding.wid}
            length={array.length}
            onClick={() => gotoDetailPage(wedding)}
            onDeletion={({ wid, name: path }) => deleteWedding({ wid, path })}
          />
        ))}
      </ul>
    </div>
  )
}

export default MyWeddingPageClient

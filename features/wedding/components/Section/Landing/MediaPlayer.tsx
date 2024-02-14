'use client'

import type { Music, Wedding, WeddingGalleryUpload } from '@wedding/schema'
import { type ChangeEvent, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useLocale, useTranslations } from 'next-intl'
import { uploadWeddingSongQuery } from '@wedding/query'
import { QueryWedding, WeddingConfig } from '@wedding/config'
import { useWeddingDetail } from '@/tools/hook'
import { blobToUri, cleaner } from '@/tools/helpers'
import Toast from '@/components/Notification/Toast'
import Spinner from '@/components/Loading/Spinner'
import FieldText from '@/components/FormField/Text'
import FieldGroup from '@/components/FormField/Group'

type LandingMediaPlayerProps = {
  isRemoving?: boolean
}

const LandingMediaPlayer: RF<LandingMediaPlayerProps> = ({ isRemoving }) => {
  const queryClient = useQueryClient()
  const locale = useLocale()
  const toast = new Toast()
  const t = useTranslations()
  const maxSizeInMega = WeddingConfig.MaxFileSize * 1000
  const maxSizeText = `${WeddingConfig.MaxFileSize}`.charAt(0) + ' MB'
  const detail = useWeddingDetail()
  const { isLoading, mutate: uploadSong } = useMutation<
    Music,
    unknown,
    WeddingGalleryUpload & { fileId?: string }
  >({
    mutationFn: (payload) => {
      return uploadWeddingSongQuery(detail.wid, locale, payload)
    },
    onSuccess: (music) => {
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, music })
      )
    },
    onError: (e) => {
      if ((e as Error)?.message.includes('AbortError')) {
        return
      }

      toast.error(t('error.general.failedToUpload', { name: t('def.song') }))
    },
  })

  const [error, setError] = useState('')

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files.length) return

    const file = e.target.files[0]
    setError('')

    if (file.size > maxSizeInMega) {
      setError(t('error.field.invalidFileSize', { size: maxSizeText }))
      return (e.target.value = '')
    }

    const payload = {
      fileName: file.name,
      file: await blobToUri(file),
      path: detail.name,
    }

    uploadSong(cleaner(payload))
  }

  return (
    <FieldGroup title='Lagu' classNames={{ root: 'pt-6 pb-1' }}>
      {!detail.music || isRemoving ? (
        isRemoving || isLoading ? (
          <div className='flex h-[76px] w-full items-center justify-center rounded-md border border-zinc-300 [.dark_&]:border-zinc-700'>
            <Spinner />
          </div>
        ) : (
          <FieldText
            label='Upload'
            name='song'
            type='file'
            accept='audio/mpeg'
            onChange={onChange}
            errorMessage={error}
          />
        )
      ) : (
        <audio
          className='w-full'
          controls
          src={(process.env.NEXT_PUBLIC_IMAGEKIT_URL ?? '') + detail.music.path}
        />
      )}
    </FieldGroup>
  )
}

export default LandingMediaPlayer

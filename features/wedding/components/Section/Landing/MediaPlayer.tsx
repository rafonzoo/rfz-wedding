'use client'

import type { Music, Wedding, WeddingGalleryUpload } from '@wedding/schema'
import { type ChangeEvent, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useLocale } from 'next-intl'
import { uploadWeddingSongQuery } from '@wedding/query'
import { blobToUri, cleaner, exact } from '@/tools/helper'
import { Queries } from '@/tools/config'
import Spinner from '@/components/Loading/Spinner'
import FieldText from '@/components/Field/Text'
import FieldGroup from '@/components/Field/Group'

const MAX_AUDIO_SIZE = 2048

type LandingMediaPlayerProps = {
  isRemoving?: boolean
}

const LandingMediaPlayer: RF<LandingMediaPlayerProps> = ({ isRemoving }) => {
  const queryClient = useQueryClient()
  const locale = useLocale()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const {
    isLoading,
    error: uploadError,
    mutate: uploadSong,
  } = useMutation<Music, unknown, WeddingGalleryUpload & { fileId?: string }>({
    mutationFn: (payload) => uploadWeddingSongQuery(locale, payload),
    onSuccess: (music) => {
      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, music })
      )
    },
  })

  const [error, setError] = useState('')

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files.length) return

    const file = e.target.files[0]
    setError('')

    if (file.size > MAX_AUDIO_SIZE * 1000) {
      setError('File size should below 2MB.')
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
          <div className='flex h-[76px] w-full items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700'>
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

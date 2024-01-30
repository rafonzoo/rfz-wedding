import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { weddingGalleryType, weddingGalleryUploadType } from '@wedding/schema'
import { authorizationQuery } from '@account/query'
import { supabaseServer, zodLocale } from '@/tools/server'
import { djs } from '@/tools/lib'
import { delay, retina, uploads } from '@/tools/helper'
import { AppError } from '@/tools/error'
import { AppConfig, ErrorMap } from '@/tools/config'
import ImageKit from 'imagekit'

function imagekit() {
  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_KEY ?? '',
    privateKey: process.env.NEXT_PRIVATE_IMAGEKIT_KEY ?? '',
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL ?? '',
  })
}

export async function GET(request: NextRequest) {
  try {
    const { z, t } = await zodLocale(request)

    if (!(await authorizationQuery(supabaseServer()))) {
      throw new AppError(ErrorMap.authError, t('error.photo.failedToFetch'))
    }

    const requestUrl = new URL(request.url)
    const path = z.string().parse(requestUrl.searchParams.get('path'))

    const lists = await imagekit().listFiles({
      path: uploads(`/${path}`),
      fileType: 'image',
    })

    if (lists.$ResponseMetadata.statusCode !== 200) {
      throw new AppError(ErrorMap.internalError, t('error.photo.failedToFetch'))
    }

    const images = lists.map(({ filePath, name, fileId }) => ({
      thumbnail: retina(filePath).thumbnail,
      name,
      fileId,
    }))

    return NextResponse.json({ data: images })
  } catch (e) {
    return NextResponse.json(
      {
        data: null,
        message: (e as Error)?.message,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { z, t } = await zodLocale(request)
    const json = await request.json()
    const payload = weddingGalleryUploadType
      .merge(
        z.object({
          isAudio: z.boolean().optional(),
          cancelable: z.boolean().optional(),
          wid: z.string(),
        })
      )
      .parse(json)

    if (payload.cancelable) {
      await delay(AppConfig.Timeout.TimeBeforeCancel)
      /**
       * Manually throw signal
       */
      request.signal.throwIfAborted()
    }

    const file = await imagekit().upload({
      file: payload.file,
      fileName: payload.fileName,
      useUniqueFileName: false,
      folder: uploads(`/${payload.path}`),
    })

    if (file.$ResponseMetadata.statusCode !== 200) {
      throw new AppError(
        ErrorMap.internalError,
        t('error.photo.failedToUpload')
      )
    }

    if (payload.isAudio) {
      const music = {
        path: uploads(`/${payload.path}/${file.name}`),
        fileId: file.fileId,
      }

      const supabase = supabaseServer()
      const { data, error } = await supabase
        .from('wedding')
        .update({ music, updatedAt: djs().toISOString() })
        .eq('wid', payload.wid)
        .select('music')
        .single()

      if (!data || error) {
        throw new AppError(ErrorMap.internalError, error?.message)
      }

      return NextResponse.json({ data: music })
    }

    const { thumbnail } = retina(file.filePath)
    const image = {
      thumbnail,
      fileId: file.fileId,
      name: file.name,
    }

    return NextResponse.json({ data: image })
  } catch (e) {
    return NextResponse.json(
      {
        data: null,
        message: (e as Error)?.message,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await delay(AppConfig.Timeout.TimeBeforeCancel)
    request.signal.throwIfAborted()

    const { z } = await zodLocale(request)
    const requestUrl = new URL(request.url)
    const fileId = z.string().parse(requestUrl.searchParams.get('id'))
    const wid = z.string().parse(requestUrl.searchParams.get('wid'))

    const supabase = supabaseServer()
    const { data: previous } = await supabase
      .from('wedding')
      .select('*')
      .eq('wid', wid)
      .contains('galleries', JSON.stringify([{ fileId }]))
      .single()

    if (previous) {
      await supabaseServer()
        .from('wedding')
        .update({
          ...previous,
          galleries: weddingGalleryType
            .array()
            .parse(previous.galleries)
            .filter((item) => weddingGalleryType.parse(item).fileId !== fileId),
        })
        .eq('wid', previous.wid)
    }

    await imagekit().deleteFile(fileId)

    return NextResponse.json({ data: fileId })
  } catch (e) {
    return NextResponse.json(
      {
        data: null,
        message: (e as Error)?.message,
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { z } = await zodLocale(request)
    const requestUrl = new URL(request.url)
    const fileId = z.string().parse(requestUrl.searchParams.get('fileId'))
    const wid = z.string().parse(requestUrl.searchParams.get('wid'))

    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('wedding')
      .update({ music: null, updatedAt: djs().toISOString() })
      .eq('wid', wid)
      .select('music')
      .single()

    if (!data || error) {
      throw new AppError(ErrorMap.internalError, error?.message)
    }

    await imagekit().deleteFile(fileId)

    return NextResponse.json({ data: null })
  } catch (e) {
    return NextResponse.json(
      {
        data: null,
        message: (e as Error)?.message,
      },
      { status: 500 }
    )
  }
}

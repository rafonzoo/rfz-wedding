import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { weddingGalleryType, weddingGalleryUploadType } from '@wedding/schema'
import { WEDDING_ROW } from '@wedding/query'
import { authorizationQuery } from '@account/query'
import { supabaseServer, zodLocale } from '@/tools/server'
import { djs } from '@/tools/lib'
import { retina, uploads } from '@/tools/helper'
import { AppError } from '@/tools/error'
import { ErrorMap } from '@/tools/config'
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
      throw new AppError(
        ErrorMap.authError,
        t('error.general.failedToLoad', { name: t('def.photo') })
      )
    }

    const requestUrl = new URL(request.url)
    const path = z.string().parse(requestUrl.searchParams.get('path'))

    const lists = await imagekit().listFiles({
      path: uploads(`/${path}`),
      fileType: 'image',
    })

    if (lists.$ResponseMetadata.statusCode !== 200) {
      throw new AppError(
        ErrorMap.internalError,
        t('error.general.failedToLoad', { name: t('def.photo') })
      )
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
          wid: z.string(),
        })
      )
      .parse(json)

    const file = await imagekit().upload({
      file: payload.file,
      fileName: payload.fileName,
      folder: uploads(`/${payload.path}`),
    })

    if (file.$ResponseMetadata.statusCode !== 200) {
      throw new AppError(
        ErrorMap.internalError,
        t('error.general.failedToUpload', {
          name: payload.isAudio ? t('def.song') : t('def.photo'),
        })
      )
    }

    if (payload.isAudio) {
      const music = {
        path: uploads(`/${payload.path}/${file.name}`),
        fileId: file.fileId,
      }

      const supabase = supabaseServer()
      const { data, error } = await supabase
        .from(WEDDING_ROW)
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
    const { z } = await zodLocale(request)
    const requestUrl = new URL(request.url)
    const wid = z.string().parse(requestUrl.searchParams.get('wid'))
    const supabase = supabaseServer()
    const paramsPath = requestUrl.searchParams.get('path')

    if (paramsPath) {
      try {
        const { data } = await supabase.auth.getSession()
        const path = z
          .string()
          .optional()
          .parse(requestUrl.searchParams.get('path'))

        if (data.session) {
          await imagekit().deleteFolder(uploads(`/${path}`))
        }
      } catch (e) {
        //
      }

      return NextResponse.json({ data: '' })
    }

    const fileId = z.string().parse(requestUrl.searchParams.get('id'))
    const { data: previous } = await supabase
      .from(WEDDING_ROW)
      .select('*')
      .eq('wid', wid)
      .contains('galleries', JSON.stringify([{ fileId }]))
      .single()

    if (previous) {
      await supabaseServer()
        .from(WEDDING_ROW)
        .update({
          ...previous,
          galleries: weddingGalleryType
            .array()
            .parse(previous.galleries)
            .filter((item) => weddingGalleryType.parse(item).fileId !== fileId),
        })
        .eq('wid', previous.wid)
    }

    try {
      // Image might be deleted somewhere
      await imagekit().deleteFile(fileId)
    } catch (e) {}

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
      .from(WEDDING_ROW)
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

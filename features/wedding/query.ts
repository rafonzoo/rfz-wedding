import type {
  Comment,
  Guest,
  WeddingCouple,
  WeddingEvent,
  WeddingGallery,
  WeddingGalleryUpload,
  WeddingLoadout,
} from '@wedding/schema'
import {
  commentType,
  guestType,
  musicType,
  weddingEventAddressType,
  weddingEventTimeType,
  weddingEventType,
  weddingLoadoutType,
  weddingType,
} from '@wedding/schema'
import { djs, supabaseClient } from '@/tools/lib'
import { cleaner, exact, qstring } from '@/tools/helper'
import { AppError } from '@/tools/error'
import { AppConfig, ErrorMap, RouteApi, RouteHeader } from '@/tools/config'
import { DUMMY_INVITATION } from '@/dummy'

// prettier-ignore
export const WEDDING_ROW = AppConfig.Column[process.env.NEXT_PUBLIC_SITE_ENV as 'development']

// prettier-ignore
export const WEDDING_COLUMN = 'wid,userId,status,name,displayName,createdAt,updatedAt,stories,music,couple,loadout,galleries,events,surprise' as const

export const deleteWeddingQuery = async ({
  path,
  wid,
  signal,
}: {
  path: string
  wid: string
  signal: AbortSignal
}) => {
  const deleteStorage = await fetch(qstring({ wid, path }, RouteApi.uploads), {
    method: 'DELETE',
  })

  if (!deleteStorage.ok) {
    throw new AppError(ErrorMap.internalError)
  }

  const supabase = supabaseClient()
  const { error: deleteError } = await supabase
    .from(WEDDING_ROW)
    .delete()
    .abortSignal(signal)
    .eq('wid', wid)

  if (deleteError) {
    throw new AppError(ErrorMap.internalError, deleteError?.message)
  }

  return wid
}

export const addNewWeddingQuery = async ({
  uid,
  name,
  signal,
}: {
  uid: string
  name: string
  signal: AbortSignal
}) => {
  const supabase = supabaseClient()
  const { data: current, error: queryError } = await supabase
    .from(WEDDING_ROW)
    .select('name,status')
    .abortSignal(signal)
    .eq('userId', uid)

  if (queryError || !current) {
    const abortError = queryError.code === '20'

    throw new AppError(
      abortError ? ErrorMap.abortError : ErrorMap.internalError,
      abortError ? void 0 : queryError.message
    )
  }

  if (current.map((c) => c.name).some((n) => n === name)) {
    throw new AppError(ErrorMap.duplicateError)
  }

  if (
    current.filter((c) => c.status === 'draft').length ===
    AppConfig.Wedding.MaxDraft
  ) {
    throw new AppError(ErrorMap.limitError)
  }

  const invitation = { ...DUMMY_INVITATION, name }
  const { data: newWedding, error: insertError } = await supabase
    .from(WEDDING_ROW)
    .insert(invitation)
    .select(WEDDING_COLUMN)
    .abortSignal(signal)
    .single()

  if (insertError || !newWedding) {
    const abortError = insertError.code === '20'

    throw new AppError(
      abortError ? ErrorMap.abortError : ErrorMap.internalError,
      abortError ? void 0 : insertError.message
    )
  }

  return weddingType.parse({ ...newWedding, guests: [], comments: [] })
}

export const getAllWeddingQuery = async (
  supabase: ReturnType<typeof supabaseClient>,
  uid: string
) => {
  const { data: current, error } = await supabase
    .from(WEDDING_ROW)
    .select(WEDDING_COLUMN)
    .eq('userId', uid)

  if (error || !current) {
    return null
  }

  const currentArray = current.map((item) => ({
    ...item,
    guests: [],
    comments: [],
  }))

  return weddingType.array().parse(currentArray)
}

export const detailWeddingQuery = async (
  supabase: ReturnType<typeof supabaseClient>,
  wid: string
) => {
  const { data: detail, error: queryError } = await supabase
    .from(WEDDING_ROW)
    .select(WEDDING_COLUMN)
    .eq('wid', wid)
    .single()

  if (queryError || !detail) {
    return null
  }

  return weddingType.parse({ ...detail, guests: [], comments: [] })
}

export const updateWeddingLoadoutQuery = async ({
  wid,
  signal,
  loadout,
}: {
  wid: string
  signal: AbortSignal
  loadout: WeddingLoadout
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ loadout, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('loadout')
    .single()

  if (error || !data.loadout) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return weddingLoadoutType.parse(data.loadout)
}

export const updateWeddingGalleryQuery = async ({
  wid,
  signal,
  galleries,
  errorText,
}: {
  wid: string
  signal: AbortSignal
  galleries: WeddingGallery[]
  errorText: string
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ galleries, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('galleries')
    .single()

  if (error || !data.galleries) {
    throw new AppError(ErrorMap.internalError, errorText)
  }

  return weddingType.shape.galleries.parse(data.galleries)
}

export const updateWeddingCouplesQuery = async ({
  wid,
  signal,
  couple,
}: {
  wid: string
  signal: AbortSignal
  couple: WeddingCouple[]
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ couple, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('couple')
    .single()

  if (error || !data.couple) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return weddingType.shape.couple.parse(data.couple)
}

export const addNewWeddingCommentQuery = async (
  locale: string,
  name: string,
  comment: Comment & { token: string },
  csrfToken?: string
) => {
  const response = await fetch(qstring({ name, locale }, RouteApi.comment), {
    method: 'POST',
    headers: { [RouteHeader.csrf]: csrfToken ?? '' },
    body: JSON.stringify(comment),
  })

  const json = (await response.json()) as {
    data: unknown
    message?: string
  }

  if (response.ok) {
    return commentType.parse(json.data)
  }

  throw new Error(json.message)
}

export const getAllWeddingCommentQuery = async (
  locale: string,
  name: string,
  token?: string
) => {
  const response = await fetch(qstring({ name, locale }, RouteApi.comment), {
    headers: cleaner({ [RouteHeader.csrf]: token ?? '' }),
  })

  const json = (await response.json()) as {
    data: unknown
    message?: string
  }

  if (response.ok) {
    return { comments: commentType.array().parse(json.data) }
  }

  throw new Error(json.message)
}

export const removeWeddingCommentQuery = async (
  locale: string,
  wid: string,
  { alias }: { alias: string }
) => {
  const response = await fetch(qstring({ wid, locale }, RouteApi.comment), {
    method: 'PATCH',
    body: JSON.stringify({ alias }),
  })

  const json = (await response.json()) as {
    data: unknown
    message?: string
  }

  if (response.ok) {
    return commentType
      .omit({ text: true, isComing: true, token: true })
      .parse(json.data)
  }

  throw new Error(json.message)
}

export const updateWeddingEventDateQuery = async ({
  wid,
  id,
  signal,
  payload,
}: {
  id: number
  wid: string
  signal: AbortSignal
  payload: WeddingEvent[]
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ events: payload, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('events')
    .single()

  if (error || !data.events) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  const updatedEvents = weddingEventType.array().parse(data.events)
  const updatedEvent = exact(updatedEvents.find((event) => event.id === id))

  return weddingEventAddressType
    .merge(weddingEventType.pick({ date: true }))
    .parse(updatedEvent)
}

export const updateWeddingEventTimeQuery = async ({
  wid,
  id,
  signal,
  payload,
}: {
  id: number
  wid: string
  signal: AbortSignal
  payload: WeddingEvent[]
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ events: payload, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('events')
    .single()

  if (error || !data.events) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  const updatedEvents = weddingEventType.array().parse(data.events)
  const updatedEvent = exact(updatedEvents.find((event) => event.id === id))

  return weddingEventTimeType.parse(updatedEvent)
}

export const updateWeddingEventQuery = async ({
  wid,
  signal,
  payload,
}: {
  wid: string
  signal: AbortSignal
  payload: WeddingEvent[]
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ events: payload, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('events')
    .single()

  if (error || !data.events) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return weddingEventType.array().parse(data.events)
}

export const getAllWeddingGuestQuery = async ({
  signal,
  wid,
}: {
  signal: AbortSignal
  wid: string
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .select('guests')
    .abortSignal(signal)
    .eq('wid', wid)
    .single()

  if (error || !data.guests) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return guestType.array().parse(data.guests)
}

export const updateWeddingGuestQuery = async ({
  signal,
  wid,
  payload,
}: {
  signal: AbortSignal
  wid: string
  payload: Guest[]
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ guests: payload, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('guests')
    .single()

  if (error || !data) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return guestType.array().parse(data.guests)
}

export const uploadWeddingSongQuery = async (
  wid: string,
  locale: string,
  payload: WeddingGalleryUpload
) => {
  const response = await fetch(qstring({ locale }, RouteApi.uploads), {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ isAudio: true, wid, ...payload }),
  })

  const json = (await response.json()) as { data: unknown }
  return musicType.parse(json.data)
}

export const deleteWeddingSongQuery = async (
  locale: string,
  fileId: string,
  wid: string
) => {
  const response = await fetch(
    qstring(
      {
        wid,
        fileId,
        locale,
      },
      RouteApi.uploads
    ),
    {
      method: 'PATCH',
    }
  )

  const json = (await response.json()) as { data: null }
  return json.data
}

export const updateWeddingDisplayNameQuery = async ({
  wid,
  signal,
  displayName,
}: {
  signal: AbortSignal
  wid: string
  displayName: string
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ displayName, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('displayName')
    .single()

  if (error || !data.displayName) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return data.displayName as string
}

export const updateWeddingStoriesQuery = async ({
  wid,
  signal,
  stories,
}: {
  wid: string
  signal: AbortSignal
  stories: string
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ stories, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('stories')
    .single()

  if (error || !data) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return data.stories
}

export const updateWeddingSurpriseQuery = async ({
  wid,
  signal,
  surprise,
}: {
  wid: string
  signal: AbortSignal
  surprise: string
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ surprise, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('surprise')
    .single()

  if (error || !data) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return data.surprise
}

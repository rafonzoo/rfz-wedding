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
import { ErrorMap, RouteApi, RouteHeader } from '@/tools/config'
import { DUMMY_INVITATION, DUMMY_WEDDING_NAME } from '@/dummy'

// prettier-ignore
export const WEDDING_COLUMN = 'wid,userId,status,name,displayName,createdAt,updatedAt,stories,music,couple,loadout,galleries,events,surprise' as const

export const getAllWeddingQuery = async (
  supabase: ReturnType<typeof supabaseClient>
) => {
  const { data: auth, error: authError } = await supabase.auth.getUser()
  if (authError || !auth) {
    return null
  }

  const { data: current, error } = await supabase
    .from('wedding')
    .select(WEDDING_COLUMN)
    .eq('userId', auth.user.id)

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
    .from('wedding')
    .select(WEDDING_COLUMN)
    .eq('wid', wid)
    .single()

  if (queryError || !detail) {
    return null
  }

  return weddingType.parse({ ...detail, guests: [], comments: [] })
}

export const addNewWeddingQuery = async () => {
  const MAX_DRAFT = 3

  const supabase = supabaseClient()
  const { data: current, error: queryError } = await supabase
    .from('wedding')
    .select('name')

  if (queryError || !current) {
    throw new AppError(ErrorMap.internalError, queryError.message)
  }

  if (current.length === MAX_DRAFT) {
    throw new AppError(ErrorMap.limitError)
  }

  // Generate current name with suffix `-{number}`
  // Incoming would be example: claire-leon-1
  const integer = +(current[current.length - 1]?.name?.split('-')[2] ?? '1')
  const name = [DUMMY_WEDDING_NAME, integer + 1]
    .filter((itm) => (!current.length ? typeof itm === 'string' : true))
    .join('-')

  const invitation = { ...DUMMY_INVITATION, name }
  const { data: newWedding, error: insertError } = await supabase
    .from('wedding')
    .insert(invitation)
    .select(WEDDING_COLUMN)
    .single()

  if (insertError || !newWedding) {
    throw new AppError(ErrorMap.internalError, insertError?.message)
  }

  return weddingType.parse({ ...newWedding, guests: [], comments: [] })
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
    .from('wedding')
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
    .from('wedding')
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
    .from('wedding')
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
    return commentType.omit({ text: true }).parse(json.data)
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
    .from('wedding')
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
    .from('wedding')
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
    .from('wedding')
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
    .from('wedding')
    .select('guests')
    .abortSignal(signal)
    .eq('wid', wid)
    .single()

  if (error || !data.guests) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return guestType.array().parse(data.guests)
}

export const addNewWeddingGuestQuery = async ({
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
    .from('wedding')
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
  locale: string,
  payload: WeddingGalleryUpload
) => {
  const response = await fetch(qstring({ locale }, RouteApi.uploads), {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ cancelable: false, isAudio: true, ...payload }),
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
    .from('wedding')
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
    .from('wedding')
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
    .from('wedding')
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

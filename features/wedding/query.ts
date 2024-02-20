import type {
  Guest,
  Payment,
  PaymentToken,
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
  paymentType,
  weddingEventAddressType,
  weddingEventTimeType,
  weddingEventType,
  weddingLoadoutType,
  weddingType,
} from '@wedding/schema'
import { WeddingConfig } from '@wedding/config'
import { djs, supabaseClient } from '@/tools/lib'
import { exact, qstring } from '@/tools/helpers'
import { AppError } from '@/tools/error'
import { AppConfig, ErrorMap, RouteApi } from '@/tools/config'
import { DUMMY_INVITATION } from '@/dummy'

// prettier-ignore
export const WEDDING_ROW = AppConfig.Column[process.env.NEXT_PUBLIC_SITE_ENV as 'development']

// prettier-ignore
export const WEDDING_COLUMN = 'wid,userId,status,name,displayName,createdAt,updatedAt,stories,music,couple,loadout,galleries,events,surprise,payment,comments' as const

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
    WeddingConfig.MaxDraft
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

  return weddingType.parse({ ...newWedding, guests: [] })
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

  return weddingType.parse({ ...detail, guests: [] })
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
    const abortError = error?.code === '20'

    throw new AppError(
      abortError ? ErrorMap.abortError : ErrorMap.internalError,
      abortError ? void 0 : errorText
    )
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

export const deleteWeddingCommentQuery = async ({
  wid,
  alias,
  index: deletedIndex,
}: {
  wid: string
  alias: string
  index?: number
}) => {
  const supabase = supabaseClient()
  const { data: prevData, error: prevDataError } = await supabase
    .from(WEDDING_ROW)
    .select('comments')
    .eq('wid', wid)
    .single()

  if (prevDataError) {
    throw new AppError(ErrorMap.internalError, prevDataError?.message)
  }

  const previousComment = commentType.array().parse(prevData.comments)
  const { error } = await supabase
    .from(WEDDING_ROW)
    .update({
      updatedAt: djs().toISOString(),
      comments: deletedIndex
        ? [...previousComment.filter((e, index) => index !== deletedIndex)]
        : [
            ...previousComment.filter(
              (item) => decodeURI(item.alias) !== alias
            ),
          ],
    })
    .eq('wid', wid)

  if (error) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return { alias, index: deletedIndex }
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

export const validateWeddingQuery = async (wid: string) => {
  const response = await fetch(qstring({ wid }, RouteApi.transaction))

  if (!response.ok) {
    throw new AppError(ErrorMap.internalError, response.statusText)
  }

  const json = (await response.json()) as { data: unknown }
  return json.data as PaymentToken
}

export const paymentWeddingQuery = async ({
  wid,
  payment,
  user,
}: {
  wid: string
  payment: Omit<Payment, 'transaction'>
  user: { email: string; name: string }
}) => {
  const response = await fetch(RouteApi.transaction, {
    method: 'POST',
    body: JSON.stringify({ payment, wid, user }),
  })

  if (!response.ok) {
    throw new AppError(ErrorMap.internalError, response.statusText)
  }

  const json = (await response.json()) as { data: unknown }
  return json.data as PaymentToken
}

export const checkoutWeddingQuery = async ({
  wid,
  signal,
  payment,
}: {
  wid: string
  signal: AbortSignal
  payment: Payment[]
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ payment, status: 'live', updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('payment')
    .single()

  if (error || !data) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return paymentType.array().parse(data.payment)
}

export const updateStatusWeddingQuery = async ({
  wid,
  signal,
  status,
}: {
  wid: string
  signal: AbortSignal
  status: 'live' | 'draft'
}) => {
  const supabase = supabaseClient()
  const { data, error } = await supabase
    .from(WEDDING_ROW)
    .update({ status, updatedAt: djs().toISOString() })
    .abortSignal(signal)
    .eq('wid', wid)
    .select('status')
    .single()

  if (error || !data) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return weddingType.shape.status.parse(data.status)
}

import { zodClient } from '@/tools/lib'

const z = zodClient()

export const invitationStatusType = ['live', 'draft'] as const
export const invitationThemesType = ['autumn', 'tropical'] as const

export const specialColorType = ['rainbow', 'unity', 'fall'] as const
export const defaultColorType = [
  'red',
  'pink',
  'blue',
  'sky',
  'indigo',
  'teal',
  'yellow',
  'amber',
  'rose',
  'violet',
  'purple',
  'emerald',
  'green',
  'lime',
  'orange',
  'cyan',
  'fuchsia',
] as const

export type Color = Infer<typeof colorType>
export const colorType = z.enum([...specialColorType, ...defaultColorType])

/** ====================================================================== */

export type WeddingGalleries = Infer<typeof weddingGalleriesType>
export const weddingGalleriesType = z.object({
  thumbnail: z.string(),
  name: z.string(),
  fileId: z.string(),
})

export type WeddingGallery = Infer<typeof weddingGalleryType>
export const weddingGalleryType = z.object({
  index: z.number(),
  fileName: z.string(),
  fileId: z.string(),
  coordinate: z.string(),
})

export type WeddingGalleryUpload = Infer<typeof weddingGalleryUploadType>
export const weddingGalleryUploadType = weddingGalleryType
  .omit({ fileId: true, index: true, coordinate: true })
  .merge(
    z.object({
      file: z.string(),
      path: z.string(),
    })
  )

export type WeddingGalleryRemove = Infer<typeof weddingGalleryRemoveType>
export const weddingGalleryRemoveType = z.string().array()

export type WeddingSocialUrl = Infer<typeof weddingSocialUrlType>
export const weddingSocialUrls = ['facebook', 'twitter', 'instagram'] as const
export const weddingSocialUrlType = z.object({
  name: z.enum(weddingSocialUrls),
  url: z.string().url(),
})

export type WeddingCouple = Infer<typeof weddingCoupleType>
export const weddingCoupleType = z.object({
  id: z.number(),
  fullName: z.string().min(3).max(99),
  nameOfFather: z.string().min(3).max(99),
  nameOfMother: z.string().min(3).max(99),
  order: z.number().min(1).max(99),
  socialUrl: z.object({
    facebook: z.string().url().or(z.string().length(0)).optional(),
    twitter: z.string().url().or(z.string().length(0)).optional(),
    instagram: z.string().url().or(z.string().length(0)).optional(),
  }),
})

export type WeddingEventAddress = Infer<typeof weddingEventAddressType>
export const weddingEventAddressType = z.object({
  placeName: z.string().min(3).max(28),
  district: z.string().min(3).max(18),
  province: z.string().min(3).max(18),
  detail: z.string().min(10),
  opensTo: z.string(),
})

export type WeddingEventTime = Infer<typeof weddingEventTimeType>
export const weddingEventTimeType = z.object({
  eventName: z.string().min(3),
  timeStart: z.string(),
  timeEnd: z.string(),
  localTime: z.string(),
})

export type WeddingEvent = Infer<typeof weddingEventType>
export const weddingEventType = weddingEventAddressType
  .merge(weddingEventTimeType)
  .merge(
    z.object({
      id: z.number(),
      date: z.string().datetime(),
    })
  )

export type WeddingLoadout = Infer<typeof weddingLoadoutType>
export const weddingLoadoutType = z.object({
  theme: z.enum(invitationThemesType),
  foreground: colorType,
  background: z.enum(['black', 'white']),
})

export type RSVP = Infer<typeof rsvpType>
export const rsvpType = z.object({
  attendance: z.boolean(),
  length: z.number().max(5),
  message: z.string().min(3).optional(),
  validGuest: z.boolean().optional(),
})

export type Guest = Infer<typeof guestType>
export const guestType = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string().min(3).max(60),
  token: z.string().min(6),
  group: z.string().optional(),
})

export type Comment = Infer<typeof commentType>
export const commentType = z.object({
  alias: z.string().min(3),
  text: z.string().min(3),
  token: guestType.shape.token,
  isComing: z.enum(['tbd', 'yes', 'no']),
})

export type Music = Infer<typeof musicType>
export const musicType = z.object({
  path: z.string(),
  fileId: z.string(),
})

export type PaymentTransaction = Infer<typeof paymentTransactionType>
export const paymentTransactionType = z.object({
  order_id: z.string().optional(),
  payment_type: z.string().optional(),
  status_code: z.string().optional(),
  transaction_id: z.string().optional(),
  transaction_time: z.string().optional(),
})

export type PaymentToken = Infer<typeof paymentTokenResponseType>
export const paymentTokenResponseType = z.object({
  token: z.string(),
  redirect_url: z.string().url(),
})

export type Payment = Infer<typeof paymentType>
export const paymentType = z.object({
  id: z.string().uuid(),
  foreverActive: z.boolean(),
  additionalGuest: z.number(),
  amount: z.number(),
  transaction: paymentTransactionType,
})

export type WeddingAdd = Partial<Wedding>
export type Wedding = Infer<typeof weddingType>
export const weddingType = z.object({
  wid: z.string().uuid(),
  userId: z.string().uuid(),
  guests: guestType.array().optional(),
  comments: commentType.array().optional(),
  displayName: z.string(),
  status: z.enum(invitationStatusType),
  name: z.string().min(7).max(21),
  createdAt: z.string(),
  updatedAt: z.string(),
  stories: z.string(),
  music: musicType.nullable(),
  loadout: weddingLoadoutType,
  galleries: weddingGalleryType.array(),
  couple: weddingCoupleType.array(),
  events: weddingEventType.array(),
  surprise: z.string(),
  payment: paymentType.array(),
})

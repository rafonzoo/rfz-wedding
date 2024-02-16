export enum RouteWedding {
  weddingList = '/wedding/list',
  weddingPurchase = '/wedding/purchase',
  weddingEditor = '/wedding/editor/[wid]',
  weddingCouple = '/wedding/couple/[name]',
}

export enum QueryWedding {
  weddingGetAll = '@@wedding/getAll',
  weddingDetail = '@@wedding/detail',
  weddingGuests = '@@wedding/guests',
  weddingComments = '@@wedding/comments',
  weddingGalleries = '@@wedding/galleries',
}

export enum FontFamilyWedding {
  cinzel = 'cinzel',
  poiret = 'poiret',
}

export const WeddingConfig = {
  DateFormat: 'YYYY-MM-DD',
  NewlineSymbol: '--',
  ImageryStartIndex: 100,
  MaxMonthRange: 3,
  MaxEvent: 4,
  MaxDraft: 3,
  MaxFileItem: 13,
  MaxFileSize: 10_240,
  GuestFree: 300,
  GuestMax: 1000,
  PriceTax: 5_000, // Include transfer cost and real tax
  PricePerGuest: 500,
  PriceForever: 799_000,
  Price: 299_000,
} as const

export const ASSETS_PATH = '/assets'

export const UPLOADS_PATH = '/uploads'

import { QueryWedding, RouteWedding } from '@wedding/config'
import { QueryAccount, RouteAccount } from '@account/config'

export enum RouteDefault {
  //
  home = '/',
  notFound = '/404',
}

export const Queries = {
  ...QueryAccount,
  ...QueryWedding,
}

export const Route = {
  ...RouteDefault,
  ...RouteAccount,
  ...RouteWedding,
} as const

export const RoutePublicAuth = [
  Route.accountSignin,
  Route.accountSignup,
] as const

export const RouteProtected = [
  Route.account,
  Route.accountOption,
  Route.wedding,
  Route.weddingEditor,
] as const

export enum RouteApi {
  auth = '/api/auth',
  uploads = '/api/uploads',
  comment = '/api/comment',
}

export enum RouteHeader {
  csrf = 'X-CSRF-Token',
}

export enum RouteCookie {
  csrf = 'csrfToken',
}

export enum ErrorMap {
  limitError = 'LimitError',
  internalError = 'InternalError',
  forbiddenError = 'ForbiddenError',
  abortError = 'AbortError',
  authError = 'AuthError',
  duplicateError = 'DuplicateError',
}

export enum Severity {
  success = 'success',
  error = 'error',
  warning = 'warning',
  info = 'info',
}

export enum Dictionary {
  indonesia = 'id',
  english = 'en',
}

export const Dictionaries = [Dictionary.indonesia, Dictionary.english]

export const DefaultLocale = Dictionary.indonesia

export const ASSETS_PATH = '/assets'

export const UPLOADS_PATH = '/uploads'

export const AppConfig = {
  Column: {
    development: 'wedding',
    staging: 'wedding_stg',
    production: 'wedding_prod',
  },
  Wedding: {
    DateFormat: 'YYYY-MM-DD',
    NewlineSymbol: '--',
    ImageryStartIndex: 100,
    MaxMonthRange: 4,
    MaxEvent: 4,
    MaxDraft: 3,
    MaxFileItem: 13,
    MaxFileSize: 5120,
    GuestFree: 5,
    GuestMax: 1000,
    PricePerGuest: 500,
    PriceForever: 799_000,
    Price: 299_000,
  },
  Timeout: {
    TimeBeforeCancel: 3_000,
    Toast: 5_000,
    Debounce: 1_000,
  },
} as const

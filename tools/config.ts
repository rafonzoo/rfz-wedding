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

export const RouteNavigation = [
  Route.home,
  Route.wedding,
  Route.account,
  Route.accountSignin,
] as const

export enum RouteApi {
  auth = '/api/auth',
  uploads = '/api/uploads',
  comment = '/api/comment',
  transaction = '/api/transaction',
}

export enum RouteHeader {
  path = 'X-URL-Path',
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

export const AppConfig = {
  Column: {
    development: 'wedding',
    staging: 'wedding_stg',
    production: 'wedding_prod',
  },
  Timeout: {
    Toast: 5_000,
    Debounce: 2_000,
  },
} as const

import type { Component, ComponentProps, JSX } from 'solid-js'

export type Unarray<T> = T extends Array<infer U> ? U : T

export type Callable<T> = (() => T) | T

export type Nullable<T> = T | null | undefined

export type Children<T = {}> = Component<T & { children?: JSX.Element }>

export type iNavbar = {
  path: string
}

export type iDialog = {
  show: Callable<boolean>
  setShow: (isOpen: boolean) => void
}

export type ForwardRef<
  R extends keyof JSX.IntrinsicElements = 'div',
  T = {}
> = Component<T & Omit<ComponentProps<R>, 'prefix'>>

'use client'

import type { AnimationEvent, MutableRefObject, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { tw } from '@/tools/lib'
import { useFeatureDetection, useMountedEffect } from '@/tools/hook'
import * as Dialog from '@radix-ui/react-dialog'

if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  import('resize-observer-polyfill')
    .then((res) => res.default)
    .then((observer) => {
      window.ResizeObserver = observer
    })
}

const CONTENT_EDITABLE_SELECTOR = [
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[contentEditable=true]:not([tabindex="-1"])',
]

type SheetPropsHeader = {
  append?: ReactNode
  prepend?: ReactNode
  title?: string
  useBorder?: boolean
}

type SheetPropsFooter = {
  append?: ReactNode
  prepend?: ReactNode
  useBorder?: boolean
  useClose?: boolean
  wrapper?: Tag<'div'>
}

type SheetPropsOption = {
  useOverlay?: boolean
  isTransparent?: boolean
  disableFocus?: boolean
  triggerRef?: MutableRefObject<HTMLElement | null>
}

type BottomSheetProps = {
  root?: Dialog.DialogProps
  portal?: Dialog.PortalProps
  content?: Dialog.DialogContentProps
  overlay?: Dialog.DialogOverlayProps
  trigger?: Dialog.DialogTriggerProps
  option?: SheetPropsOption
  header?: SheetPropsHeader
  footer?: SheetPropsFooter
  wrapper?: Tag<'div'>
  onLoad?: () => void
  onCloseClicked?: () => void
}

const BottomSheet: RFZ<BottomSheetProps> = ({
  children,
  root,
  portal,
  content,
  overlay,
  trigger,
  header,
  footer,
  option,
  wrapper,
  onLoad,
  onCloseClicked,
}) => {
  const isOpen = root?.open ?? root?.defaultOpen ?? false

  const [sheetIndex, setSheetIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(isOpen)

  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const focusRef = useRef<HTMLElement | null>(null)
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const headerBorderRef = useRef<HTMLHRElement | null>(null)
  const footerBorderRef = useRef<HTMLHRElement | null>(null)
  const lastPosRef = useRef(0)
  const observerRef = useRef<ResizeObserver | null>(null)
  const { pointerEvent } = useFeatureDetection()
  const isModalNonOverlay =
    !option?.useOverlay && !pointerEvent && !(root?.modal === false)

  useMountedEffect(() => onLoad?.())

  useEffect(() => {
    const fn = (e: Event) => {
      const parentDialog = (e.target as HTMLElement)?.closest('[role=dialog]')

      if (!isAnimating && !parentDialog) {
        root?.onOpenChange?.(false)
        onCloseClicked?.()
      }
    }

    if (isOpen && isModalNonOverlay) {
      document.addEventListener('click', fn)
    }

    return () => document.removeEventListener('click', fn)
  }, [isOpen, isModalNonOverlay, isAnimating, root, onCloseClicked])

  useEffect(() => {
    return () => {
      if (isAnimating) {
        // Avoid sheet can't be closed during
        // hydration on development proccess
        setIsAnimating(false)
      }
    }
  }, [isAnimating])

  useEffect(() => {
    function preventKey(e: KeyboardEvent) {
      e.preventDefault()
    }

    if (isAnimating) {
      document.body.addEventListener('keydown', preventKey)
    } else {
      document.body.removeEventListener('keydown', preventKey)
    }

    return () => {
      document.body.removeEventListener('keydown', preventKey)
    }
  }, [isAnimating])

  // Watch border option.
  useEffect(() => onScrollingBorder(), [footer?.useBorder, header?.useBorder])

  function inputFocus(action: 'addEventListener' | 'removeEventListener') {
    const current = scrollRef.current
    let isTouches = false

    const captureScrollY = () => {
      lastPosRef.current = window.scrollY
      isTouches = true
    }

    const releaseScrollY = () => {
      if (isTouches) {
        window.scroll({ top: lastPosRef.current })
        isTouches = false
      }
    }

    if (!current) {
      return
    }

    const contentEditables = Array.from(
      current.querySelectorAll<HTMLElement>(CONTENT_EDITABLE_SELECTOR.join(','))
    )

    contentEditables.forEach((editable) => {
      editable[action]('touchstart', captureScrollY)
      editable[action]('blur', releaseScrollY)
    })
  }

  function onOpenAutoFocus(e: Event) {
    if (isAnimating) return

    setIsAnimating(true)
    multiSheetIndexCounter()
    inputFocus('addEventListener')
    onScrollHeightChange('observe', onScrollingBorder)

    focusRef.current = document.activeElement as HTMLElement
    sheetRef.current?.classList.add('data-[state=open]:animate-dialog-show')

    e.preventDefault()
    content?.onOpenAutoFocus?.(e)
  }

  function onAnimationEnd(e: AnimationEvent<HTMLDivElement>) {
    !option?.disableFocus &&
      (option?.triggerRef ?? closeButtonRef).current?.focus()

    setIsAnimating(false)
    content?.onAnimationEnd?.(e)
  }

  function onCloseStart() {
    if (isAnimating) return

    sheetRef.current?.classList.remove('data-[state=open]:animate-dialog-show')
    setIsAnimating(true)
    onCloseClicked?.()
  }

  function onCloseAutoFocus(e: Event) {
    setIsAnimating(false)
    inputFocus('removeEventListener')
    onScrollHeightChange('unobserve')

    content?.onCloseAutoFocus?.(e)

    if (!e.defaultPrevented) {
      focusRef.current?.focus()
    }
  }

  function onOpenChange(open: boolean) {
    if (!isAnimating) {
      root?.onOpenChange?.(open)
    }
  }

  function onEscapeKeyDown(e: KeyboardEvent) {
    const activeElement = document.activeElement as HTMLElement

    content?.onEscapeKeyDown?.(e)
    activeElement.blur()

    if (!e.defaultPrevented) {
      onCloseStart?.()
    }
  }

  function onScrollHeightChange(
    method: 'observe' | 'unobserve',
    callback?: (height: number) => void
  ) {
    const { current } = scrollRef

    if (method === 'observe') {
      observerRef.current = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          callback?.(entry.contentRect.height)
        })
      })

      current && observerRef.current.observe(current)
      return
    }

    current && observerRef.current?.unobserve(current)
  }

  function onScrollingBorder(height?: number) {
    const { current } = scrollRef
    if (!current) return

    const { current: top } = headerBorderRef
    const { current: bot } = footerBorderRef

    if (top) {
      top.classList.toggle('invisible', current.scrollTop <= 0)
    }

    if (bot) {
      const h = Math.round(height ?? current.offsetHeight)
      const result = h - Math.floor(current.scrollHeight - current.scrollTop)

      bot.classList.toggle('invisible', result >= 0)
    }
  }

  function multiSheetIndexCounter() {
    const dialogs = Array.from(
      document.querySelectorAll<HTMLDivElement>('[role=dialog]')
    )

    setSheetIndex(
      dialogs.findIndex((dialog) => dialog.id === sheetRef.current?.id)
    )
  }

  return (
    <Dialog.Root {...root} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger {...trigger} />}
      <Dialog.Portal {...portal}>
        {option?.useOverlay && (
          <Dialog.Overlay
            {...overlay}
            asChild={overlay?.asChild ?? true}
            style={{ zIndex: `${998 + sheetIndex}`, ...overlay?.style }}
            tabIndex={overlay?.tabIndex ?? isAnimating ? -1 : 0}
            className={tw(
              'fixed left-0 top-0 z-[777] h-full w-full cursor-auto select-none bg-black/70 will-change-[opacity]',
              'data-[state=open]:animate-fade-in',
              'data-[state=closed]:animate-fade-out',
              overlay?.className
            )}
          >
            <Dialog.Close onClick={onCloseStart} />
          </Dialog.Overlay>
        )}
        <Dialog.Content
          {...content}
          ref={sheetRef}
          data-is-animating={`${isAnimating}`}
          style={{
            zIndex: `${999 + sheetIndex}`,
            backfaceVisibility: 'hidden',
            animationFillMode: 'forwards',
          }}
          className={tw(
            'fixed bottom-0 left-0 right-0 z-[888] flex max-h-[min(906px,96%)] outline-none translate-3d-y-full',
            'data-[state=closed]:animate-dialog-hide',
            !pointerEvent && 'data-[state=open]:animate-dialog-show', // prettier-ignore
            content?.className
          )}
          onOpenAutoFocus={onOpenAutoFocus}
          onAnimationEnd={onAnimationEnd}
          onEscapeKeyDown={onEscapeKeyDown}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <div
            className={tw(
              'relative mx-auto flex w-full max-w-[440px] flex-col rounded-t-2xl',
              !option?.isTransparent ? 'bg-white [.dark_&]:bg-zinc-800 shadow-[0_0_0_1px_rgb(0_0_0_/_25%)]' : 'bg-transparent' // prettier-ignore
            )}
          >
            {header && !option?.isTransparent && (
              <div className='relative rounded-[inherit] bg-white [.dark_&]:bg-zinc-800'>
                <div className='px-6 pb-3 pt-4'>
                  <div className='absolute left-3 top-4 text-blue-600 [.dark_&]:text-blue-400'>
                    {header?.prepend}
                  </div>
                  <div className='text-center font-semibold'>
                    {header?.title ?? 'Title here'}
                  </div>
                  <div className='absolute right-3 top-4 text-blue-600 [.dark_&]:text-blue-400'>
                    {header?.append}
                  </div>
                </div>
                <hr
                  ref={headerBorderRef}
                  className={tw('border-zinc-300 [.dark_&]:border-zinc-700', {
                    invisible: header?.useBorder === false,
                    '!visible': header?.useBorder === true,
                  })}
                />
              </div>
            )}
            <div
              {...wrapper}
              ref={scrollRef}
              onScroll={(e) => {
                onScrollingBorder()
                wrapper?.onScroll?.(e)
              }}
              className={tw(
                'max-h-full overflow-y-auto translate-z-0 overflow-touch',
                wrapper?.className
              )}
            >
              {children}
            </div>
            {footer && (
              <div
                className={tw(
                  'sticky bottom-0 translate-z-0',
                  content?.className?.includes('h-') && 'mt-auto'
                )}
              >
                <hr
                  ref={footerBorderRef}
                  className={tw(
                    'border-zinc-300 [.dark_&]:border-zinc-700',
                    footer?.useBorder && '!visible'
                  )}
                />
                <div
                  {...footer.wrapper}
                  className={tw(
                    'mt-auto grid px-4 pb-6 pt-4',
                    footer.wrapper?.className
                  )}
                >
                  {footer.prepend}
                  {footer?.useClose && (
                    <Dialog.Close
                      ref={closeButtonRef}
                      aria-label='Close sheet'
                      onClick={onCloseStart}
                      className={tw(
                        'flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-500 [.dark_&]:bg-zinc-700 [.dark_&]:text-zinc-400',
                        !(footer.append || footer.prepend) && 'mx-auto'
                      )}
                    >
                      <IoClose />
                    </Dialog.Close>
                  )}
                  {footer.append}
                </div>
              </div>
            )}
          </div>
          {/* <div
            className={tw(
              'absolute left-1/2 top-full h-[200%] w-full max-w-[440px] -translate-x-1/2',
              !option?.isTransparent && 'bg-white'
            )}
          /> */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export type { BottomSheetProps }

export default BottomSheet

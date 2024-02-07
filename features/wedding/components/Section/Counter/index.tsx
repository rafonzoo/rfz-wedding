'use client'

import type { Guest, Payment, Wedding } from '@wedding/schema'
import { useRef, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useLocale } from 'next-intl'
import { FaPause, FaPlay } from 'react-icons/fa'
import { tw } from '@/tools/lib'
import { useIsEditorOrDev, useMountedEffect } from '@/tools/hook'
import { exact, price } from '@/tools/helper'
import { AppConfig, Queries } from '@/tools/config'
import dynamic from 'next/dynamic'
import Spinner from '@/components/Loading/Spinner'
import FieldGroup from '@/components/Field/Group'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const SectionPayment = () => {
  const [isFetching, setIsFetching] = useState(false)
  const [activeTime, setActiveTime] = useState(1)
  const [guestLength, setGuestLength] = useState(0)
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const currentGuest = queryClient.getQueryData<Guest[]>(Queries.weddingGuests)
  const totalGuest = guestLength - AppConfig.Wedding.FreeGuest
  const paidGuest = totalGuest <= 0 ? 0 : totalGuest
  const priceGuest = paidGuest * AppConfig.Wedding.PricePerGuest
  const priceActive = activeTime * AppConfig.Wedding.PriceForever
  const priceTotal = AppConfig.Wedding.Price + priceActive + priceGuest
  const locale = useLocale()

  // Get the latest payment if they already purchase
  // prettier-ignore
  const payment: Payment | null = (
    detail.payment[detail.payment.length - 1] ?? null
  )

  return (
    <BottomSheet
      header={{ title: 'Checkout' }}
      option={{ useOverlay: true }}
      footer={{
        useClose: true,
        wrapper: { className: tw('!flex space-x-4') },
        append: (
          <button className='mx-auto inline-flex flex-grow items-center justify-center overflow-hidden rounded-lg bg-blue-600 font-semibold text-white transition-colors duration-300 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:[.dark_&]:bg-zinc-700 disabled:[.dark_&]:text-zinc-600'>
            Bayar
          </button>
        ),
      }}
      content={{
        onCloseAutoFocus: () => setActiveTime(1),
        onOpenAutoFocus: () => {
          if (!currentGuest) {
            setIsFetching(true)
            queryClient
              .refetchQueries({ queryKey: Queries.weddingGuests })
              .finally(() => setIsFetching(false))
              .then(() => {
                const guests = queryClient.getQueryData<Guest[]>(
                  Queries.weddingGuests
                )

                if (!guests?.length) {
                  return
                }

                setGuestLength(guests.length)
                queryClient.setQueryData<Wedding | undefined>(
                  Queries.weddingDetail,
                  (prev) => (!prev ? prev : { ...prev, guests })
                )
              })
          } else {
            if (detail.guests?.length) {
              setGuestLength(detail.guests.length)
            }
          }
        },
      }}
      trigger={{
        asChild: true,
        children: (
          <button className='flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-3 text-center font-semibold -tracking-base text-white'>
            Live now
          </button>
        ),
      }}
    >
      <div className='min-h-[381px]'>
        {isFetching ? (
          <div className='flex min-h-[inherit] items-center justify-center'>
            <Spinner />
          </div>
        ) : (
          <div className='space-y-6'>
            <FieldGroup title='Masa aktif'>
              <div
                tabIndex={0}
                onClick={() => setActiveTime(0)}
                className={tw(
                  'flex cursor-pointer select-none items-center justify-between rounded-md border border-zinc-300 px-3 py-3 transition-shadow [.dark_&]:border-zinc-700',
                  activeTime === 0 && 'shadow-focus'
                )}
              >
                <div className='flex flex-col'>
                  <p>1 tahun</p>
                  <p className='text-xs tracking-base text-zinc-600 [.dark_&]:text-zinc-300'>
                    Masa aktif 1 tahun
                  </p>
                </div>
                <div>Free</div>
              </div>
              <div
                tabIndex={0}
                onClick={() => setActiveTime(1)}
                className={tw(
                  'flex cursor-pointer select-none items-center justify-between rounded-md border border-zinc-300 px-3 py-3 transition-shadow [.dark_&]:border-zinc-700',
                  activeTime === 1 && 'shadow-focus'
                )}
              >
                <div className='flex flex-col'>
                  <p>Forever</p>
                  <p className='text-xs tracking-base text-zinc-600 [.dark_&]:text-zinc-300'>
                    Masa aktif tidak terbatas
                  </p>
                </div>
                <div>{AppConfig.Wedding.PriceForever / 1000}rb</div>
              </div>
            </FieldGroup>
            <FieldGroup title='Detil harga'>
              <div className='text-sm tracking-normal'>
                <p className='flex justify-between text-zinc-600 [.dark_&]:text-zinc-300'>
                  <span className=''>Masa aktif:</span>
                  <span>{price(priceActive, locale)}</span>
                </p>
                <p className='flex justify-between text-zinc-600 [.dark_&]:text-zinc-300'>
                  <span className=''>Tamu:</span>
                  <span>{price(priceGuest, locale)}</span>
                </p>
                <p className='flex justify-between text-zinc-600 [.dark_&]:text-zinc-300'>
                  <span>Undangan:</span>
                  <span>{price(AppConfig.Wedding.Price, locale)}</span>
                </p>
                <hr className='my-2 border-zinc-300 [.dark_&]:border-zinc-700' />
                <p className='flex justify-between'>
                  <span className='font-semibold'>Total:</span>
                  <span className='font-semibold'>
                    {price(priceTotal, locale)}
                  </span>
                </p>
              </div>
            </FieldGroup>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

const SectionCounter = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEnded, setIsEnded] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fixedRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const isEditor = useIsEditorOrDev()
  const { music } = detail

  useMountedEffect(() => {
    function onScroll() {
      const rectTop = Math.ceil(
        sectionRef.current?.getBoundingClientRect().top ?? 0
      )

      fixedRef.current?.classList.toggle('hidden', rectTop - innerHeight <= -68)
    }

    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  })

  async function onClick() {
    if (!audioRef.current) return

    if (!isPlaying) {
      await audioRef.current.play()

      setIsEnded(false)
      setIsPlaying(true)
      return
    }

    audioRef.current.pause()
    setIsPlaying(false)
  }

  return (
    <>
      {(isEditor || music) && (
        <div
          ref={fixedRef}
          className='fixed bottom-0 left-1/2 z-[60] flex w-full max-w-[440px] -translate-x-1/2 px-6 py-3'
        >
          {isEditor ? (
            <SectionPayment />
          ) : (
            music && (
              <>
                <audio
                  ref={audioRef}
                  className='sr-only'
                  src={
                    (process.env.NEXT_PUBLIC_IMAGEKIT_URL ?? '') + music.path
                  }
                  onEnded={() => {
                    setIsEnded(true)
                    setIsPlaying(false)
                  }}
                />
                <button
                  onClick={onClick}
                  aria-label='Mainkan lagu'
                  title='Mainkan lagu'
                  className={tw(
                    'flex h-14 w-14 items-center justify-center rounded-full bg-zinc-300/70 text-2xl backdrop-blur [.dark_&]:bg-zinc-700'
                  )}
                >
                  {!isPlaying && (
                    <span className='-mr-1 block'>
                      <FaPlay />
                    </span>
                  )}
                  <span
                    className={tw(
                      'block animate-song-play',
                      !isPlaying && 'sr-only',
                      !isPlaying && isEnded && '!animate-none'
                    )}
                    style={{
                      animationPlayState: !isPlaying ? 'paused' : 'running',
                    }}
                  >
                    <FaPause />
                  </span>
                </button>
              </>
            )
          )}
        </div>
      )}
      <section
        ref={sectionRef}
        className='relative z-[70] min-h-[80px] bg-white [.dark_&]:bg-black'
      >
        asd
      </section>
    </>
  )
}

export default SectionCounter

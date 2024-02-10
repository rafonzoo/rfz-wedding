'use client'

import type { MutableRefObject } from 'react'
import type { Wedding } from '@wedding/schema'
import { useRef, useState } from 'react'
import { useQueryClient } from 'react-query'
import { FaPause, FaPlay } from 'react-icons/fa6'
import { tw } from '@/tools/lib'
import { useIsEditorOrDev, useMountedEffect } from '@/tools/hook'
import { exact } from '@/tools/helper'
import { Queries } from '@/tools/config'
import dynamic from 'next/dynamic'

const SheetDropdown = dynamic(
  () => import('@wedding/components/Section/Counter/Dropdown'),
  { ssr: false }
)

const SectionSticky: RF<{
  sectionRef: MutableRefObject<HTMLElement | null>
}> = ({ sectionRef }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEnded, setIsEnded] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fixedRef = useRef<HTMLDivElement | null>(null)
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

  if (!(isEditor || music)) {
    return null
  }

  return (
    <div
      ref={fixedRef}
      className={tw(
        'fixed bottom-0 z-[60] flex max-w-[440px] px-6 py-3',
        !detail.payment.length && 'left-1/2 w-full -translate-x-1/2'
      )}
    >
      {isEditor ? (
        <SheetDropdown />
      ) : (
        music && (
          <>
            <audio
              ref={audioRef}
              className='sr-only'
              src={(process.env.NEXT_PUBLIC_IMAGEKIT_URL ?? '') + music.path}
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
  )
}

export default SectionSticky

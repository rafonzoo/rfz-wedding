'use client'

import type { Wedding } from '@wedding/schema'
import { useRef, useState } from 'react'
import { useQueryClient } from 'react-query'
import { FaPause, FaPlay } from 'react-icons/fa'
import { tw } from '@/tools/lib'
import { useIsEditorOrDev, useMountedEffect } from '@/tools/hook'
import { exact } from '@/tools/helper'
import { Queries } from '@/tools/config'

const SectionCounter = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEnded, setIsEnded] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fixedRef = useRef<HTMLDivElement | null>(null)
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const isEditor = useIsEditorOrDev()
  const isPublic = !isEditor
  const { music } = detail

  useMountedEffect(() => {
    function onScroll() {
      const distance = document.body.scrollHeight - innerHeight
      const deltaY = window.scrollY

      fixedRef.current?.classList.toggle('invisible', distance - deltaY < 0)
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
      {/* {isEditor && (
        <div
          ref={fixedRef}
          className='fixed bottom-0 left-0 z-[60] flex w-full px-3 py-3 text-white'
        >
          <button
            className='flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-3 text-center font-semibold -tracking-base text-white'
            aria-label='Checkout'
          >
            Go live
          </button>
        </div>
      )} */}
      {music && isPublic && (
        <div
          style={{ position: '-webkit-sticky' }}
          className='sticky bottom-0 z-[60] flex'
        >
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
            className={tw(
              'mb-4 ml-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-300/70 text-2xl backdrop-blur [.dark_&]:bg-zinc-700'
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
        </div>
      )}
      <section
        className={tw(
          'relative z-[70] min-h-[75px] bg-white [.dark_&]:bg-black',
          music && isPublic && '-mt-[72px]'
        )}
      >
        asd
      </section>
    </>
  )
}

export default SectionCounter

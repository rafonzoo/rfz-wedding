'use client'

import type { Wedding } from '@wedding/schema'
import { useRef, useState } from 'react'
import { useQueryClient } from 'react-query'
import { FaPause, FaPlay } from 'react-icons/fa'
import { tw } from '@/tools/lib'
import { exact } from '@/tools/helper'
import { Queries } from '@/tools/config'

const SectionCounter = () => {
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const { music, galleries } = detail
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEnded, setIsEnded] = useState(true)

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
      {music && (
        <div className='sticky bottom-0 z-[60] -mb-[72px] flex'>
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
              'dark:bg-zinc-700/bg-zinc-300/70 mb-4 ml-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-300/70 text-2xl backdrop-blur'
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
      <section className='relative z-[70] min-h-[72px] bg-white dark:bg-black'>
        {/* @TODO */}
      </section>
    </>
  )
}

export default SectionCounter

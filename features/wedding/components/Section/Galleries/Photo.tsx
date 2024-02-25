'use client'

import type { MutableRefObject } from 'react'
import type { WeddingGallery } from '@wedding/schema'
import { useRef } from 'react'
import { BsPlusLg } from 'react-icons/bs'
import { retina } from '@wedding/helpers'
import { tw } from '@/tools/lib'
import { useIntersection, useIsEditor, useOutlinedClasses } from '@/tools/hook'

type GalleriesPhotoProps = {
  index: number
  currentIndex: number
  parentRef?: MutableRefObject<HTMLDivElement | null>
  className?: string
  photo?: WeddingGallery
  isLoaded?: boolean
  onClick?: () => void
}

const GalleriesPhoto: RF<GalleriesPhotoProps> = ({
  className,
  currentIndex,
  index,
  photo,
  parentRef,
  isLoaded,
  onClick,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null)
  const isIntersecting = useIntersection(divRef, { threshold: 1 })
  const isEditor = useIsEditor()
  const isPublic = !isEditor
  const squareIndex = [1, 2, 3, 7, 8]
  const outlinedClasses = useOutlinedClasses()

  // prettier-ignore
  const isDotted = (
    squareIndex.includes(index) &&
    isPublic &&
    !className?.includes('pt') &&
    !photo
  )

  const url = {
    0: retina(photo?.fileName, 'w', 'ar-4-3', 'fo-auto'),
    ...Array.from(Array(8).keys()).reduce(
      (acc, val) =>
        (acc[val + 1 === 4 ? val + 2 : val + 1] = retina(
          photo?.fileName,
          'w',
          'ar-1-1',
          'fo-auto'
        )) && acc,
      Object.create({})
    ),
    4: retina(photo?.fileName, 'h', 'ar-2-3', 'fo-auto'),
    9: retina(photo?.fileName, 'w', 'ar-16-9', 'fo-auto'),
  }[index]

  return (
    <div
      ref={divRef}
      className={tw(
        'relative z-[51] rounded-xl',
        !className?.includes('pt') && 'w-full pt-[100%]',
        className
      )}
    >
      <button
        aria-label='Select / view photo'
        data-sheet-void
        data-active={currentIndex === index}
        onClick={isLoaded ? onClick : void 0}
        tabIndex={isDotted ? -1 : void 0}
        className={tw(
          'absolute left-0 top-0 flex h-full w-full items-center justify-center overflow-hidden',
          outlinedClasses(currentIndex === index),
          (!!photo || !squareIndex.includes(index) || isEditor) && 'rounded-[inherit] bg-zinc-900 [.dark_&]:bg-zinc-800' // prettier-ignore
        )}
      >
        {isLoaded && isEditor && !photo && (
          <span className='flex h-10 w-10 items-center justify-center rounded-full text-zinc-500'>
            <BsPlusLg />
          </span>
        )}
        {isDotted && (
          <span className='absolute bottom-0 left-0 right-0 top-0 grid grid-cols-4 grid-rows-4 gap-3'>
            {Array.from(Array(16).keys()).map((key) => (
              <span
                key={key}
                className='flex w-full rounded-full bg-zinc-800 pt-[100%] [.dark_&]:bg-zinc-700'
              />
            ))}
          </span>
        )}
        {photo && (
          <>
            <img
              className='absolute left-0 top-0 h-full w-full object-cover object-center'
              src={url.blur}
              alt={`photo-${photo?.fileName}`}
            />
            {isIntersecting && (
              <img
                className='absolute left-0 top-0 h-full w-full object-cover object-center'
                src={url.src}
                srcSet={url.srcSet}
                alt={`photo-${photo?.fileName}`}
              />
            )}
          </>
        )}
      </button>
    </div>
  )
}

export default GalleriesPhoto

'use client'

import { useEffect, useRef, useState } from 'react'
import { FontFamilyWedding } from '@wedding/config'
import { djs, tw } from '@/tools/lib'
import { useIntersection, useWeddingDetail } from '@/tools/hook'
import { secondsToHms } from '@/tools/helpers'
import Text from '@wedding/components/Text'
import SectionSticky from '@wedding/components/Section/Counter/Sticky'
import ImageTheme from '@wedding/components/Image/Theme'
import ImageCallout from '@wedding/components/Image/Callout'

const SectionClock = () => {
  const [countdown, setCountdown] = useState('00:00:00:00')
  const [isPassed, setIsPassed] = useState(false)
  const detail = useWeddingDetail()
  const divRef = useRef<HTMLDivElement | null>(null)
  const isIntersecting = useIntersection(divRef)

  useEffect(() => {
    if (isIntersecting) {
      const interval = setInterval(() => {
        const date = djs(detail.events[0].date)
          .set('h', +detail.events[0].timeStart.split(':')[0])
          .set('m', +detail.events[0].timeStart.split(':')[1])
          .tz()

        setIsPassed(djs().tz().isAfter(date))
        setCountdown(secondsToHms(date.diff(djs().tz(), 's')).join(':'))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [detail.events, isIntersecting])

  return (
    <div
      ref={divRef}
      className={tw(
        'flex w-full space-x-5 opacity-0 transition-opacity delay-1000 duration-300',
        isIntersecting && 'opacity-100'
      )}
    >
      <div className='flex min-w-[43.918918918918919%] flex-col text-right text-[min(135px,max(98px,30.769230769230769vw))] font-black'>
        {countdown.split(':').map((item, index) => (
          <div key={index} className='flex justify-end'>
            <Text
              family={FontFamilyWedding.cinzel}
              className={tw('relative space-x-1 !leading-[.9]', {
                'text-zinc-500': index === 3,
              })}
            >
              <span>{item}</span>
              <span className='inline-block min-w-4 text-left text-base font-normal text-zinc-500'>
                {index === 0 && 'D'}
                {index === 1 && 'H'}
                {index === 2 && 'M'}
                {index === 3 && 'S'}
              </span>
            </Text>
          </div>
        ))}
      </div>
      <div className='flex flex-col justify-end pb-2 text-[min(54px,max(39px,12.307692307692308vw))]'>
        <Text family={FontFamilyWedding.cinzel}>{isPassed ? 'til' : 'to'}</Text>
        <Text family={FontFamilyWedding.cinzel}>the</Text>
        <Text family={FontFamilyWedding.cinzel}>
          {isPassed ? 'ends' : 'date'}
        </Text>
      </div>
    </div>
  )
}

const SectionCounter = () => {
  const sectionRef = useRef<HTMLElement | null>(null)

  return (
    <>
      <SectionSticky sectionRef={sectionRef} />
      <section
        ref={sectionRef}
        className='relative z-[70] h-[min(1022px,max(743px,232.307692307692308vw))] bg-white [.dark_&]:bg-black'
      >
        <div className='absolute right-0 top-0 z-[1]'>
          <ImageTheme size={256} />
        </div>
        <div className='absolute bottom-0 left-0 z-[1] rotate-180'>
          <ImageTheme size={134} />
        </div>
        <div className='absolute bottom-10 left-6 right-0'>
          <ImageCallout model='bird' />
        </div>
        <div className='relative z-[2] flex h-full items-center pl-6'>
          <SectionClock />
        </div>
        <div className='absolute bottom-6 left-[min(178px,max(129px,40.512820512820513vw))] z-[2] text-xs tracking-base text-zinc-500'>
          Copyright © 2023 Rafa R. <br />
          All right reserved.
        </div>
      </section>
    </>
  )
}

export default SectionCounter

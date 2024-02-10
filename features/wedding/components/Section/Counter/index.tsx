'use client'

import { useRef } from 'react'
import SectionSticky from '@wedding/components/Section/Counter/Sticky'

const SectionCounter = () => {
  const sectionRef = useRef<HTMLElement | null>(null)

  return (
    <>
      <SectionSticky sectionRef={sectionRef} />
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

'use client'

import type { Color } from '@wedding/schema'
import { useState } from 'react'
import { CgDarkMode } from 'react-icons/cg'
import { overview } from '@wedding/helpers'
import { tw } from '@/tools/lib'
import {
  OverviewContent,
  OverviewFeatList,
  OverviewFeature,
  OverviewHeader,
  OverviewSection,
} from '@/app/[locale]/(features)/wedding/_partials/OverviewTemplate'

const OverviewDesign = () => {
  const [theme, setTheme] = useState<Color>('green')

  return (
    <OverviewSection classNames={{ wrapper: tw('lg:!mt-[240px]') }}>
      <OverviewHeader color='cyan-yellow' eyebrow='Design'>
        <span className='block max-w-[50%] md:max-w-full lg:max-w-[40%]'>
          The power&nbsp;of the&nbsp;beauty.
        </span>
      </OverviewHeader>
      <OverviewContent>
        <div className='mt-8 w-full md:mt-10 md:max-w-full'>
          <div className='flex'>
            <div className='flex flex-col'>
              <div className='flex flex-col items-center space-y-4 rounded-full bg-zinc-800 p-3'>
                {[
                  { color: 'green', className: tw('bg-green-600') },
                  { color: 'amber', className: tw('bg-amber-500') },
                  { color: 'sky', className: tw('bg-sky-500') },
                  { color: 'fall', className: tw('bg-fall') },
                ].map(({ className, color }, index) => (
                  <button
                    key={index}
                    aria-label={'To color: ' + color}
                    className={tw(
                      'min-h-6 min-w-6 rounded-full',
                      theme === color && 'shadow-focus',
                      className
                    )}
                    onClick={() => {
                      if (theme !== color) {
                        setTheme(color as Color)
                      }
                    }}
                  />
                ))}
              </div>
              <p className='mt-2.5 flex items-center justify-center text-center text-sm font-semibold leading-4 tracking-normal text-zinc-400/75 [.section-light_&]:text-zinc-700/75'>
                +16
                <br />
                more
              </p>
            </div>
            <div className='ml-8 h-full w-full'>
              <img
                alt='Tampilan tema'
                className='w-full md:hidden'
                src={overview(
                  `/wedding/tr:q-75,w-1371,h-2920,cm-extract,xc-0,yc-1371/design_tropical-${theme}-dark.png`
                )}
              />
              <img
                alt='Tampilan tema'
                className='hidden w-full md:block lg:hidden'
                src={overview(
                  `/wedding/tr:q-75,w-0.5/design_tropical-${theme}-dark.png`
                )}
              />
              <img
                alt='Tampilan tema'
                className='hidden w-full lg:block'
                src={overview(
                  `/wedding/tr:q-75/design_tropical-${theme}-dark.png`
                )}
              />
            </div>
          </div>
        </div>
        <p className='mx-auto my-10 font-semibold text-zinc-400/75 md:my-[72px] lg:my-[96px] lg:max-w-[820px] lg:text-xl'>
          The new era of digitalization of wedding invitation are just begun.
          This invitation has been meticulously crafted to be not just
          beautiful, but designed for being incredibly easy.{' '}
          <span className='text-white'>
            With up to 12 (soon) more theme and more than 20 color option, you
            can choose any themes, with any colors, whether dark or light,
            combine everything that you loved in just a few tap.
          </span>{' '}
          Thanks to the interface that bring us the flexibility for ease-ness.
          it{"'"}s intuitive, user-friendly, the layout designed to be navigable
          and accessible for all users of ages, this is the way we complete your
          experience in every possible way.
        </p>
        <div className='relative flex flex-col space-y-6 md:flex-row md:space-y-0'>
          <div className='grow'>
            <OverviewFeature
              className={tw('w-full md:mt-0')}
              color='cyan-yellow'
              items={[
                {
                  prepend: 'Up to',
                  append: 'more colors',
                  text: 20,
                },
                {
                  prepend: '(Soon)',
                  append: 'more theme',
                  text: 12,
                },
              ]}
            />
          </div>
          <div className='overflow-hidden rounded-2xl md:ml-8 md:max-w-[272px] lg:max-w-[411px]'>
            <img
              alt='Tampilan tema'
              className='w-full md:hidden'
              src={overview(`/wedding/tr:q-75/design_darkmode-small.png`)}
            />
            <img
              alt='Tampilan tema'
              className='hidden md:block'
              src={overview(`/wedding/tr:q-75/design_darkmode-phone.png`)}
            />
          </div>
          <OverviewFeatList
            className='mt-6 md:absolute md:right-[calc(272px+_32px)] md:top-[calc(163.44px_+_32px)] md:mt-0 lg:right-[calc(411px_+_32px)]'
            items={[
              {
                icon: <CgDarkMode />,
                text: (
                  <>
                    <span className='text-white'>
                      Easily turn off the light by toggling the dark mode.
                    </span>{' '}
                    Whether light or dark, it{"'"}s compliant with minimum WCAG
                    2.0 color contrast and ratio, so it safe for everyone eyes.
                  </>
                ),
              },
            ]}
          />
        </div>
      </OverviewContent>
    </OverviewSection>
  )
}

export default OverviewDesign

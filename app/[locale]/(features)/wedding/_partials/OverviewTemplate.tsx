import type { ReactNode } from 'react'
import type { TextGradientProps } from '@/components/TextGradient'
import { tw } from '@/tools/lib'
import { CinzelFont } from '@wedding/components/Text'
import TextGradient from '@/components/TextGradient'

type OverviewFeatureProps = {
  color: TextGradientProps['color']
  className?: string
  items: {
    append?: ReactNode
    prepend?: ReactNode
    text?: ReactNode
    className?: string
    textAppend?: string
  }[]
}

type OverviewFeatListProps = {
  items: { text: ReactNode; icon?: ReactNode; className?: string }[]
  className?: string
}

export const OverviewFeatList: RFZ<OverviewFeatListProps> = ({
  items,
  className,
}) => {
  return (
    <ul className={tw('space-y-6 lg:max-w-[365px]', className)}>
      {items.map((item, index) => (
        <li
          key={index}
          className={tw(
            'flex space-x-4 border-zinc-700 font-semibold text-zinc-400/75 [&:nth-child(n+2)]:border-t [&:nth-child(n+2)]:pt-6 [.section-light_&]:border-zinc-300 [.section-light_&]:text-zinc-700/75',
            item.className
          )}
        >
          <div
            className={tw(
              'flex h-7 min-h-7 w-6 min-w-6 items-center justify-center rounded-xl text-zinc-500 lg:h-9 lg:min-h-9 lg:w-8 lg:min-w-8',
              !item.icon ? 'bg-zinc-900' : 'text-2xl lg:text-4xl'
            )}
          >
            {item.icon}
          </div>
          <p>{item.text}</p>
        </li>
      ))}
    </ul>
  )
}

export const OverviewFeature: RFZ<OverviewFeatureProps> = ({
  items,
  color,
  className,
}) => {
  const isCol = className?.includes('flex-col')
  return (
    <ul
      className={tw(
        'flex w-full flex-wrap rounded-2xl border border-zinc-700 [.section-light_&]:border-zinc-300',
        className
      )}
    >
      {items.map((feat, index) => (
        <li
          key={index}
          className={tw(
            'relative flex grow items-center justify-center border-[color:inherit] py-7',
            isCol
              ? 'w-full [&:nth-child(n+2)]:border-t'
              : 'w-1/2 [&:nth-child(n+2)]:border-l',
            feat.className
          )}
        >
          <div className='flex flex-col'>
            {feat.prepend && (
              <p className='text-sm font-semibold tracking-normal text-zinc-400/75 [.section-light_&]:text-zinc-700/75'>
                {feat.prepend}
              </p>
            )}
            <p
              className={tw(
                'text-[72px] font-bold leading-[1.02]',
                CinzelFont.className
              )}
            >
              <TextGradient color={color}>{feat.text}</TextGradient>
              {feat.textAppend && (
                <span className='ml-0.5 inline-block font-inter text-base font-normal'>
                  <TextGradient color={color}>{feat.textAppend}</TextGradient>
                </span>
              )}
            </p>
            {feat.append && (
              <p className='-mt-2 text-sm font-semibold tracking-normal text-zinc-400/75 [.section-light_&]:text-zinc-700/75'>
                {feat.append}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export const OverviewContent: RFZ = ({ children }) => {
  return (
    <div className='flex flex-col md:flex-row md:flex-wrap md:justify-between'>
      <div className='flex w-full flex-col'>{children}</div>
    </div>
  )
}

export const OverviewSection: RFZ<{
  isLight?: boolean
  classNames?: { [P in 'wrapper']?: string }
}> = ({ children, classNames, isLight }) => {
  return (
    <section
      className={tw(
        !isLight ? 'section-dark' : 'section-light bg-white text-black'
      )}
    >
      <div className='mx-auto max-w-[440px] overflow-hidden before:table before:content-[""] md:max-w-full'>
        <div
          className={tw(
            'mx-auto mt-[120px] max-w-[83.71501272264631%] md:mt-[180px] md:max-w-[672px] lg:mt-[180px] lg:max-w-[980px]',
            classNames?.wrapper
          )}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

export const OverviewHeader: RFZ<{
  color?: TextGradientProps['color']
  eyebrow: string
}> = ({ color, eyebrow, children }) => {
  return (
    <div className='lg:ml-[80px]'>
      <p className='text-2xl font-semibold leading-7'>
        <TextGradient color={color}>{eyebrow}</TextGradient>
      </p>
      <h2 className='mt-2.5 text-[40px] font-bold leading-[1.1] tracking-tight md:mt-4 md:text-[56px] lg:text-[80px]'>
        {children}
      </h2>
    </div>
  )
}

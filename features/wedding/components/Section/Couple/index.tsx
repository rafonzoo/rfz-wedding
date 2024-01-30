import type { Wedding } from '@wedding/schema'
import { AppConfig } from '@/tools/config'
import TextTitle from '@wedding/components/Text/Title'
import SectionCoupleStories from '@wedding/components/Section/Couple/Stories'
import CoupleCard from '@wedding/components/Section/Couple/Card'
import ImageTheme from '@wedding/components/Image/Theme'
import FigureImage from '@wedding/components/Image/Picture'
import ImageCallout from '@wedding/components/Image/Callout'

const SectionCouple: RFZ<Wedding> = (wedding) => {
  return (
    <section className='relative'>
      <div className='absolute right-0 top-0 z-[1]'>
        <ImageTheme size={195} {...wedding.loadout} />
      </div>
      <TextTitle>The Couple</TextTitle>
      <div className='relative mt-0 p-6 pb-[min(108px,max(79px,24.615384615384615vw))]'>
        <div>
          <div className='absolute left-0 right-0 top-24 !mt-0'>
            <ImageCallout
              model='wave'
              foreground={wedding.loadout.foreground}
            />
          </div>
          <ImageTheme
            {...wedding.loadout}
            size={390}
            className='absolute bottom-0 left-0 !mt-0 rotate-180'
          />
        </div>
        <div className='relative space-y-6'>
          {wedding.couple
            .sort((a, b) => a.id - b.id)
            .map((item, key) => (
              <div key={key} className='relative flex'>
                <FigureImage
                  index={AppConfig.Wedding.ImageryStartIndex + (key + 1)}
                >
                  <span className='absolute bottom-0 left-0 z-[2] block h-3/4 w-full rounded-[inherit] bg-gradient-to-t from-black to-transparent' />
                  <span className='absolute bottom-0 left-0 z-[3] block h-full w-full rounded-[inherit] bg-black opacity-10' />
                </FigureImage>
                <CoupleCard {...item} />
              </div>
            ))}
          <SectionCoupleStories />
        </div>
      </div>
    </section>
  )
}

export default SectionCouple

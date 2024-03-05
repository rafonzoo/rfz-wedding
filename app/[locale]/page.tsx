import { FaChevronRight } from 'react-icons/fa6'
import { overview } from '@wedding/helpers'
import { Route } from '@/tools/config'
import { LocaleLink } from '@/locale/config'

const Homepage = () => {
  return (
    <main>
      <section className='flex min-h-[570px] w-full flex-col bg-black pb-4'>
        <div className='mx-auto mt-14 w-full max-w-[980px] text-center'>
          <div className='mx-auto w-[81%] max-w-[320px]'>
            <h1 className='sr-only'>RFZ Application</h1>
            <p className='text-sm tracking-normal text-white/50'>
              Wedding Invitation
            </p>
            <p className='mt-2 text-[32px] font-bold leading-9 tracking-tight text-white'>
              Digitalize your lovely&nbsp;invitation
            </p>
            <p className='mt-2 text-white/80'>
              journey to create wedding invitation. Pretty.&nbsp;Easy.
            </p>
            <p className='mt-4'>
              <LocaleLink
                href={Route.weddingList}
                className='inline-flex h-11 items-center rounded-full bg-blue-600 px-4 font-semibold text-white'
              >
                Try free
              </LocaleLink>
            </p>
            <p className='mt-4'>
              <span className='inline-flex items-center justify-center space-x-0.5 text-blue-400 outline-none focus-visible:underline'>
                <LocaleLink href={Route.wedding}>Take closer look</LocaleLink>
                <span className='mt-px block text-xs'>
                  <FaChevronRight />
                </span>
              </span>
            </p>
          </div>
        </div>
        <figure className='relative mx-auto mt-6 flex h-[448px] w-[387px] max-w-full overflow-hidden'>
          <img
            className='absolute h-full w-full object-cover object-center'
            width={390}
            alt='RFZ Digital Wedding Invitation'
            src={overview('/wedding/tr:q-75,w-0.10/landing.jpg')}
            srcSet={[
              overview(`/wedding/tr:w-0.20,q-75/landing.jpg 2x`),
              overview(`/wedding/tr:w-0.30,q-75/landing.jpg 3x`),
            ].join(',')}
          />
        </figure>
      </section>
    </main>
  )
}

export default Homepage

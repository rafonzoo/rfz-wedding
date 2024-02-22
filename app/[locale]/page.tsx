import { FaChevronRight } from 'react-icons/fa6'
import { overview } from '@wedding/helpers'
import { Route } from '@/tools/config'
import { LocaleLink } from '@/locale/config'

const Homepage = () => {
  return (
    <main>
      <section className='flex min-h-[570px] w-full flex-col bg-black pb-4'>
        <div className='mx-auto mt-14 w-full max-w-[980px] text-center'>
          <div className='mx-auto w-[75%] max-w-[320px]'>
            <p className='text-sm tracking-normal text-white/50'>RFZ Wedding</p>
            <h2 className='mt-2 text-[32px] font-bold leading-9 tracking-tight text-white'>
              Klik. Klik. Klik. Bagikan.&nbsp;Done.
            </h2>
            <p className='mt-2 text-white/80'>
              Membuat undangan tidak pernah&nbsp;semudah&nbsp;ini.
            </p>
            <p className='mt-4'>
              <LocaleLink
                prefetch={false}
                href={Route.weddingList}
                className='inline-flex h-11 items-center rounded-full bg-blue-600 px-4 font-semibold text-white'
              >
                Buat
              </LocaleLink>
            </p>
            <p className='mt-4'>
              <span className='pointer-events-none inline-flex items-center justify-center space-x-0.5 text-blue-400 opacity-50 outline-none focus-visible:underline'>
                {/* <LocaleLink prefetch={false} href={Route.wedding}>
                  Selengkapnya
                </LocaleLink> */}
                <span>Selengkapnya</span>
                <span className='mt-px block text-xs'>
                  <FaChevronRight />
                </span>
              </span>
            </p>
          </div>
        </div>
        <figure className='relative mx-auto mt-6 flex h-[448px] w-[387px] max-w-full overflow-hidden'>
          <img
            className='absolute  h-full w-full object-cover object-center'
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

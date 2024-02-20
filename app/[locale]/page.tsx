import { FaChevronRight } from 'react-icons/fa6'
import { Route } from '@/tools/config'
import { LocaleLink } from '@/locale/config'
import HomepageClient from './client'

const Homepage = async () => {
  return (
    <HomepageClient>
      <main>
        <section className='flex h-[572px] flex-col bg-zinc-100 [.dark_&]:bg-black'>
          <div className='mx-auto mt-10 w-full max-w-[980px] text-center lg:my-auto'>
            <div className='mx-auto w-[75%] max-w-[360px] lg:-mt-14 lg:ml-0 lg:mr-auto lg:w-[auto]'>
              <p className='text-sm tracking-normal'>RFZ Wedding</p>
              <h2 className='mt-1 text-2.5xl font-bold tracking-tight'>
                Klik. Klik. Klik. Tayang.&nbsp;Done.
              </h2>
              <p className='mt-2'>
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
                <span className='inline-flex cursor-not-allowed items-center justify-center space-x-1 text-blue-600 opacity-50 outline-none focus-visible:underline [.dark_&]:text-blue-400'>
                  <span className='block'>Selengkapnya</span>
                  <span className='mt-px block text-xs'>
                    <FaChevronRight />
                  </span>
                </span>
              </p>
            </div>
          </div>
        </section>
      </main>
    </HomepageClient>
  )
}

export default Homepage

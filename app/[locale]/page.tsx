import { Route } from '@/tools/config'
import { LocaleLink } from '@/locale/config'
import HomepageClient from './client'

const Homepage = async () => {
  return (
    <HomepageClient>
      <div className='flex flex-col space-y-2 p-6'>
        <p>
          <LocaleLink prefetch={false} href={Route.account}>
            Akun
          </LocaleLink>
        </p>
        <p>
          <LocaleLink prefetch={false} href={Route.weddingList}>
            Undanganku
          </LocaleLink>
        </p>
      </div>
    </HomepageClient>
  )
}

export default Homepage

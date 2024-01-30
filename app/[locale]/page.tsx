import { qstring } from '@/tools/helper'
import { Route } from '@/tools/config'
import { LocaleLink } from '@/locale/config'
import { DUMMY_WEDDING_NAME } from '@/dummy'
import HomepageClient from './client'

const Homepage = async () => {
  return (
    <HomepageClient>
      <p>
        <LocaleLink prefetch={false} href={Route.account}>
          Account page
        </LocaleLink>
      </p>
      <p>
        <LocaleLink prefetch={false} href={Route.wedding}>
          Invitation page
        </LocaleLink>
      </p>
      <p>
        <LocaleLink
          prefetch={false}
          href={{
            pathname: Route.weddingPublic,
            params: { name: DUMMY_WEDDING_NAME },
            search: qstring({
              to: '(SMK-57-Jkt.)-Dra.-Astuti-M.-Hum',
              cid: '942388',
            }),
          }}
        >
          (SMK 57 Jkt.) Dra. Astuti M. Hum
        </LocaleLink>
      </p>
      <p>
        <LocaleLink
          prefetch={false}
          href={{
            pathname: Route.weddingPublic,
            params: { name: DUMMY_WEDDING_NAME },
            search: qstring({ to: '(asd)-masbro', cid: '222629' }),
          }}
        >
          Masbro
        </LocaleLink>
      </p>
      <p>
        <LocaleLink
          prefetch={false}
          href={{
            pathname: Route.weddingPublic,
            params: { name: DUMMY_WEDDING_NAME },
            search: qstring({ to: 'jamsoy', cid: '123123' }),
          }}
        >
          jamSOY
        </LocaleLink>
      </p>
      <p>
        <LocaleLink
          prefetch={false}
          href={{
            pathname: Route.weddingPublic,
            params: { name: DUMMY_WEDDING_NAME },
            search: qstring({ to: 'bonge', cid: '456456' }),
          }}
        >
          BonGe
        </LocaleLink>
      </p>
      <p>
        <LocaleLink
          prefetch={false}
          href={{
            pathname: Route.weddingPublic,
            params: { name: DUMMY_WEDDING_NAME },
            search: qstring({ to: 'mamen', cid: '999999' }),
          }}
        >
          MAMEN
        </LocaleLink>
      </p>
    </HomepageClient>
  )
}

export default Homepage

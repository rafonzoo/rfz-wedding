import type { Wedding } from '@wedding/schema'
import { tw } from '@/tools/lib'
import dynamic from 'next/dynamic'
import SectionLanding from '@wedding/components/Section/Landing'
import SectionGalleries from '@wedding/components/Section/Galleries'
import SectionEvents from '@wedding/components/Section/Events'
import SectionCouple from '@wedding/components/Section/Couple'
import SectionComment from '@wedding/components/Section/Comment'

const SheetLoadout = dynamic(
  () => import('@wedding/components/Sheet/Loadout'),
  {
    ssr: false,
  }
)

/**
 * Server Component
 */
const WeddingTemplate: RFZ<Wedding & { csrfToken?: string }> = ({
  csrfToken,
  ...wedding
}) => {
  return (
    <div className={tw({ dark: wedding.loadout.background === 'black' })}>
      <main className='mx-auto max-w-[440px]'>
        <div className='transition-colors duration-200 ease-out dark:bg-black dark:text-white'>
          <SectionLanding {...wedding} />
          <SectionCouple {...wedding} />
          <SectionEvents {...wedding} />
          <SectionGalleries {...wedding} />
          <SectionComment {...wedding} csrfToken={csrfToken} />
          <div>
            <SheetLoadout {...wedding.loadout}>Appearance</SheetLoadout>
          </div>
        </div>
      </main>
    </div>
  )
}

export default WeddingTemplate

import type { Wedding } from '@wedding/schema'
import { tw } from '@/tools/lib'
import SectionLanding from '@wedding/components/Section/Landing'
import SectionGalleries from '@wedding/components/Section/Galleries'
import SectionEvents from '@wedding/components/Section/Events'
import SectionCouple from '@wedding/components/Section/Couple'
import SectionCounter from '@wedding/components/Section/Counter'
import SectionComment from '@wedding/components/Section/Comment'

/**
 * Server Component
 */
const WeddingTemplate: RFZ<Wedding> = ({ loadout }) => {
  return (
    <div className={tw({ dark: loadout.background === 'black' })}>
      <main className='mx-auto max-w-[440px]'>
        <div className='transition-colors duration-200 ease-out [.dark_&]:bg-black [.dark_&]:text-white'>
          <SectionLanding />
          <SectionCouple />
          <SectionEvents />
          <SectionGalleries />
          <SectionComment />
          <SectionCounter />
        </div>
      </main>
    </div>
  )
}

export default WeddingTemplate

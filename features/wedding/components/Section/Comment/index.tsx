import type { Wedding } from '@wedding/schema'
import TextTitle from '@wedding/components/Text/Title'
import CommentList from '@wedding/components/Section/Comment/List'
import ImageTheme from '@wedding/components/Image/Theme'
import FigureImage from '@wedding/components/Image/Picture'
import ImageCallout from '@wedding/components/Image/Callout'

const COMMENT_PICTURE_INDEX = 201

const SectionComment: RFZ<Wedding & { csrfToken?: string }> = ({
  csrfToken,
  ...wedding
}) => {
  return (
    <section className='relative'>
      <div className='absolute right-0 top-0 z-[1]'>
        <ImageTheme size={195} {...wedding.loadout} />
      </div>
      <TextTitle>The Response</TextTitle>
      <div className='absolute bottom-0 left-0 right-0'>
        <div className='relative overflow-hidden pt-[78.205128205128205%]'>
          <ImageCallout
            className='absolute left-0 top-0'
            model='wave'
            foreground={wedding.loadout.foreground}
          />
        </div>
      </div>
      <div className='relative mt-0 space-y-6 p-6 pb-[min(108px,max(79px,24.615384615384615vw))]'>
        <div className='absolute left-6 right-0 top-24 !mt-0'>
          <ImageCallout model='bird' foreground={wedding.loadout.foreground} />
        </div>
        <FigureImage index={COMMENT_PICTURE_INDEX} className='z-[1]' isCenter />
        <CommentList comments={wedding.comments} csrfToken={csrfToken} />
      </div>
    </section>
  )
}

export default SectionComment

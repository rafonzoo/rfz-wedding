import { VscFile } from 'react-icons/vsc'
import { SlLayers } from 'react-icons/sl'
import { RiGroupLine } from 'react-icons/ri'
import { PiPlus } from 'react-icons/pi'
import { MdOutlineLockPerson } from 'react-icons/md'
import { LiaMarkdown } from 'react-icons/lia'
import { IoMapSharp } from 'react-icons/io5'
import { BsAppIndicator, BsMeta } from 'react-icons/bs'
import { overview } from '@wedding/helpers'
import { tw } from '@/tools/lib'
import { Route } from '@/tools/config'
import { LocaleLink } from '@/locale/config'
import TextGradient from '@/components/TextGradient'
import {
  OverviewContent,
  OverviewFeatList,
  OverviewFeature,
  OverviewHeader,
  OverviewSection,
} from './_partials/OverviewTemplate'
import OverviewDesign from './_partials/OverviewDesign'

const WeddingOverview = () => {
  return (
    <main>
      <header className='flex flex-col'>
        <div className='relative overflow-hidden pb-px'>
          <h1 className='sr-only'>RFZ Wedding</h1>
          <div className='relative mx-auto mt-[72px] flex flex-col space-y-4 md:mt-[96px] md:space-y-6 lg:mt-[120px] lg:space-y-10'>
            <p className='mx-auto w-[250px] text-center text-[48px] font-bold leading-[1.08] tracking-tight md:w-[672px] md:text-[60px] lg:w-[980px] lg:text-[92px]'>
              Create wedding invitation in
              <TextGradient> minutes</TextGradient>.
            </p>
            <div className='md:mx-auto md:flex md:max-w-[720px] md:items-center md:justify-center lg:max-w-[980px]'>
              <p className='mx-auto w-[272px] text-center text-xl font-medium leading-[1.25] text-zinc-300 md:order-2 md:mr-0 md:w-full md:text-left md:leading-[1.4] lg:text-[30px] lg:leading-[1.25]'>
                Revolutionary easy. Upload, create, guest, comment, the true
                digital-app for your digital&nbsp;invitation.
              </p>
              <div className='md:mx-6 md:h-[96px] md:w-px md:bg-zinc-500 lg:mx-10 lg:h-[112.5px]'></div>
              <div className='md:-order-1 md:ml-6 md:flex md:min-w-[200px] md:flex-col md:justify-center'>
                <button className='mx-auto !mt-8 flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-center font-semibold text-white md:!mt-0 md:w-full'>
                  <LocaleLink href={Route.weddingList}>Try free</LocaleLink>
                </button>
                <p className='mx-auto mt-6 max-w-[272px] text-center text-xs tracking-base text-zinc-400/75 md:ml-0 md:mt-3 md:max-w-full'>
                  It is free until you choose to share your invitation with your
                  guest.
                </p>
              </div>
            </div>
          </div>
          <div className='mt-14 flex max-w-full justify-center md:mt-14 lg:mt-20'>
            <figure
              className='h-[542px] w-full bg-[size:980px_auto] bg-top bg-no-repeat md:bg-[size:1111px_auto] lg:hidden'
              style={{
                backgroundImage: `url(${overview('/wedding/tr:q-75/intro_large.jpg')})`,
              }}
            />
            <figure
              className='hidden h-[760px] w-[1560px] min-w-[1560px] bg-[size:1560px_auto] bg-[position:top] bg-no-repeat lg:block'
              style={{
                backgroundImage: `url(${overview('/wedding/tr:q-75/intro_extra.jpg')})`,
              }}
            />
          </div>
          <hr className='absolute left-0 w-full border-zinc-700' />
        </div>
      </header>
      <div>
        <OverviewDesign />
        <OverviewSection
          classNames={{ wrapper: tw('mb-[120px] md:mb-[180px]') }}
        >
          <OverviewHeader color='yellow-red' eyebrow='Event'>
            <span>
              More&nbsp;event. More&nbsp;longe
              <span className='md:hidden'>&shy;</span>vity.
            </span>
          </OverviewHeader>
          <OverviewContent>
            <p className='mx-auto mt-6 font-semibold text-zinc-400/75 lg:max-w-[820px] lg:text-xl'>
              Our invitation event designed to be more powerful,{' '}
              <span className='text-white'>
                you can add, edit, remove, manage all your event in one place at
                the same time. With up to 3 additional custom event, and 12
                month long time active{' '}
              </span>
              , you can keep focus on your wedding without worrying about your
              invitation cannot being displayed for some time of periods. But,
              wait. It goes even further. With guest group, you can split which
              guest should appear within particular event. So you can
              differentiate what event you should show to your guest and your
              guest will know where event they should be attend 🤯.
            </p>
            <OverviewFeature
              className={tw(
                'mb-6 mt-6 md:mb-0 md:mt-10 lg:mx-auto lg:max-w-[820px]'
              )}
              color='yellow-red'
              items={[
                {
                  prepend: 'Up to',
                  append: 'cust. event',
                  text: '3+',
                },
                {
                  prepend: 'Up to',
                  append: 'mo. active',
                  text: 12,
                },
              ]}
            />
            <div className='relative flex flex-col md:mt-8 md:flex-row md:space-x-8 lg:ml-[80px]'>
              <div className='overflow-hidden rounded-2xl md:max-w-[306px] lg:max-w-[411px]'>
                <img
                  alt='Tampilan tema'
                  src={overview(`/wedding/tr:q-75/events_managed-event.png`)}
                />
              </div>
              <div className='grow'>
                <OverviewFeatList
                  className='mt-10 md:mr-auto md:mt-0'
                  items={[
                    {
                      icon: <IoMapSharp />,
                      text: (
                        <>
                          <span className='text-white'>
                            Typing your display address magically pin your
                            location with google maps
                          </span>
                          . So you can keep focus editing while the engine
                          generate the maps for you.
                        </>
                      ),
                    },
                    {
                      icon: <BsMeta />,
                      text: (
                        <>
                          <span className='text-white'>
                            With active forever, your invitation will active
                            without comes to the end
                          </span>
                          , and we will sent you anniversary card every year as
                          a reminder for you to celebrate 🥳.
                        </>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </OverviewContent>
        </OverviewSection>
      </div>
      <div>
        <OverviewSection isLight classNames={{ wrapper: tw('lg:mt-[240px]') }}>
          <OverviewHeader color='orange-cyan' eyebrow='Sharing'>
            <span className='block max-w-[80%]'>
              Pay in&nbsp;easy&nbsp;way. Share in&nbsp;any&nbsp;way.
            </span>
          </OverviewHeader>
          <OverviewContent>
            <p className='mx-auto mt-6 font-semibold text-zinc-400/75 lg:max-w-[820px] lg:text-xl [.section-light_&]:text-zinc-700/75'>
              Designing a secure payment in a fun way is still challenging these
              day. That&apos;s why we integrate Midtrans as{' '}
              <span className='text-black'>
                our default payment to protect your purchasement, and ease you
                to pay with your favorite payment method, including no hidden
                cost and you only pay what you choose to pay
              </span>
              . With up to more 5 bank transfer, or QRIS, you can pay with your
              favorite method and pay at anytime. The sharing system designed
              for your custom event too, so you can preview your sharing text
              and it&apos;s automatically formatted when you share to your
              guest.
            </p>
            <div className='relative mt-6 flex flex-col md:mt-10 md:flex-row lg:mt-[64px]'>
              <div className='grow'>
                <OverviewFeature
                  className={tw('w-full md:mt-0')}
                  color='orange-cyan'
                  items={[
                    {
                      prepend: 'Up to',
                      text: '5+',
                      append: 'bank type',
                    },
                    {
                      prepend: 'Up to',
                      append: 'social share',
                      text: '2+',
                    },
                  ]}
                />
              </div>
              <div className='mt-6 overflow-hidden rounded-2xl border border-zinc-300 md:ml-8 md:mt-0 md:max-w-[272px] lg:max-w-[411px]'>
                <img
                  alt='Tampilan tema'
                  src={overview(`/wedding/tr:q-75/payment_midtrans-shoot.png`)}
                />
              </div>
              <OverviewFeatList
                className='mt-10 md:absolute md:right-[calc(272px+_32px)] md:top-[calc(163.44px_+_32px)] md:mt-0 lg:right-[calc(411px_+_32px)]'
                items={[
                  {
                    icon: <VscFile />,
                    text: (
                      <>
                        <span className='text-black'>
                          The recipe will sent to your email alongside your
                          payment
                        </span>
                        . You can also track the copy of payment recipe from
                        your history page.
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </OverviewContent>
        </OverviewSection>

        <OverviewSection
          isLight
          classNames={{ wrapper: tw('mb-[120px] md:mb-[180px]') }}
        >
          <OverviewHeader color='yellow-red' eyebrow='Guest'>
            <span className='block max-w-[80%] md:max-w-full'>
              Managing your guest is&nbsp;never been&nbsp;easier.
            </span>
          </OverviewHeader>
          <OverviewContent>
            <p className='mx-auto mt-6 font-semibold text-zinc-400/75 lg:max-w-[820px] lg:text-xl [.section-light_&]:text-zinc-700/75'>
              Creating a guest shouldn&apos;t be hard. With our guest system,
              you can add or edit very quickly. Tapping{' '}
              <span className='inline-block align-middle text-blue-600'>
                <PiPlus />
              </span>{' '}
              or tapping your guest will add or edit your guest. Creating a
              guest group also incredibly easy while you can share them quickly.
              In draft mode,{' '}
              <span className='text-black'>
                you can create up to 300 guest and it&apos;s always free. But
                you can get more up to 700 guest and max out in 1000 guest{' '}
              </span>
              by purchasing the guest add-ons in the app. Writing your group
              name in search control can help you manage your guest without
              being disturbed by your other guest 🤯.
            </p>
            <div className='relative mx-auto mt-6 flex w-full flex-col md:mt-10 md:flex-row lg:mt-[64px] lg:max-w-[820px]'>
              <div className='grow'>
                <OverviewFeature
                  className={tw('w-full md:mt-0')}
                  color='yellow-red'
                  items={[
                    {
                      prepend: 'Up to',
                      text: '699+',
                      append: 'additional guest',
                    },
                  ]}
                />
              </div>
              <div className='mt-6 overflow-hidden md:-order-1 md:mr-8 md:mt-0 md:max-w-[272px] lg:max-w-[411px]'>
                <img
                  alt='Tampilan tema'
                  src={overview(`/wedding/tr:q-75/guests_group.png`)}
                />
              </div>
              <OverviewFeatList
                className='mt-10 md:absolute md:left-[calc(272px+_32px)] md:top-[calc(163.44px_+_32px)] md:mt-0 lg:left-[calc(411px_+_32px)]'
                items={[
                  {
                    icon: <RiGroupLine />,
                    text: (
                      <>
                        <span className='text-black'>
                          Split event with guest group
                        </span>
                        . You can separate which guest should appear within
                        particular event.
                      </>
                    ),
                  },
                  {
                    icon: <MdOutlineLockPerson />,
                    text: (
                      <>
                        <span className='text-black'>
                          It secure. Not even a ghost
                        </span>
                        . Every guest that you create is encrypted and only
                        people that you share can open your invitation.
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </OverviewContent>
        </OverviewSection>
      </div>
      <div>
        <OverviewSection classNames={{ wrapper: tw('lg:mt-[240px]') }}>
          <OverviewHeader color='cyan-yellow' eyebrow='Galleries'>
            <span className='block max-w-[80%] md:max-w-[60%]'>
              Upload&nbsp;once. Place anywhere in&nbsp;your&nbsp;frame.
            </span>
          </OverviewHeader>
          <OverviewContent>
            <p className='mx-auto mt-6 font-semibold text-zinc-400/75 lg:max-w-[820px] lg:text-xl [.section-light_&]:text-zinc-700/75'>
              Our gallery API make your photo management is more simple. You can
              upload your best-looking prewedding photo once, then put it to
              every frame in the app.{' '}
              <span className='text-white'>
                The uploader automatically compress your photo size without
                decreasing your photo quality
              </span>
              , so your photo keep looking great even in less size{' '}
              <span className='text-white'>
                while it can magically recognize any face within your photo,
                then focusing to the center before fitting into selected frame
              </span>
              . So you don&apos;t need to manually edit your photo to fit into
              any frame. We are gladly add more images and video capability
              later, in the future.
            </p>
            <div className='relative mt-10 flex flex-col md:flex-row lg:mt-[64px]'>
              <div className='grow'>
                <OverviewFeature
                  className={tw('w-full md:mt-0')}
                  color='cyan-yellow'
                  items={[
                    {
                      prepend: 'Up to',
                      text: '12+',
                      append: 'photo gallery',
                    },
                    {
                      prepend: 'Max up to',
                      text: '10',
                      append: 'photo file size',
                      textAppend: 'MB',
                    },
                  ]}
                />
              </div>
              <div className='mt-6 overflow-hidden rounded-2xl md:ml-8 md:mt-0 md:max-w-[272px] lg:max-w-[411px]'>
                <img
                  alt='Tampilan tema'
                  src={overview(`/wedding/tr:q-75/galleries_upload.png`)}
                />
              </div>
              <OverviewFeatList
                className='mt-10 md:absolute md:right-[calc(272px+_32px)] md:top-[calc(163.44px_+_32px)] md:mt-0 lg:right-[calc(411px_+_32px)]'
                items={[
                  {
                    icon: <SlLayers />,
                    text: (
                      <>
                        <span className='text-white'>
                          Photo that shown in the frame has been layered
                          intelligently{' '}
                        </span>
                        to keep your photos quality sharp in every angle.
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </OverviewContent>
        </OverviewSection>

        <OverviewSection
          classNames={{ wrapper: tw('mb-[120px] md:mb-[180px]') }}
        >
          <OverviewHeader color='blue-pink' eyebrow='Response'>
            <span className='block max-w-[240px] md:max-w-full'>
              Join everyone to&nbsp;celebrate. Yeaaay 🥳
            </span>
          </OverviewHeader>
          <OverviewContent>
            <p className='mx-auto mt-6 font-semibold text-zinc-400/75 lg:max-w-[820px] lg:text-xl [.section-light_&]:text-zinc-700/75'>
              The response section is unbelievebly fun.{' '}
              <span className='text-white'>
                Your guest doesn&apos;t need to be authorized to comment, it
                gives them more freedom to spoke and pleased reaction while we
                keep it secure and give you protection againts spam
              </span>
              . Your guest group name will show, so you know which guest it is
              even you have the same guest name. You can comment too as the
              author and you can remove any comment directly from the app. A
              little dot in their comment means their attendance and let
              everyone know whether they are coming to your event, or feel
              sorry.
            </p>
            <div className='relative mx-auto mt-10 flex w-full flex-col md:flex-row lg:mt-[64px] lg:max-w-[820px]'>
              <div className='mt-6 overflow-hidden border-zinc-300 md:-order-1 md:mr-8 md:mt-0 md:max-w-[272px] lg:max-w-[411px]'>
                <img
                  alt='Tampilan tema'
                  src={overview(`/wedding/tr:q-75/responses_comment.png`)}
                />
              </div>
              <OverviewFeatList
                className='mt-10 md:absolute md:left-[calc(272px+_32px)] md:top-0 md:mt-0 lg:left-[calc(411px_+_32px)]'
                items={[
                  {
                    icon: <BsAppIndicator />,
                    text: (
                      <>
                        <span className='text-white'>
                          Track guest attendance by their comment
                        </span>
                        , and you can submit your own comment if you need to
                        reply your guest.
                      </>
                    ),
                  },
                  {
                    icon: <LiaMarkdown />,
                    text: (
                      <>
                        <span className='text-white'>
                          Using markdown to write surpise section
                        </span>
                        , you can write surpise section with formatted text to
                        ease you write any useful information.
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </OverviewContent>
        </OverviewSection>
      </div>
    </main>
  )
}

export const metadata = {
  title: 'Undangan · RFZ',
  description: 'Undangan Pernikahan Digital',
}

export default WeddingOverview

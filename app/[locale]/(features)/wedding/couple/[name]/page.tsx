import type { ResolvingMetadata } from 'next'
import { paymentType, weddingType } from '@wedding/schema'
import { WEDDING_COLUMN, WEDDING_ROW } from '@wedding/query'
import { isHardLimit } from '@wedding/helpers'
import { WeddingConfig } from '@wedding/config'
import { supabaseService } from '@/tools/server'
import { djs } from '@/tools/lib'
import { isLocal } from '@/tools/helpers'
import { Route } from '@/tools/config'
import { localeRedirect } from '@/locale/config'
import WeddingPageClient from './client'

export const generateMetadata = async (
  {
    params,
    searchParams,
  }: Param<{ locale: string; name: string }, { to?: string }>,
  parent: ResolvingMetadata
) => {
  try {
    const supabase = supabaseService()
    const slug = searchParams.to
    const { data } = await supabase
      .from(WEDDING_ROW)
      .select('displayName,galleries,events')
      .eq('name', params.name)
      .contains('guests', JSON.stringify([{ slug }]))
      .single()

    if (data) {
      const { displayName, galleries, events } = weddingType
        .pick({ displayName: true, galleries: true, events: true })
        .parse(data)

      const capitalize = displayName
        .split(' & ')
        .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
        .join(' & ')

      const coreMeta = {
        title: `The Wedding of ${capitalize}`,
        description: djs(events[0].date).tz().format('dddd, DD MMMM YYYY'),
      }

      const photo = galleries.find(
        (item) => item.index === WeddingConfig.ImageryStartIndex
      )

      const path = process.env.NEXT_PUBLIC_IMAGEKIT_URL ?? ''
      const coupleImage = photo
        ? path + '/tr:w-900,h-900,fo-auto' + photo.fileName
        : ''

      const metadata = {
        ...coreMeta,
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? ''),
        alternates: {
          languages: {
            'id-ID': '/',
            'en-US': '/en',
          },
        },
        openGraph: {
          ...coreMeta,
          ...(!photo
            ? {}
            : {
                images: [
                  {
                    url: coupleImage,
                    width: 300,
                    height: 300,
                  },
                ],
              }),
        },
      }

      return { ...metadata }
    }
  } catch (e) {}

  return parent
}

const WeddingPage = async ({
  params,
  searchParams,
}: Param<{ name: string }, { to?: string }>) => {
  const supabase = supabaseService()
  const slug = searchParams.to
  const { data } = await supabase.auth.getSession()
  const { data: wedding, error } = await supabase
    .from(WEDDING_ROW)
    .select(WEDDING_COLUMN)
    .eq('name', params.name)
    .contains('guests', JSON.stringify([{ slug }]))
    .single()

  if (error || !wedding) {
    return localeRedirect(Route.notFound)
  }

  const payments = paymentType.array().parse(wedding.payment)
  const isInvalid = !payments.length && wedding.status !== 'live'

  // Check status by payment and its status
  if (isInvalid && !isLocal()) {
    return localeRedirect(Route.notFound)
  }

  // Check active time
  if (isHardLimit(wedding.events, payments)) {
    return localeRedirect(Route.notFound)
  }

  return (
    <WeddingPageClient
      wedding={weddingType.parse(wedding)}
      session={data.session ?? void 0}
    />
  )
}

export default WeddingPage

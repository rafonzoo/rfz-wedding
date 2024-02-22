'use client'

import type { Session } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { QueryWedding } from '@wedding/config'
import { QueryAccount } from '@account/config'
import { supabaseClient, tw } from '@/tools/lib'
import { useWeddingNavigator } from '@/tools/hook'
import { useLocalePathname, useLocaleRouter } from '@/locale/config'
import dynamic from 'next/dynamic'

type LayoutHeaderProps = {
  session?: Session
  className?: string
  wrapper?: Tag<'div'>
  container?: Tag<'header'>
}

const Dropdown = dynamic(() => import('@/components/Dropdown'), {
  ssr: false,
  loading: () => (
    <button className='mr-2 h-8 w-8 overflow-hidden rounded-full bg-zinc-200' />
  ),
})

const Alert = dynamic(() => import('@/components/Notification/Alert'), {
  ssr: false,
})

const LayoutHeader: RFZ<LayoutHeaderProps> = ({
  session,
  children,
  className,
  wrapper,
  container,
}) => {
  const [open, onOpenChange] = useState(false)
  const [logout, setLogout] = useState(false)
  const pathname = useLocalePathname()
  const items = useWeddingNavigator()
  const title = items.find((item) => item.pathname === pathname)?.title
  const defaultHidden = !session
  const avatarUrl = session?.user.user_metadata.avatar_url
  const queryClient = useQueryClient()
  const router = useLocaleRouter()
  const { mutate: signout } = useMutation({
    mutationKey: QueryAccount.accountLogout,
    mutationFn: () => supabaseClient().auth.signOut(),
    onSuccess: () => {
      queryClient.resetQueries(QueryAccount.accountSession)
      queryClient.resetQueries(QueryWedding.weddingDetail)
      queryClient.resetQueries(QueryWedding.weddingGetAll)
      queryClient.resetQueries(QueryWedding.weddingGalleries)
      queryClient.resetQueries(QueryWedding.weddingGuests)
      router.refresh()
    },
  })

  if (defaultHidden || !title) {
    return null
  }

  return (
    <header
      {...container}
      className={tw(
        'relative mx-auto flex max-w-[440px] border-b border-zinc-300 [.dark_&]:border-zinc-700',
        container?.className
      )}
    >
      <div {...wrapper} className={tw('mx-4 mt-7 w-full', wrapper?.className)}>
        <div className={tw('flex items-center py-3', className)}>
          {avatarUrl && (
            <Dropdown
              items={[
                {
                  children: 'Keluar',
                  className: tw('text-red-500'),
                  onClick: () => setLogout(true),
                },
              ]}
              root={{ open, onOpenChange }}
              content={{
                side: 'top',
                align: 'start',
                sideOffset: 12,
                className: tw('origin-top-left'),
              }}
              trigger={{
                asChild: true,
                children: (
                  <button className='mr-2 h-8 w-8 overflow-hidden rounded-full bg-zinc-200'>
                    <img
                      className='h-8 w-8 rounded-full bg-zinc-100'
                      src={avatarUrl}
                      alt='Your photo'
                    />
                  </button>
                ),
              }}
            />
          )}
          <h2 className='text-2.5xl font-bold tracking-tight'>{title}</h2>
        </div>
      </div>
      <div className='absolute right-2 top-2 flex items-center'>{children}</div>
      <Alert
        root={{ open: logout, onOpenChange: setLogout }}
        title={{ children: 'Keluar dari akun?' }}
        description={{ children: 'Anda akan keluar dari sesi ini. Lanjutkan?' }}
        cancel={{ children: 'Batal' }}
        action={{
          children: 'Keluar',
          className: tw('bg-red-600'),
          onClick: () => signout(),
        }}
      />
    </header>
  )
}

export default LayoutHeader

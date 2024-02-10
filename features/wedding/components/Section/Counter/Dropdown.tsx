'use client'

import type { MouseEvent } from 'react'
import type { Wedding } from '@wedding/schema'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { updateStatusWeddingQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import { usePayment, useUtilities } from '@/tools/hook'
import { exact } from '@/tools/helper'
import { Queries } from '@/tools/config'
import dynamic from 'next/dynamic'
import Toast from '@/components/Notification/Toast'
import Spinner from '@/components/Loading/Spinner'

const SheetPayment = dynamic(
  () => import('features/wedding/components/Sheet/Payment'),
  { ssr: false }
)

const Dropdown = dynamic(() => import('@/components/Dropdown'), {
  ssr: false,
})

const SheetDropdown: RF = () => {
  const [open, onOpenChange] = useState(false)
  const [openPayment, setOpenPayment] = useState(false)
  const [sheetTitle, setSheetTitle] = useState('Pembelian')
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const status = detail.status
  const { getSignal } = useUtilities()
  const { isForeverActive, isPaymentComplete } = usePayment()
  const isDraft = status === 'draft'
  const isNew = !detail.payment.length
  const wid = useParams().wid as string
  const toast = new Toast()
  const t = useTranslations()

  const { mutate: updateStatus, isLoading } = useMutation<
    'live' | 'draft',
    unknown,
    'live' | 'draft'
  >({
    mutationFn: (status) => {
      return updateStatusWeddingQuery({
        wid,
        signal: getSignal(),
        status,
      })
    },
    onSuccess: (status) => {
      onOpenChange(false)
      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, status })
      )
    },
    onError: (e) => {
      if ((e as Error)?.message.includes('AbortError')) {
        return
      }

      toast.error(t('error.general.failedToSave'))
    },
  })

  const publishText = isNew ? 'Tayang perdana' : 'Publish'
  const isLoadingOrComplete = isLoading || isPaymentComplete || isNew
  const items = [
    {
      disabled: isLoading,
      className: 'group',
      children: (
        <span className={tw('inline-flex w-full items-center justify-between')}>
          <span className='block group-disabled:opacity-40'>
            {isDraft ? publishText : 'Jadikan sebagai draft'}
          </span>
          {isLoading && (
            <span className='-mr-2 block'>
              <Spinner />
            </span>
          )}
        </span>
      ),
      onClick: isLoading
        ? void 0
        : (e: MouseEvent<HTMLButtonElement>) => {
            if (isNew) {
              setSheetTitle('Publish')
              setOpenPayment(true)
              onOpenChange(false)
              return
            }

            e.preventDefault()
            updateStatus(isDraft ? 'live' : 'draft')
          },
    },
    {
      disabled: isLoadingOrComplete,
      children: 'Tambahan',
      className: tw('disabled:opacity-40'),
      onClick: isLoadingOrComplete
        ? void 0
        : () => {
            setOpenPayment(true)
            setSheetTitle('Tambahan')
          },
    },
  ]

  return (
    <>
      <Dropdown
        root={{ open, onOpenChange }}
        content={{
          side: 'top',
          align: 'start',
          sideOffset: 12,
          className: tw('origin-bottom-left'),
        }}
        trigger={{
          onClick: isLoading ? void 0 : () => onOpenChange((prev) => !prev),
          disabled: isLoading,
          className: tw(
            'inline-flex -ml-3 space-x-2 h-14 items-center rounded-full pl-4 pr-6 text-center font-semibold -tracking-base text-white backdrop-blur-lg bg-black/70 border border-zinc-800'
          ),
          children: (
            <>
              <span className='relative inline-flex'>
                <span
                  className={tw('block h-4 w-4 rounded-full border', {
                    'border-amber-500': status === 'draft',
                    'border-green-500': status === 'live',
                  })}
                ></span>
                <span
                  className={tw(
                    'absolute left-1/2 top-1/2 block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                    {
                      'bg-amber-500': status === 'draft',
                      'bg-green-500': status === 'live',
                    }
                  )}
                ></span>
              </span>
              <span>{status.toUpperCase()}</span>
            </>
          ),
        }}
        items={items}
      />
      <SheetPayment
        title={sheetTitle}
        isOpen={openPayment}
        setIsOpen={setOpenPayment}
        scope={isForeverActive ? 'guest' : 'period'}
      />
    </>
  )
}

export default SheetDropdown

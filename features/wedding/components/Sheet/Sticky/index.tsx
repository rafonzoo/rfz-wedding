'use client'

import type { MouseEvent } from 'react'
import type { Wedding } from '@wedding/schema'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { deleteWeddingQuery, updateStatusWeddingQuery } from '@wedding/query'
import { QueryWedding, RouteWedding } from '@wedding/config'
import { tw } from '@/tools/lib'
import { useUtilities, useWeddingDetail, useWeddingPayment } from '@/tools/hook'
import { useLocaleRouter } from '@/locale/config'
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

const Alert = dynamic(() => import('@/components/Notification/Alert'), {
  ssr: false,
})

const SheetSticky: RF = () => {
  const [open, onOpenChange] = useState(false)
  const [openPayment, setOpenPayment] = useState(false)
  const [sheetTitle, setSheetTitle] = useState('Pembelian')
  const [showAlert, setShowAlert] = useState(false)
  const queryClient = useQueryClient()
  const router = useLocaleRouter()
  const detail = useWeddingDetail()
  const status = detail.status
  const { getSignal } = useUtilities()
  const { isPaymentComplete } = useWeddingPayment()
  const isDraft = status === 'draft'
  const isNew = !detail.payment.length
  const wid = useParams().wid as string
  const path = detail.name
  const toast = new Toast()
  const t = useTranslations()

  const { mutate: updateStatus, isLoading: isUpdating } = useMutation<
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
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, status })
      )

      queryClient.setQueryData<Wedding[] | undefined>(
        QueryWedding.weddingGetAll,
        (prev) => {
          return !prev
            ? [{ ...detail, status }]
            : prev.map((item) =>
                item.wid === wid ? { ...item, status } : item
              )
        }
      )
    },
    onError: (e) => {
      if ((e as Error)?.message.includes('AbortError')) {
        return
      }

      toast.error(t('error.general.failedToSave'))
    },
    onSettled: () => {
      onOpenChange(false)
      setShowAlert(false)
    },
  })

  const { mutate: deleteWedding, isLoading: isDeleting } = useMutation<
    string,
    unknown,
    { wid: string; path: string }
  >({
    mutationFn: ({ wid, path }) => {
      return deleteWeddingQuery({ path, wid, signal: getSignal() })
    },
    onSuccess: () => {
      queryClient
        .resetQueries({ queryKey: QueryWedding.weddingGetAll })
        .then(() => {
          toast.success(t('success.invitation.delete'))
          router.replace({
            pathname: RouteWedding.weddingEditor,
            params: { wid },
            query: { isDeleted: true },
          })
        })
    },
    onError: (e) => {
      if ((e as Error)?.message.includes('AbortError')) {
        return
      }

      toast.error((e as Error)?.message)
    },
  })

  const publishText = isNew ? 'Tayang perdana' : 'Publish'
  const isLoading = isUpdating || isDeleting
  const isLoadingOrComplete = isLoading || isPaymentComplete
  const items = [
    {
      disabled: isLoading,
      className: 'group',
      children: (
        <span className={tw('inline-flex w-full items-center justify-between')}>
          <span className='block group-disabled:opacity-50'>
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

            if (!isDraft) {
              return setShowAlert(true)
            }

            e.preventDefault()
            updateStatus('live')
          },
    },
    ...(isNew
      ? [
          {
            disabled: isLoading,
            children: 'Hapus',
            className: tw('text-red-500'),
            onClick: isLoading ? void 0 : () => setShowAlert(true),
          },
        ]
      : [
          {
            disabled: isLoadingOrComplete,
            children: 'Tambahan',
            className: tw('disabled:opacity-50'),
            onClick: isLoadingOrComplete
              ? void 0
              : () => {
                  setOpenPayment(true)
                  setSheetTitle('Tambahan')
                },
          },
        ]),
  ]

  return (
    <>
      <Dropdown
        root={{ open, onOpenChange }}
        content={{
          side: 'top',
          align: 'start',
          sideOffset: 12,
          className: tw('origin-bottom-left min-w-[272px]'),
        }}
        trigger={{
          onClick: isLoading ? void 0 : () => onOpenChange(true),
          disabled: isLoading,
          className: tw(
            'inline-flex space-x-2 h-14 items-center rounded-full pl-4 pr-6 text-center font-semibold -tracking-base text-white backdrop-blur-lg bg-black/70 border border-zinc-800'
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
        scope='guest'
      />
      <Alert
        root={{ open: showAlert, onOpenChange: setShowAlert }}
        title={{ children: isNew ? 'Hapus undangan?' : 'Kembalikan ke draft?' }}
        description={{
          children: isNew
            ? 'Undangan yang sudah dihapus tidak dapat dikembalikan. Lanjutkan?'
            : 'Tamu Anda tidak dapat menemukan undangan Anda ketika dalam mode draft. Tetap lanjutkan?',
        }}
        cancel={{ children: 'Batal', disabled: isLoading }}
        action={{
          disabled: isLoading,
          className: isNew ? tw('bg-red-600') : void 0,
          children: isLoading ? <Spinner /> : isNew ? 'Hapus' : 'OK',
          onClick: (e) => {
            e.preventDefault()
            isNew ? deleteWedding({ wid, path }) : updateStatus('draft')
          },
        }}
      />
    </>
  )
}

export default SheetSticky

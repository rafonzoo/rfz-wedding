import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  type Guest,
  type Payment,
  type PaymentToken,
  type Wedding,
  paymentType,
} from '@wedding/schema'
import { checkoutWeddingQuery, paymentWeddingQuery } from '@wedding/query'
import { localThousand, midtrans, price } from '@wedding/helpers'
import { QueryWedding, WeddingConfig } from '@wedding/config'
import { tw } from '@/tools/lib'
import {
  useAccountSession,
  useIOSVersion,
  useMountedEffect,
  useUtilities,
  useWeddingDetail,
} from '@/tools/hook'
import { AppError } from '@/tools/error'
import { ErrorMap } from '@/tools/config'
import { v4 as uuid } from 'uuid'
import dynamic from 'next/dynamic'
import Toast from '@/components/Notification/Toast'
import Spinner from '@/components/Loading/Spinner'
import FieldGroup from '@/components/FormField/Group'

type SheetPaymentProps = {
  title?: string
  isOpen?: boolean
  scope?: 'guest' | 'period'
  setIsOpen?: (open: boolean) => void
}

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const Alert = dynamic(() => import('@/components/Notification/Alert'), {
  ssr: false,
})

const SheetPayment: RFZ<SheetPaymentProps> = ({
  children,
  title,
  isOpen,
  scope,
  setIsOpen,
}) => {
  const [open, onOpenChange] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isError, setIsError] = useState(false)
  const [activeTime, setActiveTime] = useState(0)
  const [guestLength, setGuestLength] = useState(0)
  const [guestToggle, setGuestToggle] = useState(scope === 'guest')
  const [additionalGuest, setAdditionalGuest] = useState(0)
  const [unsupportedPayment, setUnsupportedPayment] = useState(false)
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()

  // Get the latest payment if they already purchase
  // prettier-ignore
  const payment = (
    detail.payment[detail.payment.length - 1] ?? null
  ) as Payment | null

  const currentGuest = queryClient.getQueryState<Guest[]>(
    QueryWedding.weddingGuests
  )
  const guests = currentGuest?.data
  const totalGuest = guestLength - WeddingConfig.GuestFree
  const isReady = !!guests

  // prettier-ignore
  const paidGuestLen = !payment ? additionalGuest || totalGuest : additionalGuest
  const paidGuest = totalGuest <= 0 ? additionalGuest : paidGuestLen

  // prettier-ignore
  const priceGuest = (
    !payment
      ? paidGuest * WeddingConfig.PricePerGuest
      : additionalGuest * WeddingConfig.PricePerGuest
  )

  const priceForever = activeTime * WeddingConfig.PriceForever
  const priceWedding = !payment ? WeddingConfig.Price : 0
  const priceActive = payment?.foreverActive ? 0 : priceForever
  const priceTax = WeddingConfig.PriceTax
  const priceTotal = priceWedding + priceActive + priceGuest
  const locale = useLocale()
  const wid = useParams().wid as string
  const toast = new Toast()
  const iOSVersion = useIOSVersion()
  const isIOS12 = iOSVersion && iOSVersion.array[0] <= 12
  const t = useTranslations()
  const priceTag = [20, 50, 100, 200, 400, 700].map((len, i, a) => ({
    text: i === a.length - 1 ? 'Max' : `${len}`,
    len,
  }))

  const sumOfAdditionalGuest = detail.payment
    .map((item) => item.additionalGuest)
    .reduce((acc, val) => acc + val, 0)

  // prettier-ignore
  const guestLeft = WeddingConfig.GuestMax - (
    WeddingConfig.GuestFree + sumOfAdditionalGuest
  )

  // prettier-ignore
  const isOverguest = (
    WeddingConfig.GuestFree + sumOfAdditionalGuest >=
    WeddingConfig.GuestMax
  )

  const session = useAccountSession()
  const { getSignal } = useUtilities()

  const { isLoading: isLoadingCheckout, mutate: checkout } = useMutation<
    Payment[],
    unknown,
    Payment[]
  >({
    mutationFn: (payload) => {
      return checkoutWeddingQuery({
        wid,
        signal: getSignal(),
        payment: payload,
      })
    },
    onSuccess: (payment) => {
      ;(setIsOpen ?? onOpenChange)(false)

      toast.success(t('success.invitation.payment'))
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, status: 'live', payment })
      )

      queryClient.setQueryData<Wedding[] | undefined>(
        QueryWedding.weddingGetAll,
        (prev) => {
          return !prev
            ? [{ ...detail, status: 'live', payment }]
            : prev.map((item) =>
                item.wid === wid ? { ...item, status: 'live', payment } : item
              )
        }
      )
    },
  })

  const { isLoading, mutate: requestPayment } = useMutation<
    PaymentToken,
    unknown,
    Omit<Payment, 'transaction'>
  >({
    mutationFn: (payment) => {
      if (!session) {
        throw new AppError(ErrorMap.authError, 'Forbidden')
      }

      const email = session.user.email ?? session.user.user_metadata.email ?? ''
      const name = session.user.user_metadata.full_name || session.user.user_metadata.name || '' // prettier-ignore

      return paymentWeddingQuery({
        wid,
        payment,
        user: {
          email,
          name: name.length < 3 ? email : name,
        },
      })
    },
    onSuccess: ({ token }, payload) => {
      ;(setIsOpen ?? onOpenChange)(false)

      if (!('snap' in window)) {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.id = 'snap-module'
        script.dataset.clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '' // prettier-ignore
        script.src = midtrans('/snap/snap.js')
        script.onload = () => onCallback(token, payload)

        document.head.append(script)
        return
      }

      onCallback(token, payload)
    },
  })

  function onCallback(token: string, payload: Omit<Payment, 'transaction'>) {
    // @ts-expect-error No type
    window.snap.pay(token, {
      onSuccess: (result: unknown) => {
        const { transaction: trx } = paymentType.shape
        const transaction = trx.parse(result)

        checkout([...detail.payment, { ...payload, transaction }])
      },
    })
  }

  function onCheckout() {
    const payload = {
      id: uuid(),
      additionalGuest: paidGuest,
      foreverActive: activeTime === 1,
      amount: priceTotal + priceTax,
    }

    requestPayment(payload)
  }

  useEffect(() => {
    if (guests) {
      setGuestLength(guests.length)
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, guests })
      )
    }
  }, [guests, queryClient])

  useMountedEffect(() => {
    return () => {
      if ('snap' in window) {
        delete window.snap

        document.getElementById('snap-midtrans')?.remove()
        document.getElementById('snap-module')?.remove()
      }
    }
  })

  async function onRefetchGuest() {
    setIsFetching(true)
    setIsError(false)

    try {
      const data = await queryClient.fetchQuery<Guest[]>({
        queryKey: QueryWedding.weddingGuests,
      })

      setGuestLength(data.length)
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, guests: data })
      )
    } catch (e) {
      setIsError(true)
    } finally {
      setIsFetching(false)
    }
  }

  function onOpenAutoFocus() {
    if (!guests) {
      onRefetchGuest()
    } else {
      if (detail.guests?.length) {
        setGuestLength(detail.guests.length)
      }
    }
  }

  function isDisabled(len: number, isLast: boolean) {
    const maxoutLen = WeddingConfig.GuestFree + sumOfAdditionalGuest

    return (
      totalGuest >= len ||
      (!isLast ? maxoutLen + len >= WeddingConfig.GuestMax : isOverguest)
    )
  }

  const PaymentButton = (
    <button
      className='mx-auto inline-flex flex-grow items-center justify-center overflow-hidden rounded-lg bg-blue-600 font-semibold text-white transition-colors duration-300 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:[.dark_&]:bg-zinc-700 disabled:[.dark_&]:text-zinc-600'
      disabled={isLoading || isLoadingCheckout || !priceTotal}
      // onClick={
      //   isLoading || isLoadingCheckout || !priceTotal
      //     ? void 0
      //     : !isIOS12
      //       ? onCheckout
      //       : () => setUnsupportedPayment(true)
      // }
    >
      {isLoading || isLoadingCheckout ? <Spinner /> : 'Bayar'}
    </button>
  )

  return (
    <>
      <BottomSheet
        option={{ useOverlay: true }}
        root={{ open: isOpen ?? open, onOpenChange: setIsOpen ?? onOpenChange }}
        header={{
          title: title ?? 'Checkout',
          prepend: isReady && (
            <button onClick={() => setGuestToggle((prev) => !prev)}>
              {!guestToggle ? 'Tamu' : 'Periode'}
            </button>
          ),
        }}
        footer={{
          useClose: true,
          wrapper: isReady ? { className: tw('!flex space-x-4') } : void 0,
          append: isReady && (
            <>
              {isIOS12 ? (
                PaymentButton
              ) : (
                <Alert
                  trigger={{ asChild: true, children: PaymentButton }}
                  title={{ children: 'Konfirmasi pembayaran' }}
                  cancel={{ children: 'Batal' }}
                  action={{
                    children: 'OK',
                    onClick:
                      isLoading || isLoadingCheckout || !priceTotal
                        ? void 0
                        : !isIOS12
                          ? onCheckout
                          : () => setUnsupportedPayment(true),
                  }}
                  description={{
                    children:
                      'Pastikan jumlah harga dan item yang Anda pesan sesuai harga yang tertera.',
                  }}
                />
              )}
            </>
            // <button
            //   className='mx-auto inline-flex flex-grow items-center justify-center overflow-hidden rounded-lg bg-blue-600 font-semibold text-white transition-colors duration-300 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:[.dark_&]:bg-zinc-700 disabled:[.dark_&]:text-zinc-600'
            //   disabled={isLoading || isLoadingCheckout || !priceTotal}
            //   onClick={
            //     isLoading || isLoadingCheckout || !priceTotal
            //       ? void 0
            //       : !isIOS12
            //         ? onCheckout
            //         : () => setUnsupportedPayment(true)
            //   }
            // >
            //   {isLoading || isLoadingCheckout ? <Spinner /> : 'Bayar'}
            // </button>
          ),
        }}
        content={{
          onOpenAutoFocus: () => {
            setGuestToggle(scope === 'guest')

            if (payment) {
              return setActiveTime(
                scope === 'period' ? 1 : Number(payment.foreverActive)
              )
            }

            setActiveTime(0)
          },
          onAnimationEnd: () => (isOpen ?? open) && onOpenAutoFocus(),
          onCloseAutoFocus: () => {
            setActiveTime(0)
            setGuestToggle(false)
            setAdditionalGuest(0)
          },
        }}
        trigger={
          typeof children === 'undefined'
            ? void 0
            : {
                asChild: true,
                children,
              }
        }
      >
        <div className='min-h-[381px]'>
          {!guests ? (
            <div className='flex min-h-[inherit] items-center justify-center'>
              {isError && !isFetching ? (
                <div className='text-center text-sm tracking-normal'>
                  <p>Oops, something went wrong..</p>
                  <button
                    className='text-blue-600 [.dark_&]:text-blue-400'
                    onClick={onRefetchGuest}
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <Spinner />
              )}
            </div>
          ) : (
            <div className='space-y-6'>
              <FieldGroup title={!guestToggle ? 'Masa aktif' : 'Tambah tamu'}>
                {!guestToggle ? (
                  <div className='space-y-4'>
                    <div
                      tabIndex={guestToggle ? -1 : 0}
                      onClick={
                        guestToggle || payment?.foreverActive
                          ? void 0
                          : () => setActiveTime(0)
                      }
                      className={tw(
                        'flex cursor-pointer select-none items-center justify-between rounded-md border border-zinc-300 px-3 py-3 transition-shadow [.dark_&]:border-zinc-700',
                        payment?.foreverActive && 'opacity-50',
                        activeTime === 0 && 'border-blue-600 shadow-focus'
                      )}
                    >
                      <div className='flex flex-col'>
                        <p>1 tahun</p>
                        <p className='text-xs tracking-base text-zinc-600 [.dark_&]:text-zinc-300'>
                          Masa aktif 1 tahun
                        </p>
                      </div>
                      <div>Free</div>
                    </div>
                    <div
                      tabIndex={guestToggle ? -1 : 0}
                      onClick={
                        guestToggle || payment?.foreverActive
                          ? void 0
                          : () => setActiveTime(1)
                      }
                      className={tw(
                        'flex cursor-pointer select-none items-center justify-between rounded-md border border-zinc-300 px-3 py-3 transition-shadow [.dark_&]:border-zinc-700',
                        payment?.foreverActive && 'opacity-50',
                        activeTime === 1 && 'border-blue-600 shadow-focus'
                      )}
                    >
                      <div className='flex flex-col'>
                        <p>Forever</p>
                        <p className='text-xs tracking-base text-zinc-600 [.dark_&]:text-zinc-300'>
                          Masa aktif tidak terbatas
                        </p>
                      </div>
                      <div>
                        {localThousand(WeddingConfig.PriceForever, locale)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='min-h-[148px]'>
                    <ul className='grid grid-cols-2 gap-3'>
                      {priceTag.map(({ text, len }, i, a) => (
                        <li key={i}>
                          <button
                            onClick={() => {
                              if (isDisabled(len, i === a.length - 1)) {
                                return
                              }

                              setAdditionalGuest((prev) => {
                                const isLast = i === a.length - 1

                                if (
                                  isLast ? prev === guestLeft : prev === len
                                ) {
                                  return 0
                                }

                                return isLast ? guestLeft : len
                              })
                            }}
                            tabIndex={
                              guestToggle &&
                              !isDisabled(len, i === a.length - 1)
                                ? 0
                                : -1
                            }
                            className={tw(
                              'h-[41.33333px] w-full rounded-md border border-zinc-300 transition-shadow [.dark_&]:border-zinc-700',
                              (i < a.length - 1 ? additionalGuest === len : additionalGuest === guestLeft) && 'border-blue-600 shadow-focus', // prettier-ignore
                              isDisabled(len, i === a.length - 1) && 'cursor-default opacity-50' // prettier-ignore
                            )}
                          >
                            {text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FieldGroup>
              <FieldGroup title='Detil harga'>
                <div className='text-sm tracking-normal'>
                  <p className='flex justify-between text-zinc-600 [.dark_&]:text-zinc-300'>
                    <span className=''>Masa aktif:</span>
                    <span>{price(priceActive, locale)}</span>
                  </p>
                  <p className='flex justify-between text-zinc-600 [.dark_&]:text-zinc-300'>
                    <span className=''>Tamu ({paidGuest}):</span>
                    <span>{price(priceGuest, locale)}</span>
                  </p>
                  <p className='flex justify-between text-zinc-600 [.dark_&]:text-zinc-300'>
                    <span>Undangan:</span>
                    <span>{price(priceWedding, locale)}</span>
                  </p>
                  <hr className='my-2 border-zinc-300 [.dark_&]:border-zinc-700' />
                  <p className='flex justify-between'>
                    <span className='flex space-x-1'>
                      <span className='font-semibold'>Total:</span>
                      <span className='text-zinc-600 [.dark_&]:text-zinc-300'>
                        {priceTotal ? `(+Tax ${localThousand(priceTax)})` : ''}
                      </span>
                    </span>
                    <span className='font-semibold'>
                      {price(priceTotal ? priceTotal + priceTax : 0, locale)}
                    </span>
                  </p>
                </div>
              </FieldGroup>
            </div>
          )}
        </div>
      </BottomSheet>
      <Alert
        root={{
          open: unsupportedPayment,
          onOpenChange: setUnsupportedPayment,
        }}
        title={{ children: 'Perangkat tidak mendukung' }}
        cancel={{ children: 'Batal', className: tw('hidden') }}
        action={{ children: 'OK' }}
        description={{
          children: (
            <>
              We are apologize. Perangkat Anda saat ini tidak mendukung sistem
              pembayaran kami. Gunakan perangkat lain dulu ya! {':)'}
              {typeof window !== 'undefined' &&
                process.env.NEXT_PUBLIC_SITE_ENV !== 'production' && (
                  <span className='mt-3 block rounded-lg bg-zinc-100 p-3 font-mono text-xs text-black'>
                    {window.navigator.userAgent}
                  </span>
                )}
            </>
          ),
        }}
      />
    </>
  )
}

export default SheetPayment

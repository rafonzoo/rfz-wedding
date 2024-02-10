import type { Guest, Payment, Wedding } from '@wedding/schema'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { checkoutWeddingQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import { useUtilities } from '@/tools/hook'
import { exact, localThousand, price } from '@/tools/helper'
import { AppConfig, Queries } from '@/tools/config'
import { v4 as uuid } from 'uuid'
import dynamic from 'next/dynamic'
import Toast from '@/components/Notification/Toast'
import Spinner from '@/components/Loading/Spinner'
import FieldGroup from '@/components/Field/Group'

type SheetPaymentProps = {
  title?: string
  isOpen?: boolean
  scope?: 'guest' | 'period'
  setIsOpen?: (open: boolean) => void
}

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
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
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))

  // Get the latest payment if they already purchase
  // prettier-ignore
  const payment = (
    detail.payment[detail.payment.length - 1] ?? null
  ) as Payment | null

  const currentGuest = queryClient.getQueryState<Guest[]>(Queries.weddingGuests)
  const guests = currentGuest?.data
  const totalGuest = guestLength - AppConfig.Wedding.GuestFree
  const isReady = !!guests

  // prettier-ignore
  const paidGuestLen = !payment ? additionalGuest || totalGuest : additionalGuest
  const paidGuest = totalGuest <= 0 ? additionalGuest : paidGuestLen

  // prettier-ignore
  const priceGuest = (
    !payment
      ? paidGuest * AppConfig.Wedding.PricePerGuest
      : additionalGuest * AppConfig.Wedding.PricePerGuest
  )

  const priceForever = activeTime * AppConfig.Wedding.PriceForever
  const priceWedding = !payment ? AppConfig.Wedding.Price : 0
  const priceActive = payment?.foreverActive ? 0 : priceForever
  const priceTax = AppConfig.Wedding.PriceTax
  const priceTotal = priceWedding + priceActive + priceGuest
  const locale = useLocale()
  const wid = useParams().wid as string
  const toast = new Toast()
  const t = useTranslations()
  const priceTag = [20, 50, 100, 200, 400, 700].map((len, i, a) => ({
    text: i === a.length - 1 ? 'Max' : `${len}`,
    len,
  }))

  const sumOfAdditionalGuest = detail.payment
    .map((item) => item.additionalGuest)
    .reduce((acc, val) => acc + val, 0)

  // prettier-ignore
  const guestLeft = AppConfig.Wedding.GuestMax - (
    AppConfig.Wedding.GuestFree + sumOfAdditionalGuest
  )

  // prettier-ignore
  const isOverguest = (
    AppConfig.Wedding.GuestFree + sumOfAdditionalGuest >=
    AppConfig.Wedding.GuestMax
  )

  const { getSignal } = useUtilities()
  const { isLoading, mutate: checkout } = useMutation<
    Payment[],
    unknown,
    Payment[]
  >({
    mutationFn: (payment) => {
      return checkoutWeddingQuery({
        signal: getSignal(),
        wid,
        payment,
      })
    },
    onSuccess: (payment) => {
      ;(setIsOpen ?? onOpenChange)(false)

      toast.success(t('success.invitation.payment'))
      setTimeout(() => {
        queryClient.setQueryData<Wedding | undefined>(
          Queries.weddingDetail,
          (prev) => (!prev ? prev : { ...prev, status: 'live', payment })
        )
      }, 640)
    },
  })

  function onCheckout() {
    const payload = {
      id: uuid(),
      additionalGuest: paidGuest,
      foreverActive: activeTime === 1,
      amount: priceTotal,
    }

    checkout([...detail.payment, payload])
  }

  useEffect(() => {
    if (guests) {
      setGuestLength(guests.length)
      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, guests })
      )
    }
  }, [guests, queryClient])

  async function onRefetchGuest() {
    setIsFetching(true)
    setIsError(false)

    try {
      const data = await queryClient.fetchQuery<Guest[]>({
        queryKey: Queries.weddingGuests,
      })

      setGuestLength(data.length)
      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
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
    const maxoutLen = AppConfig.Wedding.GuestFree + sumOfAdditionalGuest

    return (
      totalGuest >= len ||
      (!isLast ? maxoutLen + len >= AppConfig.Wedding.GuestMax : isOverguest)
    )
  }

  return (
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
          <button
            className='mx-auto inline-flex flex-grow items-center justify-center overflow-hidden rounded-lg bg-blue-600 font-semibold text-white transition-colors duration-300 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:[.dark_&]:bg-zinc-700 disabled:[.dark_&]:text-zinc-600'
            onClick={isLoading || !priceTotal ? void 0 : onCheckout}
            disabled={isLoading || !priceTotal}
          >
            {isLoading ? <Spinner /> : 'Bayar'}
          </button>
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
      trigger={{
        asChild: !!children || void 0,
        children,
      }}
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
                      payment?.foreverActive && 'opacity-40',
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
                      payment?.foreverActive && 'opacity-40',
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
                      {localThousand(AppConfig.Wedding.PriceForever, locale)}
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

                              if (isLast ? prev === guestLeft : prev === len) {
                                return 0
                              }

                              return isLast ? guestLeft : len
                            })
                          }}
                          tabIndex={
                            guestToggle && !isDisabled(len, i === a.length - 1)
                              ? 0
                              : -1
                          }
                          className={tw(
                            'h-[41.33333px] w-full rounded-md border border-zinc-300 transition-shadow [.dark_&]:border-zinc-700',
                            (i < a.length - 1 ? additionalGuest === len : additionalGuest === guestLeft) && 'border-blue-600 shadow-focus', // prettier-ignore
                            isDisabled(len, i === a.length - 1) && 'cursor-default opacity-40' // prettier-ignore
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
                  <span className='font-semibold'>
                    {priceTotal
                      ? `Total + (Tax ${localThousand(priceTax)}):`
                      : `Total:`}
                  </span>
                  <span className='font-semibold'>
                    {price(
                      priceTotal ? priceTotal + priceTax : priceTotal,
                      locale
                    )}
                  </span>
                </p>
              </div>
            </FieldGroup>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

export default SheetPayment

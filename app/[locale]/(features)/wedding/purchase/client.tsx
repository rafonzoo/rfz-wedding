'use client'

import type { Payment, Wedding } from '@wedding/schema'
import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { useLocale } from 'next-intl'
import { formatTimeTransaction, price } from '@wedding/helpers'
import { QueryWedding, WeddingConfig } from '@wedding/config'
import { djs } from '@/tools/lib'
import { useMountedEffect } from '@/tools/hook'

const TransactionItem: RF<Payment & { wid: string; name: string }> = ({
  name,
  amount,
  foreverActive,
  additionalGuest,
  transaction,
}) => {
  const { transaction_time } = transaction
  const locale = useLocale()
  const transactionName = getTransactionName()
  const [purchaseAt, setPurchaseAt] = useState('')

  const transactionTitle = {
    'RFDW-Package': 'Jenis pembelian: undangan digital',
    'RFDW-ActiveTime': 'Jenis pembelian: masa aktif',
    'RFDW-Guest': 'Jenis pembelian: tambahan tamu',
    'RFDW-Bundle': `Jenis pembelian: undangan digital + ${additionalGuest && foreverActive ? 'tambahan tamu dan masa aktif' : additionalGuest ? 'tambahan tamu' : 'masa aktif'}`,
  }[transactionName]

  function getTransactionName() {
    // prettier-ignore
    const isBundling = (
      amount - (additionalGuest * WeddingConfig.PricePerGuest + WeddingConfig.PriceTax) ===
      WeddingConfig.Price
    )

    if (!additionalGuest && !foreverActive) {
      return 'RFDW-Package'
    }

    if (foreverActive && additionalGuest) {
      return 'RFDW-Bundle'
    }

    if (foreverActive && !additionalGuest) {
      // prettier-ignore
      const isBundling = (
        amount - (WeddingConfig.PriceForever + WeddingConfig.PriceTax) ===
        WeddingConfig.Price
      )

      return isBundling ? 'RFDW-Bundle' : 'RFDW-ActiveTime'
    }

    return isBundling ? 'RFDW-Bundle' : 'RFDW-Guest'
  }

  useMountedEffect(() =>
    setPurchaseAt(
      djs(transaction_time).tz().locale(locale).format('YYYY/MM/DD - HH:mm')
    )
  )

  return (
    <li className='flex border-zinc-300'>
      <div className='flex w-full flex-col p-4 text-left'>
        <p className='truncate text-sm font-semibold tracking-normal'>
          {transactionName + ` (${name})`}
        </p>
        <p className='text-sm tracking-normal'>
          {[
            transactionTitle,
            `tipe pembayaran: ${transaction.payment_type.replace(/_+/, ' ')}`,
            ...(additionalGuest ? [`tambahan tamu: ${additionalGuest}`] : []),
            ...(foreverActive ? [`masa aktif: selamanya`] : []),
            `jumlah: ${price(amount, locale)}.`,
          ].join(', ')}
        </p>
        <p className='mt-1 flex min-h-4 justify-between text-xs tracking-base text-zinc-500'>
          {purchaseAt.split(' - ').map((time, index) => (
            <span key={index}>{time}</span>
          ))}
        </p>
      </div>
    </li>
  )
}

const TransactionPageClient: RF<{
  transactions: (Payment & { wid: string; name: string })[]
}> = ({ transactions: initialTransaction }) => {
  const queryClient = useQueryClient()
  const myWedding = queryClient.getQueryData<Wedding[] | undefined>(
    QueryWedding.weddingGetAll
  )

  const transactions = formatTimeTransaction(
    myWedding
      ?.map((item) =>
        item.payment
          ? item.payment.map((itm) => ({
              ...itm,
              wid: item.wid,
              name: item.name,
            }))
          : []
      )
      .flat() ?? initialTransaction
  )

  return (
    <div>
      <ul className='divide-y pb-[72px]'>
        {(transactions ?? initialTransaction).map((transaction, key) => (
          <TransactionItem key={key} {...transaction} />
        ))}
      </ul>
    </div>
  )
}

export default TransactionPageClient

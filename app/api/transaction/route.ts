import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { paymentType, weddingType } from '@wedding/schema'
import { WEDDING_COLUMN, WEDDING_ROW } from '@wedding/query'
import { supabaseServer, zodLocale } from '@/tools/server'
import { midtrans } from '@/tools/helper'
import { AppError } from '@/tools/error'
import { ErrorMap } from '@/tools/config'

/**
 *
 * @link https://docs.midtrans.com/docs/snap-snap-integration-guide
 */
export const POST = async (request: NextRequest) => {
  try {
    const payload = (await request.json()) as { [x: string]: unknown }
    const supabase = supabaseServer()
    const wid = weddingType.shape.wid.parse(payload.wid)
    const { data, error } = await supabase
      .from(WEDDING_ROW)
      .select(WEDDING_COLUMN)
      .eq('wid', wid)
      .single()

    if (error || !data) {
      throw new AppError(ErrorMap.authError, error?.message)
    }

    const { z } = await zodLocale(request)
    const {
      id: order_id,
      amount: gross_amount,
      foreverActive,
      additionalGuest,
    } = paymentType.omit({ transaction: true }).parse(payload.payment)

    const user = z
      .object({
        email: z.string().email(),
        name: z.string().min(3),
      })
      .parse(payload.user)

    const token = btoa(process.env.NEXT_PRIVATE_MIDTRANS_SERVER_KEY + ':')
    const endpoint = midtrans('/snap/v1/transactions')
    const payments = paymentType.array().parse(data.payment)
    const isPaymentBefore = !!payments.length

    const getProductName = () => {
      const isActiveTimePurchased = payments.some((p) => p.foreverActive)

      if (!isPaymentBefore) {
        return 'RFDW-Package'
      }

      if (foreverActive && !isActiveTimePurchased) {
        return `RFDW-${additionalGuest ? 'Bundle' : 'ActiveTime'}`
      }

      return 'RFDW-Guest'
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
      },
      body: JSON.stringify({
        transaction_details: { order_id, gross_amount },
        customer_details: {
          email: user.email,
          first_name: user.name,
        },
        item_details: {
          id: order_id,
          price: gross_amount,
          quantity: 1,
          name: getProductName(),
        },
      }),
    })

    const json = await response.json()
    const paymentTokenResponse = z
      .object({
        token: z.string().uuid(),
        redirect_url: z.string().url(),
      })
      .parse(json)

    return NextResponse.json({ data: paymentTokenResponse }, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      {
        data: null,
        message: (e as Error)?.message,
      },
      { status: 500 }
    )
  }
}

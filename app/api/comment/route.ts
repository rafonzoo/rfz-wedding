import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { commentType } from '@wedding/schema'
import { WEDDING_ROW } from '@wedding/query'
import { supabaseServer, supabaseService, zodLocale } from '@/tools/server'
import { djs } from '@/tools/lib'
import { AppError } from '@/tools/error'
import { ErrorMap, RouteCookie, RouteHeader } from '@/tools/config'

export const PATCH = async (request: NextRequest) => {
  try {
    const { z } = await zodLocale(request)
    const requestUrl = new URL(request.url)
    const wid = z.string().parse(requestUrl.searchParams.get('wid'))
    const { alias } = commentType
      .omit({ text: true, isComing: true, token: true })
      .parse(await request.json())

    const supabase = supabaseServer()
    const { data: prevData, error: prevDataError } = await supabase
      .from(WEDDING_ROW)
      .select('comments')
      .eq('wid', wid)
      .single()

    if (prevDataError) {
      throw new AppError(ErrorMap.internalError, prevDataError?.message)
    }

    const previousComment = commentType.array().parse(prevData.comments)
    const { error } = await supabase
      .from(WEDDING_ROW)
      .update({
        comments: [
          ...previousComment.filter((item) => decodeURI(item.alias) !== alias),
        ],
        updatedAt: djs().toISOString(),
      })
      .eq('wid', wid)

    if (error) {
      throw new AppError(ErrorMap.internalError, error?.message)
    }

    return NextResponse.json({ data: { alias } })
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

export const POST = async (request: NextRequest) => {
  try {
    const { z, t } = await zodLocale(request)
    const requestUrl = new URL(request.url)
    const name = z.string().parse(requestUrl.searchParams.get('name'))
    const csrfToken = cookies().get(RouteCookie.csrf)?.value
    const tokenHeader = request.headers.get(RouteHeader.csrf)

    // if (!tokenHeader || csrfToken !== tokenHeader) {
    //   throw new AppError(ErrorMap.forbiddenError, 'Forbidden.')
    // }

    const comment = commentType
      .merge(z.object({ token: z.string() }))
      .parse(await request.json())

    const supabase = supabaseService()
    const { data: prevData, error: prevDataError } = await supabase
      .from(WEDDING_ROW)
      .select('comments')
      .eq('name', name)
      .single()

    if (prevDataError) {
      throw new AppError(ErrorMap.internalError, prevDataError?.message)
    }

    const previousComment = commentType.array().parse(prevData.comments)
    const { data, error } = await supabase
      .from(WEDDING_ROW)
      .update({ comments: [...previousComment, comment] })
      .eq('name', name)
      .contains(
        'guests',
        JSON.stringify([
          {
            slug: decodeURI(comment.alias).replace(/\s+/g, '-'),
            token: comment.token,
          },
        ])
      )
      .select('comments')
      .single()

    if (!data || error) {
      throw new AppError(ErrorMap.internalError, error?.message)
    }

    return NextResponse.json({ data: commentType.parse(comment) })
  } catch (e) {
    console.log(e)
    return NextResponse.json(
      {
        data: null,
        message: (e as Error)?.message,
      },
      { status: 500 }
    )
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const { z } = await zodLocale(request)
    const requestUrl = new URL(request.url)
    const name = z.string().parse(requestUrl.searchParams.get('name'))
    const csrfToken = cookies().get(RouteCookie.csrf)?.value
    const tokenHeader = request.headers.get(RouteHeader.csrf)

    const supabase = supabaseService()
    const isAuthenticated = !!(await supabase.auth.getSession()).data.session

    if (!isAuthenticated && (!tokenHeader || csrfToken !== tokenHeader)) {
      throw new AppError(ErrorMap.forbiddenError, 'Forbidden.')
    }

    const { data, error: prevDataError } = await supabase
      .from(WEDDING_ROW)
      .select('comments')
      .eq('name', name)
      .single()

    if (!data || prevDataError) {
      throw new AppError(ErrorMap.internalError, prevDataError?.message)
    }

    const comments = commentType.array().parse(data.comments)
    return NextResponse.json({ data: comments })
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

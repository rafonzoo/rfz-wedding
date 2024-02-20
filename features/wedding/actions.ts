'use server'

import { commentType, guestType, weddingType } from '@wedding/schema'
import { WEDDING_ROW } from '@wedding/query'
import { supabaseServer, supabaseService } from '@/tools/server'
import { djs } from '@/tools/lib'
import { AppError } from '@/tools/error'
import { ErrorMap } from '@/tools/config'

export async function addGuestCommentActions(formData: FormData) {
  const { name, ...comment } = commentType
    .merge(weddingType.pick({ name: true }))
    .merge(guestType.pick({ token: true }))
    .parse({
      name: formData.get('name'),
      alias: formData.get('to'),
      token: formData.get('cid'),
      isComing: formData.get('attendance'),
      text: encodeURI((formData.get('comment') ?? '') as string),
    })

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
  const { error } = await supabase
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

  if (error) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return commentType.parse(comment)
}

export async function addAuthorCommentActions(formData: FormData) {
  const { wid, ...comment } = commentType
    .merge(weddingType.pick({ wid: true }))
    .parse({
      wid: formData.get('wid') as string,
      alias: formData.get('authorName'),
      text: encodeURI((formData.get('comment') ?? '') as string),
    })

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
  const payload = {
    comments: [...previousComment, comment],
    updatedAt: djs().toISOString(),
  }

  const { error } = await supabase
    .from(WEDDING_ROW)
    .update(payload)
    .eq('wid', wid)

  if (error) {
    throw new AppError(ErrorMap.internalError, error?.message)
  }

  return commentType.parse(comment)
}

import type { Session } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { IoArrowForwardCircle } from 'react-icons/io5'
import { type Comment, type Wedding, commentType } from '@wedding/schema'
import { addNewWeddingCommentQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import { useIsEditorOrDev } from '@/tools/hook'
import { createInitial, exact, guestAlias, guestName } from '@/tools/helper'
import { Queries } from '@/tools/config'
import Toast from '@/components/Notification/Toast'

const CommentInput: RFZ<{ csrfToken?: string }> = ({ csrfToken }) => {
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const session = queryClient.getQueryData<Session>(Queries.accountVerify)
  const hasSession = session?.user.id === detail.userId
  const cid = useSearchParams().get('cid')
  const commentId = cid ? decodeURI(cid) : null
  const alias = guestAlias(useSearchParams().get('to') ?? '')
  const isEditor = useIsEditorOrDev()
  const coupleName = useParams().name
  const defaultComment = detail.comments ?? []
  const comments = defaultComment.map((item) => ({
    ...item,
    alias: decodeURI(item.alias),
    text: decodeURI(item.text),
  }))

  const toast = new Toast()
  const isAlreadyCommented = !!comments.find((item) => item.alias === alias)
  const canComment = isEditor
    ? false
    : (commentId && !hasSession && !isAlreadyCommented) || false
  const locale = useLocale()
  const mutation = useMutation<Comment, unknown, string>({
    mutationFn: (text) => {
      const token = commentId ?? ''

      return addNewWeddingCommentQuery(
        locale,
        coupleName as string,
        {
          token,
          alias: encodeURI(alias),
          text: encodeURI(text),
        },
        csrfToken
      )
    },
    onSuccess: (comment) => {
      setComment('')

      queryClient.setQueryData<Wedding | undefined>(
        Queries.weddingDetail,
        (prev) =>
          !prev
            ? prev
            : {
                ...prev,
                comments: !prev.comments
                  ? prev.comments
                  : [...prev.comments, comment],
              }
      )
    },
    onError: (e) => {
      toast.error((e as Error)?.message)
    },
  })

  const isDisabled = mutation.isLoading || !canComment
  const [comment, setComment] = useState('')

  return (
    <div
      className={tw(
        'space-y-3',
        mutation.isLoading && 'animate-[pulse_500ms_ease-in-out_infinite]'
      )}
    >
      <div className='flex w-full space-x-3'>
        <div className='flex h-11 w-11 min-w-11 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-600'>
          <p className='text-sm tracking-wider text-zinc-500 dark:text-zinc-400'>
            {alias && createInitial(alias)}
          </p>
        </div>
        <p className='flex h-11 w-full items-center overflow-hidden rounded-lg border border-zinc-300 bg-transparent px-3 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400'>
          <span className='truncate'>
            {isEditor ? 'Nama tamu' : guestName(alias)}
          </span>
        </p>
      </div>
      <div className='relative flex w-full'>
        <textarea
          id='comment-text'
          autoComplete='off'
          disabled={isDisabled}
          className='min-h-[183px] w-full appearance-none rounded-lg border border-zinc-300 bg-transparent px-4 pb-4 pt-3 opacity-100 placeholder:text-zinc-500 dark:border-zinc-600 dark:placeholder:text-zinc-400'
          placeholder={
            isEditor
              ? 'Ucapan tamu'
              : isAlreadyCommented
                ? 'Anda sudah berkomentar'
                : 'Tulis ucapan'
          }
          value={comment}
          required
          onChange={(e) => !isDisabled && setComment(e.target.value)}
        />
        {commentType.shape.text.safeParse(comment).success &&
          !mutation.isLoading &&
          !isAlreadyCommented && (
            <button
              className='absolute bottom-3 right-3 rounded-full text-3xl text-blue-600 dark:text-blue-400'
              aria-label='Post a comment'
              onClick={() => mutation.mutate(comment)}
            >
              <IoArrowForwardCircle />
            </button>
          )}
      </div>
    </div>
  )
}

export default CommentInput

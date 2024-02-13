import type { Comment, Wedding } from '@wedding/schema'
import type { Session } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { IoArrowForwardCircle } from 'react-icons/io5'
import { BiChevronDown } from 'react-icons/bi'
import { commentType } from '@wedding/schema'
import { addNewWeddingCommentQuery } from '@wedding/query'
import { tw } from '@/tools/lib'
import { useIsEditorOrDev } from '@/tools/hook'
import { createInitial, exact, guestAlias, guestName } from '@/tools/helper'
import { Queries } from '@/tools/config'
import Toast from '@/components/Notification/Toast'

const CommentInput: RFZ<{ csrfToken?: string }> = ({ csrfToken }) => {
  const queryClient = useQueryClient()
  const detail = exact(queryClient.getQueryData<Wedding>(Queries.weddingDetail))
  const session = queryClient.getQueryData<Session>(Queries.accountSession)
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
  const mutation = useMutation<
    Comment,
    unknown,
    { comment: string; isComing: Comment['isComing'] }
  >({
    mutationFn: ({ comment, isComing }) => {
      const token = commentId ?? ''

      return addNewWeddingCommentQuery(
        locale,
        coupleName as string,
        {
          token,
          alias: encodeURI(alias),
          text: encodeURI(comment),
          isComing,
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
  const [isComing, setIsComing] = useState<Comment['isComing']>('tbd')
  const [isFocus, setIsFocus] = useState(false)

  return (
    <div
      className={tw(
        'space-y-3',
        mutation.isLoading && 'animate-[pulse_500ms_ease-in-out_infinite]'
      )}
    >
      <div className='flex w-full space-x-3'>
        <div className='flex h-11 w-11 min-w-11 items-center justify-center rounded-lg border border-zinc-300 [.dark_&]:border-zinc-600'>
          <p className='text-sm tracking-wider text-zinc-500 [.dark_&]:text-zinc-400'>
            {alias && createInitial(alias)}
          </p>
        </div>
        <p className='flex h-11 w-full items-center overflow-hidden rounded-lg border border-zinc-300 bg-transparent px-3 text-zinc-500 [.dark_&]:border-zinc-600 [.dark_&]:text-zinc-400'>
          <span className='truncate'>
            {isEditor ? 'Nama tamu' : guestName(alias)}
          </span>
        </p>
      </div>
      <div
        className={tw(
          'rounded-lg border border-zinc-300 transition-shadow [.dark_&]:border-zinc-600',
          isFocus && 'shadow-focus !border-blue-600' // prettier-ignore
        )}
      >
        <div className='flex w-full flex-col'>
          <textarea
            autoComplete='off'
            disabled={isDisabled}
            name='comment'
            className='min-h-[140px] w-full appearance-none bg-transparent px-4 pt-3 opacity-100 outline-none placeholder:text-zinc-500 [.dark_&]:placeholder:text-zinc-400'
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
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
          />
          <div className='relative flex min-h-[49px] items-center justify-between py-2 pl-4 pr-2'>
            {commentType.shape.text.safeParse(comment).success &&
              !mutation.isLoading &&
              !isAlreadyCommented && (
                <>
                  <div className='relative ml-auto -translate-x-1 text-xs tracking-base text-zinc-500'>
                    <label
                      htmlFor='comingIn'
                      className='flex flex-col'
                      onClick={(e) =>
                        e.currentTarget.querySelector('select')?.focus()
                      }
                    >
                      <span className='block'>Akan hadir?</span>
                      <select
                        id='comingIn'
                        name='comingIn'
                        className='-mt-0.5 ml-auto mr-2 block appearance-none bg-transparent text-right'
                        onChange={(e) =>
                          setIsComing(e.target.value as Comment['isComing'])
                        }
                      >
                        <option value='tbd'>&nbsp;&nbsp;TBD</option>
                        <option value='yes'>Tentu</option>
                        <option value='no'>Tidak</option>
                      </select>
                      <span className='absolute -right-0.5 bottom-0.5'>
                        <BiChevronDown />
                      </span>
                    </label>
                  </div>
                  <div className='relative mx-3'>
                    <span className='absolute top-1/2 h-8 w-px -translate-y-1/2 bg-black opacity-25 [.dark_&]:bg-white'></span>
                  </div>
                  <button
                    className='rounded-full text-3xl text-blue-600 [.dark_&]:text-blue-400'
                    aria-label='Post a comment'
                    onClick={() => mutation.mutate({ comment, isComing })}
                  >
                    <IoArrowForwardCircle />
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentInput

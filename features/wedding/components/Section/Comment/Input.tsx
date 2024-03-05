import type { Wedding } from '@wedding/schema'
import { useRef, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { IoArrowForwardCircle } from 'react-icons/io5'
import { BiChevronDown } from 'react-icons/bi'
import { commentType } from '@wedding/schema'
import { createInitial, guestAlias } from '@wedding/helpers'
import { QueryWedding } from '@wedding/config'
import {
  addAuthorCommentActions,
  addGuestCommentActions,
} from '@wedding/actions'
import { tw } from '@/tools/lib'
import { useAccountSession, useIsEditor, useWeddingDetail } from '@/tools/hook'
import Toast from '@/components/Notification/Toast'

const CommentInput: RFZ = () => {
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()
  const session = useAccountSession()
  const isOwner = session && session.user.id === detail.userId
  const cid = useSearchParams().get('cid')
  const commentId = cid ? decodeURI(cid) : null
  const isEditor = useIsEditor()
  const formRef = useRef<HTMLFormElement | null>(null)
  const comments = detail.comments.map((item) => ({
    ...item,
    text: decodeURI(item.text),
  }))

  const guestSlug = useSearchParams().get('to')
  const alias =
    !isEditor && guestSlug
      ? guestAlias(guestSlug)
      : isOwner
        ? session.user.user_metadata.full_name ||
          session.user.user_metadata.name ||
          session.user.email ||
          session.user.user_metadata.email ||
          ''
        : ''
  const toast = new Toast()
  const t = useTranslations()
  const name = useParams().name as string | undefined
  const wid = useParams().wid as string | undefined
  const isAlreadyCommented = !!comments.find(
    (item) => guestAlias(item.alias) === alias
  )

  const canComment = isEditor
    ? isOwner
    : (commentId && !isOwner && !isAlreadyCommented) || false
  const [showSubmit, setShowSubmit] = useState(false)
  const [isFocus, setIsFocus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isDisabled = isLoading || !canComment

  async function addNewComment(formData: FormData) {
    const comment = isOwner
      ? await addAuthorCommentActions(formData)
      : await addGuestCommentActions(formData)

    setIsLoading(false)
    if (comment) {
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) =>
          !prev
            ? prev
            : {
                ...prev,
                comments: [...prev.comments, comment],
              }
      )

      formRef.current?.reset()
      setShowSubmit(false)
    } else {
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) =>
          !prev
            ? prev
            : {
                ...prev,
                comments: detail.comments,
              }
      )

      toast.error(t('error.general.failedToSend', { name: t('def.comment') }))
    }
  }

  return (
    <div
      className={tw(
        'space-y-3',
        isLoading && 'animate-[pulse_500ms_ease-in-out_infinite]'
      )}
    >
      <div className='flex w-full space-x-3'>
        <div className='relative flex h-11 w-11 min-w-11 items-center justify-center rounded-lg border border-zinc-300 [.dark_&]:border-zinc-600'>
          <p className='text-sm tracking-wider text-zinc-500 [.dark_&]:text-zinc-400/75'>
            {createInitial(alias)}
          </p>
        </div>
        <p className='flex h-11 w-full items-center overflow-hidden rounded-lg border border-zinc-300 bg-transparent px-3 text-zinc-500 [.dark_&]:border-zinc-600 [.dark_&]:text-zinc-400/75'>
          <span className='truncate'>{alias}</span>
        </p>
      </div>
      <div
        className={tw(
          'rounded-lg border border-zinc-300 transition-shadow [.dark_&]:border-zinc-600',
          isFocus && 'shadow-focus !border-blue-600' // prettier-ignore
        )}
      >
        <form
          ref={formRef}
          className='flex w-full flex-col'
          onSubmit={() => setIsLoading(true)}
          action={addNewComment}
        >
          <textarea
            autoComplete='off'
            disabled={isDisabled}
            name='comment'
            className='min-h-[140px] w-full appearance-none bg-transparent px-4 pt-3 opacity-100 outline-none placeholder:text-zinc-500 [.dark_&]:placeholder:text-zinc-400/75'
            placeholder={
              isEditor
                ? 'Tambahkan komentar Anda'
                : isAlreadyCommented
                  ? 'Anda sudah berkomentar'
                  : 'Tulis ucapan'
            }
            required
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={
              isDisabled
                ? void 0
                : (e) =>
                    setShowSubmit(
                      commentType.shape.text.safeParse(e.target.value).success
                    )
            }
          />
          {!isOwner ? (
            <>
              <input type='hidden' name='name' value={name} />
              <input type='hidden' name='cid' value={commentId ?? ''} />
              <input type='hidden' name='to' value={alias} />
            </>
          ) : (
            <>
              <input type='hidden' name='wid' value={wid} />
              <input
                type='hidden'
                name='authorName'
                value={alias + '::owner'}
              />
            </>
          )}
          <div className='relative flex min-h-[49px] items-center justify-between py-2 pl-4 pr-2'>
            {!isLoading && (!isAlreadyCommented || isOwner) && showSubmit && (
              <>
                {!isOwner && (
                  <>
                    <div className='relative ml-auto -translate-x-1 text-xs tracking-base text-zinc-500'>
                      <label
                        htmlFor='attendance'
                        className='flex flex-col'
                        onClick={(e) =>
                          e.currentTarget.querySelector('select')?.focus()
                        }
                      >
                        <span className='block'>Akan hadir?</span>
                        <select
                          id='attendance'
                          name='attendance'
                          className='-mt-0.5 ml-auto mr-2 block appearance-none bg-transparent text-right'
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
                  </>
                )}
                <button
                  type='submit'
                  aria-label='Post a comment'
                  className={tw(
                    'rounded-full text-3xl text-blue-600 [.dark_&]:text-blue-400',
                    isOwner && 'ml-auto'
                  )}
                >
                  <IoArrowForwardCircle />
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CommentInput

'use client'

import type { Comment, Wedding } from '@wedding/schema'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { IoChevronDownCircleOutline } from 'react-icons/io5'
import { FaCircleMinus } from 'react-icons/fa6'
import {
  getAllWeddingCommentQuery,
  removeWeddingCommentQuery,
} from '@wedding/query'
import {
  createInitial,
  groupName,
  guestAlias,
  guestName,
} from '@wedding/helpers'
import { QueryWedding } from '@wedding/config'
import { tw } from '@/tools/lib'
import {
  useAccountSession,
  useIntersection,
  useWeddingDetail,
} from '@/tools/hook'
import dynamic from 'next/dynamic'
import Text from '@wedding/components/Text'
import CommentSurprise from '@wedding/components/Section/Comment/Surprise'
import CommentInput from '@wedding/components/Section/Comment/Input'
import Toast from '@/components/Notification/Toast'
import Spinner from '@/components/Loading/Spinner'

const Alert = dynamic(() => import('@/components/Notification/Alert'), {
  ssr: false,
})

const CommentList: RFZ<{ csrfToken?: string }> = ({ csrfToken }) => {
  const divRef = useRef<HTMLDivElement | null>(null)
  const isIntersection = useIntersection(divRef)
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()
  const guestSlug = useSearchParams().get('to') ?? ''
  const guestFullName = guestAlias(guestSlug)
  const session = useAccountSession()
  const wid = useParams().wid as string
  const hasSession = !!(session?.user.id === detail.userId && wid)
  const comments = (detail.comments ?? []).map((item) => ({
    ...item,
    alias: decodeURI(item.alias),
    text: decodeURI(item.text),
  }))

  const toast = new Toast()
  const locale = useLocale()
  const myComment = comments.find((item) => item.alias === guestFullName)
  const allComment = useQuery<{ comments: Comment[] }>({
    queryKey: QueryWedding.weddingComments,
    queryFn: () => {
      return getAllWeddingCommentQuery(locale, detail.name, csrfToken)
    },
    onSuccess: ({ comments }) => {
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, comments })
      )
    },
    onError: (e) => {
      toast.error((e as Error)?.message)
    },
  })

  const [page, setPage] = useState(1)
  const first = comments[0] as Comment | undefined
  const last = myComment ?? comments[comments.length - 1]
  const theComments = [
    ...(first ? [first] : []),
    ...comments
      .filter(
        (item) => item.alias !== first?.alias && item.alias !== last.alias
      )
      .slice(0, page),
    ...(comments.length > 1 ? [last] : []),
  ]

  const {
    isLoading,
    mutate: removeComment,
    variables: removedComment,
  } = useMutation<{ alias: string }, unknown, { alias: string }>({
    mutationFn: ({ alias }) => {
      return removeWeddingCommentQuery(locale, wid, { alias })
    },
    onSuccess: ({ alias }) => {
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) =>
          !prev
            ? prev
            : {
                ...prev,
                comments: !prev.comments
                  ? prev.comments
                  : prev.comments.filter(
                      (item) => decodeURI(item.alias) !== decodeURI(alias)
                    ),
              }
      )
    },
    onError: (e) => {
      toast.error((e as Error)?.message)
    },
  })

  useEffect(() => {
    if (isIntersection && !allComment.isFetched) {
      allComment.refetch()
    }
  }, [allComment, isIntersection])

  return (
    <div ref={divRef}>
      {!allComment.data ? (
        <div className='flex h-[276px] w-full flex-col items-center justify-center space-y-1 text-center text-sm tracking-normal'>
          {!allComment.isError ? (
            <Spinner />
          ) : (
            <>
              <p>Oops, something went wrong..</p>
              <button
                className='text-blue-600 [.dark_&]:text-blue-400'
                onClick={() => allComment.refetch()}
              >
                Try again
              </button>
            </>
          )}
        </div>
      ) : (
        <div className='relative z-[1]'>
          <Text family='cinzel' className='text-xl'>
            {comments.length + ' ucapan'}
          </Text>
          <ul
            className={tw(
              'relative mt-3 space-y-4',
              comments.length > 0 && 'pb-6'
            )}
          >
            {theComments.map(({ alias, text, isComing }, idx, array) => (
              <li className='relative z-[1]' key={idx}>
                {comments.length > 3 &&
                  idx === array.length - 1 &&
                  page < comments.length - 1 && (
                    <div className='mb-4 ml-14 flex items-center justify-center space-x-1 bg-[url(/assets/bg/dotted-light.png)] bg-no-repeat [.dark_&]:bg-[url(/assets/bg/dotted-dark.png)]'>
                      <button
                        className='flex items-center bg-white pl-4 pr-3 tracking-normal text-blue-600 transition-colors duration-200 ease-out [.dark_&]:bg-black [.dark_&]:text-blue-400'
                        onClick={() => {
                          if (page < comments.length - 1) {
                            setPage((prev) => prev + 3)
                          }
                        }}
                      >
                        Load more
                        <span className='ml-1 block text-xl text-blue-600 [.dark_&]:text-blue-400'>
                          <IoChevronDownCircleOutline />
                        </span>
                      </button>
                      {/* <button
                  onClick={() => {
                    if (page >= 2) {
                      setPage((prev) => prev - 1)
                    }
                  }}
                >
                  collapse
                </button> */}
                    </div>
                  )}
                <div
                  className={tw(
                    'relative flex w-full space-x-3',
                    isLoading && removedComment?.alias === alias && 'animate-[pulse_500ms_ease-in-out_infinite]' // prettier-ignore
                  )}
                >
                  <div className='relative flex h-11 w-11 min-w-11 items-center justify-center rounded-lg bg-zinc-100 [.dark_&]:bg-zinc-800'>
                    <p className='text-sm tracking-normal text-zinc-500 [.dark_&]:text-zinc-400'>
                      {createInitial(alias)}
                    </p>
                    <span
                      className={tw(
                        'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full',
                        {
                          'bg-amber-500': isComing === 'tbd',
                          'bg-red-500': isComing === 'no',
                          'bg-green-600': isComing === 'yes',
                        }
                      )}
                    />
                  </div>
                  <div className='relative flex flex-grow flex-col space-y-1.5 overflow-hidden rounded-lg bg-zinc-100 p-4 [.dark_&]:bg-zinc-800'>
                    <p className='flex space-x-1.5'>
                      <strong className='block leading-5'>
                        {guestName(alias)}
                      </strong>
                      {alias === guestFullName && (
                        <span className='block text-sm tracking-normal text-zinc-500'>
                          (Anda)
                        </span>
                      )}
                    </p>
                    <p>{decodeURI(text)}</p>
                    {groupName(alias) && (
                      <span className='block text-sm leading-5 tracking-normal text-zinc-500'>
                        {groupName(alias)}
                      </span>
                    )}
                  </div>
                  {hasSession &&
                    !(isLoading && removedComment?.alias === alias) &&
                    alias !== 'GGRFZ Team' && (
                      <Alert
                        trigger={{
                          asChild: true,
                          children: (
                            <button
                              aria-label='Remove comment'
                              disabled={isLoading && removedComment?.alias === alias } // prettier-ignore
                              className={tw(
                                'absolute -right-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-red-600',
                                isLoading && removedComment?.alias === alias && 'opacity-50' // prettier-ignore
                              )}
                            >
                              <FaCircleMinus />
                            </button>
                          ),
                        }}
                        title={{ children: 'Hapus komentar' }}
                        description={{
                          children:
                            'Tamu Anda nantinya tetap bisa berkomentar walaupun Anda pernah menghapusnya. Tetap lanjutkan?',
                        }}
                        cancel={{ children: 'Batal' }}
                        action={{
                          children: 'OK',
                          onClick: () => removeComment({ alias }),
                        }}
                      />
                    )}
                </div>
              </li>
            ))}
            {/* Left Border */}
            {comments.length > 0 && (
              <span className='absolute bottom-0 left-[21px] h-full w-px bg-zinc-300 [.dark_&]:bg-zinc-600' />
            )}
          </ul>
          {/* User Comment */}
          <CommentInput csrfToken={csrfToken} />
          <CommentSurprise />
        </div>
      )}
    </div>
  )
}

export default CommentList

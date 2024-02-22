'use client'

import type { Wedding } from '@wedding/schema'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams, useSearchParams } from 'next/navigation'
import { IoChevronDownCircleOutline } from 'react-icons/io5'
import { FaCircleMinus } from 'react-icons/fa6'
import { deleteWeddingCommentQuery } from '@wedding/query'
import { createInitial, groupName, guestAlias } from '@wedding/helpers'
import { QueryWedding, WeddingConfig } from '@wedding/config'
import { tw } from '@/tools/lib'
import { useAccountSession, useWeddingDetail } from '@/tools/hook'
import dynamic from 'next/dynamic'
import Text from '@wedding/components/Text'
import CommentSurprise from '@wedding/components/Section/Comment/Surprise'
import CommentInput from '@wedding/components/Section/Comment/Input'
import Toast from '@/components/Notification/Toast'

const Alert = dynamic(() => import('@/components/Notification/Alert'), {
  ssr: false,
})

const CommentList: RF = () => {
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()
  const guestSlug = useSearchParams().get('to') ?? ''
  const guestFullName = guestAlias(guestSlug)
  const session = useAccountSession()
  const wid = useParams().wid as string
  const hasSession = session && session.user.id === detail.userId
  const comments = detail.comments.map((item) => ({
    ...item,
    alias: decodeURI(item.alias),
    text: decodeURI(item.text),
  }))

  const toast = new Toast()
  // In guest perspective and if author replies them, the view seems absurd. Disabled for now.
  //
  // const first = comments[0] as Comment | undefined
  // const myComment = comments.find((item) => item.alias === guestFullName)
  // const last = myComment ?? comments[comments.length - 1]

  // This will filter the guest comment and make them last as above code is implemented.
  //
  // !wid
  //   ? n.alias !== first?.alias && n.alias !== last.alias
  //   : index > 0 && index < array.length - 1
  const theComments = [
    ...comments.slice(0, 1),
    ...comments
      .filter((n, index, array) => index > 0 && index < array.length - 1)
      .slice(0, !page ? 1 : page * WeddingConfig.MaxCollapsedComment + 1),
    ...(comments.length > 1 ? comments.slice(-1) : []),
  ]

  const {
    isLoading,
    mutate: removeComment,
    variables: removedComment,
  } = useMutation<
    { alias: string; index?: number },
    unknown,
    { alias: string; index?: number }
  >({
    mutationFn: ({ alias, index }) => {
      return deleteWeddingCommentQuery({
        wid,
        alias,
        index,
      })
    },
    onSuccess: ({ alias, index: deletedIndex }) => {
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) =>
          !prev
            ? prev
            : {
                ...prev,
                comments: !prev.comments
                  ? prev.comments
                  : prev.comments.filter((item, index) =>
                      deletedIndex
                        ? index !== deletedIndex
                        : decodeURI(item.alias) !== decodeURI(alias)
                    ),
              }
      )
    },
    onError: (e) => {
      toast.error((e as Error)?.message)
    },
  })

  function isRemoving(currentAlias: string, currentIndex: number) {
    if (!removedComment) {
      return false
    }

    const { alias, index } = removedComment
    return isLoading && index ? index === currentIndex : alias === currentAlias
  }

  return (
    <div>
      <div className='relative z-[1]'>
        <Text family='cinzel' className='text-xl'>
          {comments.length + ' ucapan'}
        </Text>
        <ul
          className={tw(
            'after:absolute after:bottom-0 after:left-[21px] after:h-full after:w-px after:bg-zinc-300 after:content-[""] after:[.dark_&]:bg-zinc-600',
            'relative mt-3 space-y-4',
            comments.length > 0 && 'pb-6'
          )}
        >
          {theComments.map(({ alias, text, token, isComing }, index, array) => (
            <li className='relative z-[1]' key={index}>
              {comments.length > 3 &&
                index === array.length - 1 &&
                array.length < comments.length && (
                  <div className='mb-4 ml-14 flex items-center justify-center space-x-1 bg-[url(/assets/bg/dotted-light.png)] bg-no-repeat [.dark_&]:bg-[url(/assets/bg/dotted-dark.png)]'>
                    <button
                      className='flex items-center bg-white pl-4 pr-3 tracking-normal text-blue-600 transition-colors duration-200 ease-out [.dark_&]:bg-black [.dark_&]:text-blue-400'
                      onClick={() => {
                        if (page < comments.length - 1) {
                          setPage((prev) => prev + 1)
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
                        if (page >= 1) {
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
                  isLoading && isRemoving(alias, index) && 'animate-[pulse_500ms_ease-in-out_infinite]' // prettier-ignore
                )}
              >
                <div className='relative flex h-11 w-11 min-w-11 items-center justify-center rounded-lg bg-zinc-100 [.dark_&]:bg-zinc-800'>
                  <p className='text-sm tracking-wider text-zinc-600 [.dark_&]:text-zinc-400'>
                    {createInitial(alias)}
                  </p>
                  {(isComing || !token) && (
                    <span
                      className={tw(
                        'absolute -right-1 -top-1 h-3 w-3 rounded-full',
                        {
                          'bg-amber-500': isComing === 'tbd',
                          'bg-red-500': isComing === 'no',
                          'bg-green-600': isComing === 'yes',
                          'bg-blue-500': !token,
                        }
                      )}
                    />
                  )}
                </div>
                <div className='relative flex flex-grow flex-col space-y-1.5 overflow-hidden rounded-lg bg-zinc-100 p-4 [.dark_&]:bg-zinc-800'>
                  <p className='flex space-x-1.5'>
                    <strong className='flex items-center leading-5'>
                      {guestAlias(alias)}
                    </strong>
                    {((alias === guestFullName && token) || !token) && (
                      <span className='block text-sm tracking-normal text-zinc-500'>
                        ({token || !!wid ? 'Anda' : 'Owner'})
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
                {hasSession && !!wid && alias !== 'RFZ Team' && (
                  <Alert
                    trigger={{
                      asChild: true,
                      children: (
                        <button
                          aria-label='Remove comment'
                          disabled={isLoading && isRemoving(alias, index)}
                          className={tw(
                            'absolute -right-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-red-600',
                            isLoading && isRemoving(alias, index) && 'opacity-50' // prettier-ignore
                          )}
                        >
                          <FaCircleMinus />
                        </button>
                      ),
                    }}
                    title={{ children: 'Hapus komentar' }}
                    description={{
                      children: token
                        ? 'Tamu Anda nantinya tetap bisa berkomentar walaupun Anda pernah menghapusnya. Tetap lanjutkan?'
                        : 'Anda yakin untuk menghapus komentar Anda?',
                    }}
                    cancel={{ children: 'Tidak' }}
                    action={{
                      children: 'Ya',
                      className: tw('bg-red-600'),
                      onClick: () => {
                        const selectedAuthorIndex = comments.findIndex(
                          (comment) => !comment.token && comment.text === text
                        )

                        const authorIndex =
                          selectedAuthorIndex === -1
                            ? void 0
                            : selectedAuthorIndex

                        removeComment({ alias, index: authorIndex })
                      },
                    }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
        {/* User Comment */}
        <CommentInput />
        <CommentSurprise />
      </div>
    </div>
  )
}

export default CommentList

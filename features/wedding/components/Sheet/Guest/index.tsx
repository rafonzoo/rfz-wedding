'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { VscRefresh } from 'react-icons/vsc'
import { type Guest, type Wedding, commentType } from '@wedding/schema'
import {
  WEDDING_ROW,
  getAllWeddingGuestQuery,
  updateWeddingGuestQuery,
} from '@wedding/query'
import { guestAlias } from '@wedding/helpers'
import { QueryWedding } from '@wedding/config'
import { djs, supabaseClient, tw } from '@/tools/lib'
import {
  useIOSVersion,
  useMountedEffect,
  useUtilities,
  useWeddingDetail,
  useWeddingPayment,
} from '@/tools/hook'
import { isArrayEqual } from '@/tools/helpers'
import { AppError } from '@/tools/error'
import { ErrorMap } from '@/tools/config'
import dynamic from 'next/dynamic'
import SheetGuestList from '@wedding/components/Sheet/Guest/List'
import SheetGuestAction from '@wedding/components/Sheet/Guest/Action'
import Toast from '@/components/Notification/Toast'
import Spinner from '@/components/Loading/Spinner'
import FieldSearch from '@/components/FormField/Search'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const SheetPayment = dynamic(
  () => import('features/wedding/components/Sheet/Payment'),
  { ssr: false }
)

const Alert = dynamic(() => import('@/components/Notification/Alert'), {
  ssr: false,
})

const SheetGuest: RFZ = () => {
  const [open, onOpenChange] = useState(false)
  const [openPayment, setOpenPayment] = useState(false)
  const [isAddShown, setIsAddShown] = useState(false)
  const [isModeEdit, setIsModeEdit] = useState(false)
  const [isError, setIsError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { getSignal: querySignal } = useUtilities()
  const { getSignal: mutationSignal } = useUtilities()
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const wid = useParams().wid as string
  const detail = useWeddingDetail()
  const toast = new Toast()
  const iOSVersion = useIOSVersion()
  const isIOS12 = iOSVersion && iOSVersion.array[0] <= 12
  const t = useTranslations()
  const {
    refetch: getAllGuest,
    data: guests,
    isFetched,
    isLoading,
  } = useQuery({
    queryKey: QueryWedding.weddingGuests,
    queryFn: () => {
      return getAllWeddingGuestQuery({
        signal: querySignal(),
        wid,
      })
    },
    onError: () => {
      setIsError(true)

      if (isIOS12) {
        return toast.error(t('error.general.failedToFetch'))
      }

      toast.error(t('error.general.failedToLoad', { name: t('def.guest') }))
    },
  })

  const { isRequirePayment, isGuestMaxout, guestTrackCounts } =
    useWeddingPayment()
  const { mutate: saveGuest, isLoading: isSaving } = useMutation<
    Guest[],
    unknown,
    Guest[]
  >({
    mutationFn: (payload) => {
      return updateWeddingGuestQuery({
        signal: mutationSignal(),
        wid,
        payload,
      })
    },
    onSuccess: async (updatedGuests) => {
      const comments = detail.comments

      setPreviousGuests(updatedGuests)
      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, guests: updatedGuests })
      )

      if (comments) {
        const validateComment = comments.filter(
          (comment) =>
            !updatedGuests.some(
              (guest) => guestAlias(guest.slug) === comment.alias
            )
        )

        if (validateComment.length) {
          const checkComment = comments.map((comment) => {
            // prettier-ignore
            if (updatedGuests.findIndex(({ token }) => token === comment.token) === -1) {
              return null
            }

            if (validateComment.find(({ token }) => token === comment.token)) {
              const invalidGuest = updatedGuests.find(
                (guest) => guest.token === comment.token
              )

              if (!invalidGuest) {
                return comment
              }

              return { ...comment, alias: guestAlias(invalidGuest.slug) }
            }

            return comment
          })

          const latestComment = checkComment.filter(Boolean)

          try {
            const { data, error } = await supabaseClient()
              .from(WEDDING_ROW)
              .update({
                comments: latestComment,
                updatedAt: djs().toISOString(),
              })
              .eq('wid', wid)
              .select('comments')
              .single()

            if (error || !data) {
              throw new AppError(ErrorMap.internalError, error.message)
            }

            const updatedComments = commentType.array().parse(data.comments)
            queryClient.setQueryData<Wedding | undefined>(
              QueryWedding.weddingDetail,
              (prev) => (!prev ? prev : { ...prev, comments: updatedComments })
            )
          } catch (e) {
            toast.error('Failed to update named guest in the comment.')
          }
        }
      }
    },
    onError: () => {
      toast.error(t('error.general.failedToSave'))
    },
  })

  const [previousGuests, setPreviousGuests] = useState(guests)
  const [editedGuestId, setEditedGuestId] = useState(-1)
  const isShowAction = isAddShown || editedGuestId !== -1

  // prettier-ignore
  const isEqual = (
    !guests || !previousGuests ||
    isArrayEqual(
      (guests ?? []).map((guest) => guest.slug),
      (previousGuests ?? []).map((guest) => guest.slug)
    )
  )

  useMountedEffect(() => {
    return () => revert()
  })

  useEffect(() => {
    if (!guests?.length && isModeEdit) {
      setIsModeEdit(false)
    }
  }, [guests?.length, isModeEdit])

  useEffect(() => {
    if (!previousGuests && guests && isFetched && !isError) {
      setPreviousGuests(guests)
    }
  }, [guests, isFetched, isError, previousGuests])

  useEffect(() => {
    if (isRequirePayment && isAddShown) {
      setIsAddShown(false)
    }
  }, [isAddShown, isRequirePayment])

  function revert() {
    onCloseAutoFocus()
    queryClient.setQueryData<Guest[] | undefined>(
      QueryWedding.weddingGuests,
      previousGuests
    )
  }

  function onSave() {
    if (!guests || !previousGuests) return

    // Close after edit / add guest
    // Note: Commented bcs its annoying UX
    // setEditedGuestId(-1)
    // setIsAddShown(false)

    setIsModeEdit(false)
    saveGuest(guests)
  }

  function onCloseAutoFocus() {
    setEditedGuestId(-1)
    setIsModeEdit(false)
    setIsAddShown(false)
    setSearchQuery('')
  }

  function onEdit(id: number) {
    setEditedGuestId((prev) => (prev === id ? -1 : id))
    setIsAddShown(editedGuestId !== id)
    setIsModeEdit(false)
  }

  function onToggleAction() {
    if (isRequirePayment && editedGuestId === -1) {
      onOpenChange(false)
      setOpenPayment(true)

      return
    }
    setEditedGuestId((prev) => (prev === -1 ? prev : -1))
    setIsAddShown((prev) => !prev)
    setIsModeEdit(false)
  }

  function onToggleDelete() {
    setIsModeEdit((prev) => !prev)
    setIsAddShown(false)
    setEditedGuestId(-1)
  }

  async function fetchQuery() {
    setIsError(false)

    try {
      const guests = await getAllGuest()

      if (guests.data) {
        queryClient.setQueryData<Wedding | undefined>(
          QueryWedding.weddingDetail,
          (prev) => (!prev ? prev : { ...prev, guests: guests.data })
        )
      }
    } catch (error) {
      setIsError(true)
    }
  }

  // NOTE: Guest tracker
  // useEffect(() => console.log(guests, previousGuests), [guests, previousGuests])

  return (
    <>
      <BottomSheet
        root={{ open, onOpenChange }}
        option={{ useOverlay: true }}
        wrapper={{ className: 'h-full' }}
        content={{
          className: 'h-full',
          onCloseAutoFocus,
          onAnimationEnd: () => open && !guests && fetchQuery(),
        }}
        header={{
          title: 'Daftar tamu',
          prepend: guests?.length && guests.length > 1 && (
            <button
              aria-label='Edit list'
              disabled={isSaving}
              onClick={isSaving ? void 0 : onToggleDelete}
              className={tw(isSaving ? 'opacity-50' : '')}
            >
              {!isModeEdit ? 'Edit' : 'Batal'}
            </button>
          ),
          append: !!guests?.length && !isGuestMaxout && (
            <button
              aria-label='Add new guest'
              disabled={isSaving}
              onClick={isSaving ? void 0 : onToggleAction}
              className={tw(
                'relative flex h-5 w-5 items-center justify-center text-xl transition-transform duration-300',
                isShowAction && 'rotate-90',
                isSaving && 'opacity-50'
              )}
            >
              <span
                className={tw(
                  'absolute top-1/2 h-px w-4 -translate-y-1/2 rounded-xl bg-[currentColor] transition-transform',
                  isShowAction && 'rotate-90'
                )}
              />
              <span
                className={tw(
                  'absolute left-1/2 h-4 w-px -translate-x-1/2 rounded-xl bg-[currentColor] transition-transform',
                  isShowAction && 'scale-y-0'
                )}
              />
            </button>
          ),
        }}
        trigger={{
          asChild: true,
          children: <button className='text-blue-500'>Atur tamu</button>,
        }}
        footer={{
          useClose: true,
          wrapper: { className: tw('grid-cols-3') },
          append: (
            <button
              className='mx-auto inline-flex w-full items-center justify-center overflow-hidden rounded-lg bg-blue-600 font-semibold text-white transition-colors duration-300 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:[.dark_&]:bg-zinc-700 disabled:[.dark_&]:text-zinc-600'
              disabled={isSaving || isEqual || isError}
              onClick={isSaving || isEqual || isError ? void 0 : onSave}
            >
              {isSaving || isLoading ? <Spinner /> : 'Simpan'}
            </button>
          ),
          prepend: !(isSaving || isEqual || isError) && (
            <Alert
              title={{ children: 'Batalkan perubahan?' }}
              description={{
                children:
                  'Tamu yang sudah ditulis atau dihapus akan dikembalikan seperti semula. Lanjutkan?',
              }}
              cancel={{ children: 'Batal' }}
              action={{
                children: 'OK',
                onClick: () => revert(),
              }}
              trigger={{
                asChild: true,
                children: (
                  <button className='absolute right-4 top-4 flex h-11 w-11 -rotate-45 -scale-x-100 items-center justify-center rounded-full text-2xl text-red-500'>
                    <VscRefresh />
                  </button>
                ),
              }}
            />
          ),
        }}
      >
        <div className='relative h-[inherit]'>
          {!guests ? (
            <div className='absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center'>
              {isError && !isLoading ? (
                <div className='text-center text-sm tracking-normal'>
                  <p>Oops, something went wrong..</p>
                  <button
                    className='text-blue-600 [.dark_&]:text-blue-400'
                    onClick={fetchQuery}
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <Spinner />
              )}
            </div>
          ) : (
            <div className='flex h-[inherit] flex-col'>
              <div className='sticky top-0 z-20 bg-white translate-z-0 [.dark_&]:bg-zinc-800'>
                <div className='relative'>
                  {guests.length > 5 && (
                    <div className='px-2 pb-2 pt-px'>
                      <FieldSearch
                        ref={searchRef}
                        placeholder='Search...'
                        value={searchQuery}
                        disabled={isSaving || isError}
                        onChange={
                          (e) =>
                          !(isSaving || isError) && setSearchQuery(e.target.value) // prettier-ignore
                        }
                      />
                    </div>
                  )}
                </div>
                <hr className='border-t-zinc-300 [.dark_&]:border-t-zinc-700' />
              </div>
              <div
                ref={scrollRef}
                className='h-full overflow-scroll overflow-y-auto translate-z-0'
              >
                <SheetGuestList
                  isModeEdit={isModeEdit}
                  editedGuestId={editedGuestId}
                  searchQuery={searchQuery}
                  onEdit={onEdit}
                  isSynced={isEqual}
                  previousGuest={previousGuests ?? []}
                />
              </div>
              <div className='sticky bottom-0 mt-auto translate-z-0'>
                <hr className='border-t-zinc-300 [.dark_&]:border-t-zinc-700' />
                <div className='bg-zinc-100 px-4 py-2 [.dark_&]:bg-zinc-700'>
                  <p className='text-xs tracking-base'>
                    <span>Jumlah tamu: </span>
                    <span
                      className={tw(
                        'font-semibold',
                        guests.length > guestTrackCounts && 'text-red-500'
                      )}
                    >
                      {guests.length}
                    </span>
                    {' / '}
                    <span className='font-semibold'>{guestTrackCounts}</span>
                  </p>
                </div>
                <hr className='border-t-zinc-300 [.dark_&]:border-t-zinc-700' />
                <SheetGuestAction
                  searchRef={searchRef}
                  editId={editedGuestId}
                  scrollRef={scrollRef}
                  isShow={isShowAction}
                  isSynced={isEqual}
                />
              </div>
            </div>
          )}
        </div>
      </BottomSheet>
      <SheetPayment
        isOpen={openPayment}
        setIsOpen={setOpenPayment}
        scope='guest'
      />
    </>
  )
}

export default SheetGuest

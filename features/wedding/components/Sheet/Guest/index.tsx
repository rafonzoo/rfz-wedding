'use client'

import type { Guest, Wedding } from '@wedding/schema'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useTranslations } from 'next-intl'
import { VscRefresh } from 'react-icons/vsc'
import {
  addNewWeddingGuestQuery,
  getAllWeddingGuestQuery,
} from '@wedding/query'
import { tw } from '@/tools/lib'
import { useMountedEffect, useUtilities } from '@/tools/hook'
import { exact, isArrayEqual } from '@/tools/helper'
import { Queries } from '@/tools/config'
import dynamic from 'next/dynamic'
import SheetGuestList from '@wedding/components/Sheet/Guest/List'
import SheetGuestAction from '@wedding/components/Sheet/Guest/Action'
import Toast from '@/components/Notification/Toast'
import Spinner from '@/components/Loading/Spinner'
import FieldSearch from '@/components/Field/Search'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

const SheetGuest: RFZ = () => {
  const [open, onOpenChange] = useState(false)
  const [isAddShown, setIsAddShown] = useState(false)
  const [isModeEdit, setIsModeEdit] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()
  const { getSignal: querySignal } = useUtilities()
  const { getSignal: mutationSignal } = useUtilities()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const { wid } = exact(
    queryClient.getQueryData<Wedding>(Queries.weddingDetail)
  )
  const toast = new Toast()
  const t = useTranslations()
  const {
    refetch: getAllGuest,
    data: guests,
    isLoading,
    isFetched,
    isError,
  } = useQuery({
    queryKey: Queries.weddingGuests,
    queryFn: () => {
      return getAllWeddingGuestQuery({
        signal: querySignal(),
        wid,
      })
    },
    onError: () => {
      toast.error(t('error.guest.failedToFetch'))
    },
  })

  const { mutate: saveGuest, isLoading: isSaving } = useMutation<
    Guest[],
    unknown,
    Guest[]
  >({
    mutationFn: (payload) => {
      return addNewWeddingGuestQuery({
        signal: mutationSignal(),
        wid,
        payload,
      })
    },
    onSuccess: (updatedGuests) => setPreviousGuests(updatedGuests),
    onError: () => {
      toast.error(t('error.guest.failedToSave'))
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

  function revert() {
    queryClient.setQueryData<Guest[] | undefined>(
      Queries.weddingGuests,
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
    setEditedGuestId((prev) => (prev === -1 ? prev : -1))
    setIsAddShown((prev) => !prev)
    setIsModeEdit(false)
  }

  function onToggleDelete() {
    setIsModeEdit((prev) => !prev)
    setIsAddShown(false)
    setEditedGuestId(-1)
  }

  // NOTE: Guest tracker
  // useEffect(() => console.log(guests, previousGuests), [guests, previousGuests])

  return (
    <BottomSheet
      root={{ open, onOpenChange }}
      option={{ useOverlay: true }}
      wrapper={{ className: 'h-full' }}
      content={{
        className: 'h-full',
        onCloseAutoFocus,
        onAnimationEnd: () => open && !guests && getAllGuest(),
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
        append: !!guests?.length && (
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
            className='mx-auto inline-flex w-full items-center justify-center overflow-hidden rounded-lg bg-blue-600 font-semibold text-white transition-colors duration-300 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:dark:bg-zinc-700 disabled:dark:text-zinc-600'
            disabled={isSaving || isEqual || isError}
            onClick={isSaving || isEqual || isError ? void 0 : onSave}
          >
            {isSaving ? <Spinner /> : 'Simpan'}
          </button>
        ),
        prepend: !(isSaving || isEqual || isError) && (
          <button
            className='absolute right-4 top-4 flex h-11 w-11 -rotate-45 -scale-x-100 items-center justify-center rounded-full text-2xl text-red-500'
            onClick={() => revert()}
          >
            <VscRefresh />
          </button>
        ),
      }}
    >
      <div className='relative h-[inherit]'>
        {!guests || isLoading ? (
          <div className='absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center'>
            {!guests && isError && !isLoading ? (
              <div className='text-center text-sm tracking-normal'>
                <p>Oops, something went wrong..</p>
                <button
                  className='text-blue-600 dark:text-blue-400'
                  onClick={() => getAllGuest()}
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
            <div className='sticky top-0 z-20 bg-white translate-z-0 dark:bg-zinc-800'>
              <div className='relative'>
                {guests.length > 5 && (
                  <div className='px-2 pb-2 pt-px'>
                    <FieldSearch
                      ref={searchRef}
                      placeholder='Search...'
                      value={searchQuery}
                      disabled={isSaving || isError}
                      onChange={(e) =>
                        !(isSaving || isError) && setSearchQuery(e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
              <hr className='border-t-zinc-300 dark:border-t-zinc-700' />
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
              <hr className='border-t-zinc-300 dark:border-t-zinc-700' />
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
  )
}

export default SheetGuest

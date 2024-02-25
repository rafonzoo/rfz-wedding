'use client'

import type { Guest } from '@wedding/schema'
import { memo } from 'react'
import { guestAlias } from '@wedding/helpers'
import { useWeddingGuests } from '@/tools/hook'
import SheetGuestShare from '@wedding/components/Sheet/Guest/Share'

type SheetGuestListProps = {
  searchQuery: string
  isModeEdit: boolean
  isSynced: boolean
  editedGuestId: number
  previousGuest: Guest[]
  onEdit?: (id: number) => void
}

const SheetGuestList: RF<SheetGuestListProps> = ({
  searchQuery,
  isModeEdit,
  isSynced,
  editedGuestId,
  previousGuest,
  onEdit,
}) => {
  const initialGuest = useWeddingGuests()
  const guests = [...(initialGuest ?? [])].sort((a, b) =>
    guestAlias(a.slug).localeCompare(guestAlias(b.slug))
  )

  const isNoGuest = (!guests || !guests.length) && !searchQuery
  const guestsFilteredByQuery = guests.filter((item) =>
    guestAlias(item.slug).toLowerCase().includes(searchQuery.toLowerCase())
  )
  const isEmptySearchResult = searchQuery && !guestsFilteredByQuery.length
  const filteredGuest = searchQuery ? guestsFilteredByQuery : guests

  function onClick(id: number) {
    if (isModeEdit) return

    onEdit?.(id)
  }

  return isNoGuest ? (
    <div className='flex h-[inherit] items-center justify-center px-9 text-center translate-z-0'>
      Tamu yang sudah ditulis <br />
      akan muncul disini.
    </div>
  ) : isEmptySearchResult ? (
    <div className='flex h-11 items-center px-4'>
      No result for {`"${searchQuery}"`}
    </div>
  ) : (
    <ul className='divide-y translate-z-0'>
      {filteredGuest.map((guest) => (
        <SheetGuestShare
          key={guest.id}
          {...guest}
          isSynced={isSynced}
          isModeEdit={isModeEdit}
          editedGuestId={editedGuestId}
          previousGuest={previousGuest}
          onClick={onClick}
        />
      ))}
    </ul>
  )
}

export default memo(SheetGuestList)

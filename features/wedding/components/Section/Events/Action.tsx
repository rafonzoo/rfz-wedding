'use client'

import { MdModeEdit } from 'react-icons/md'
import { BsPlusLg } from 'react-icons/bs'
import { tw } from '@/tools/lib'
import { useIsEditorOrDev } from '@/tools/hook'

type EventsActionProps = {
  isFirstIndex: boolean
  isActive: boolean
  onClick?: () => void
}

const EventsAction: RF<EventsActionProps> = ({
  isFirstIndex,
  isActive,
  onClick,
}) => {
  const isEditor = useIsEditorOrDev()
  const isPublic = !isEditor

  return isPublic ? (
    <button
      tabIndex={isActive ? 0 : -1}
      aria-label='Save to calendar'
      className='ml-5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-2xl text-white'
    >
      <BsPlusLg />
    </button>
  ) : (
    <div className='ml-5 h-10 w-10'>
      <button
        tabIndex={isActive && !isFirstIndex ? 0 : -1}
        onClick={isFirstIndex ? void 0 : onClick}
        className={tw(
          'flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-xl text-white',
          isFirstIndex && 'opacity-40'
        )}
      >
        <MdModeEdit />
      </button>
    </div>
  )
}

export default EventsAction

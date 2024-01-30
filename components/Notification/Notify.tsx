import type { ReactNode } from 'react'
import { PiWarningCircleFill } from 'react-icons/pi'
import { tw } from '@/tools/lib'

type NotifyProps = {
  title: string
  description: string
  severity?: 'error' | 'warning' | 'info' | 'success'
  icon?: ReactNode
}

const notifClasses = {
  error: 'text-red-600',
  warning: '',
  info: '',
  success: '',
}

const notifIcon = {
  error: <PiWarningCircleFill />,
  warning: null,
  info: null,
  success: null,
}

const Notify: RF<NotifyProps> = ({
  title,
  description,
  severity = 'info',
  icon,
}) => {
  return (
    <div className='flex rounded-md bg-zinc-100 dark:bg-zinc-800'>
      <span
        className={tw(
          'ml-3 mt-3 flex justify-center text-2xl',
          notifClasses[severity]
        )}
      >
        {icon ?? notifIcon[severity]}
      </span>
      <div className='py-3 pl-3 pr-4 text-xs tracking-base'>
        <p className='text-sm font-semibold'>{title}</p>
        <p className='mt-0.5 text-zinc-600 dark:text-zinc-400'>{description}</p>
      </div>
    </div>
  )
}

export default Notify

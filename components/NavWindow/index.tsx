import { tw } from '@/tools/lib'

type NavigationWindowProps = {
  className?: string
  avatarUrl?: string
  wrapper?: Tag<'div'>
  container?: Tag<'div'>
}

const NavWindow: RFZ<NavigationWindowProps> = ({
  children,
  className,
  avatarUrl,
  wrapper,
  container,
}) => {
  return (
    <div
      {...container}
      className={tw(
        'relative flex border-b border-zinc-200 [.dark_&]:border-zinc-800',
        container?.className
      )}
    >
      <div {...wrapper} className={tw('mx-4 mt-7 w-full', wrapper?.className)}>
        <div className={tw('flex items-center space-x-2 py-3', className)}>
          <div className='h-8 w-8 overflow-hidden rounded-full bg-zinc-200'>
            {avatarUrl && (
              <img
                className='h-8 w-8 rounded-full bg-zinc-100'
                src={avatarUrl}
                alt='Your photo'
              />
            )}
          </div>
          <h2 className='text-2.5xl font-bold tracking-tight'>Undanganku</h2>
        </div>
      </div>
      <div className='absolute right-2 top-2 flex items-center'>{children}</div>
    </div>
  )
}

export default NavWindow

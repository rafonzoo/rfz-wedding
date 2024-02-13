'use client'

import { tw } from '@/tools/lib'
import * as AlertDialog from '@radix-ui/react-alert-dialog'

type AlertProps = {
  root?: AlertDialog.AlertDialogProps
  trigger?: AlertDialog.AlertDialogTriggerProps
  overlay?: AlertDialog.AlertDialogOverlayProps
  content?: AlertDialog.AlertDialogContentProps
  title?: AlertDialog.AlertDialogTitleProps
  description?: AlertDialog.AlertDialogDescriptionProps
  cancel?: AlertDialog.AlertDialogCancelProps
  action?: AlertDialog.AlertDialogActionProps
}

const Alert: RF<AlertProps> = ({
  root,
  trigger,
  overlay,
  content,
  title,
  description,
  cancel,
  action,
}) => {
  return (
    <AlertDialog.Root {...root}>
      {trigger && <AlertDialog.Trigger {...trigger} />}
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          {...overlay}
          className={tw(
            'fixed left-0 top-0 z-[999] h-full w-full cursor-auto select-none bg-black/70 opacity-0',
            'data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in data-[state=closed]:opacity-100',
            overlay?.className
          )}
        />
        <AlertDialog.Content
          {...content}
          className={tw(
            'fixed left-1/2 top-1/2 z-[1000] w-[calc(100%_-_48px)] max-w-[392px] -translate-x-1/2 -translate-y-[48%] rounded-lg bg-white p-4 text-black opacity-0',
            'data-[state=closed]:animate-alert-hide data-[state=open]:animate-alert-show',
            overlay?.className
          )}
        >
          <AlertDialog.Title
            {...title}
            className={tw('font-semibold', title?.className)}
          />
          <AlertDialog.Description
            {...description}
            className={tw(
              'mt-3 text-sm tracking-normal text-zinc-500',
              description?.className
            )}
          />
          <div className='mt-6 flex justify-end space-x-2'>
            <AlertDialog.Cancel
              {...cancel}
              className={tw(
                'inline-flex h-11 min-w-[88px] appearance-none items-center justify-center rounded-lg bg-zinc-200 px-4',
                cancel?.className
              )}
            />
            <AlertDialog.Action
              {...action}
              className={tw(
                'inline-flex h-11 min-w-[88px] appearance-none items-center justify-center rounded-lg bg-blue-600 px-4 font-semibold text-white',
                action?.className
              )}
            />
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default Alert

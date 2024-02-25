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
            'fixed left-0 top-0 z-[999] h-full w-full cursor-auto select-none bg-black/70',
            'data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in',
            overlay?.className
          )}
        />
        <AlertDialog.Content
          {...content}
          className={tw(
            'fixed bottom-0 left-0 right-0 top-0 z-[1000] flex items-center justify-center px-6',
            'data-[state=closed]:animate-alert-wait',
            content?.className
          )}
        >
          <div
            className={tw(
              'mx-auto w-full max-w-[392px] rounded-lg bg-white p-4 text-black [.dark_&]:bg-zinc-900',
              '[[data-state=closed]_&]:animate-alert-hide [[data-state=open]_&]:animate-alert-show'
            )}
          >
            <AlertDialog.Title
              {...title}
              className={tw(
                'font-semibold [.dark_&]:text-white',
                title?.className
              )}
            />
            <AlertDialog.Description
              {...description}
              className={tw(
                'mt-3 text-sm tracking-normal text-zinc-500 [.dark_&]:text-zinc-400',
                description?.className
              )}
            />
            <div className='mt-6 flex justify-end space-x-2'>
              <AlertDialog.Cancel
                {...cancel}
                className={tw(
                  'inline-flex h-11 min-w-[88px] appearance-none items-center justify-center rounded-lg bg-zinc-200 px-4 [.dark_&]:bg-zinc-800 [.dark_&]:text-white',
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
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default Alert

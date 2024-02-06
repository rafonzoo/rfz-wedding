import type { ReactNode } from 'react'
import { forwardRef } from 'react'
import { tw } from '@/tools/lib'

type FieldTextAreaProps = Tag<'textarea'> & {
  label: string
  errorMessage?: ReactNode
  infoMessage?: ReactNode
  wrapper?: Tag<'div'>
}

const FieldTextArea = forwardRef<HTMLTextAreaElement, FieldTextAreaProps>(
  function FieldTextAreaRef(
    { label, infoMessage, errorMessage, wrapper, ...props },
    ref
  ) {
    const message = errorMessage || infoMessage

    return (
      <div
        {...wrapper}
        className={tw('relative flex w-full flex-col', wrapper?.className)}
      >
        <textarea
          ref={ref}
          {...props}
          autoComplete={props.autoComplete ?? 'off'}
          className={tw(
            'peer inline-flex min-h-[183px] w-full appearance-none rounded-md border px-3 pb-3 pt-8 -tracking-base outline-none transition-shadow',
            'disabled:opacity-40 [&:not(:disabled)]:opacity-100',
            'border-zinc-300 bg-white [.dark_&]:border-zinc-700 [.dark_&]:bg-transparent ',
            'placeholder:text-base placeholder:text-zinc-500 [.dark_&]:placeholder:text-zinc-400',
            !errorMessage && 'focus:border-blue-600 focus:shadow-focus',
            !errorMessage && 'border-zinc-300 [.dark_&]:border-zinc-700',
            errorMessage && 'focus:shadow-error !border-red-500', // prettier-ignore
            props.className
          )}
        />
        {message && typeof message !== 'boolean' && (
          <span
            className={tw('block min-h-5 px-3 pt-2 text-xs tracking-wide', {
              'text-zinc-500 [.dark_&]:text-zinc-400':
                !!infoMessage && !errorMessage,
              'text-red-500': !!errorMessage,
            })}
          >
            {message}
          </span>
        )}
        <span
          className={tw(
            'pointer-events-none absolute left-px right-px top-px rounded-t-md bg-white px-3 pb-2 pt-3 text-xs tracking-wide [.dark_&]:bg-inherit',
            !errorMessage && 'text-zinc-500 peer-focus:text-blue-500 peer-focus:[.dark_&]:text-blue-400 [.dark_&]:text-zinc-400', // prettier-ignore
            errorMessage && 'text-red-500'
          )}
        >
          {label}
        </span>
      </div>
    )
  }
)

export default FieldTextArea

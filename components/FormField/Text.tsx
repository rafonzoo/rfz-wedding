import type { ChangeEvent, ForwardedRef, KeyboardEvent, ReactNode } from 'react'
import { forwardRef } from 'react'
import { tw } from '@/tools/lib'

const PATTERN_SPECIAL_CHARS = /[`~!@#$%^&*()_|+\,.-=?;:'"<>\{\}\[\]\\\/]/g

const PATTERN_ALPHANUMERIC_CHARS = /^[a-zA-Z0-9\u00C0-\u02AB]/g

type InputProps = Omit<Tag<'input'>, 'type'> & {
  label: string
  type?: 'text' | 'number' | 'date' | 'time' | 'file'
  errorMessage?: ReactNode
  infoMessage?: ReactNode
  isAlphaNumeric?: boolean
  isAllowEmoji?: boolean
  isSpecialChars?: boolean
  whitelist?: string
  blacklist?: string | RegExp
  labelProps?: Tag<'span'>
  messageProps?: Tag<'span'>
  children?: ReactNode
}

const FieldText = forwardRef<HTMLInputElement, InputProps>(
  function FieldTextRef(
    args: InputProps,
    ref: ForwardedRef<HTMLInputElement | null>
  ) {
    const {
      type = 'text',
      label,
      errorMessage,
      infoMessage,
      messageProps,
      whitelist = '',
      blacklist = '',
      isAlphaNumeric,
      isAllowEmoji,
      isSpecialChars,
      labelProps,
      children,
      ...props
    } = args
    const message = errorMessage || infoMessage

    // Character that require escape can't be string
    // use regexp instead
    const excluded =
      typeof blacklist === 'string'
        ? new RegExp(`${blacklist}`, 'g')
        : blacklist

    // Exclude default whitelist
    // prettier-ignore
    const whiteListed = whitelist + '.,- '.replace(excluded, '')

    function onChange(e: ChangeEvent<HTMLInputElement>) {
      if (props.disabled) return

      if (type === 'text') {
        if (!isAllowEmoji && !e.target.value.includes('=')) {
          e.target.value = e.target.value.replace(
            /[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu,
            ''
          )
        }

        if (!isSpecialChars && isAlphaNumeric) {
          let val = ''

          for (let i = 0; i < e.target.value.length; i++) {
            const str = e.target.value[i]

            if (
              whiteListed.includes(str) ||
              str.match(PATTERN_ALPHANUMERIC_CHARS)
            ) {
              val += str
            }
          }

          e.target.value = val
        }
      }

      props.onChange?.(e)
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (!props.disabled) props.onKeyDown?.(e)

      // Numeric
      // Allowed: Numbers(0-9), comma, dot(.), strip(-)
      if (type === 'number' && e.key.match(/^[\d.,-]/g)) {
        return
      }

      if (type !== 'text') {
        return
      }

      // Alphanumeric
      // Allowed: Space, dot(.), comma, strip(-)
      if (
        isAlphaNumeric &&
        (whiteListed.includes(e.key) || e.key.match(PATTERN_ALPHANUMERIC_CHARS))
      ) {
        return
      }

      // Special Character
      if (
        (!!blacklist && e.key.match(new RegExp(`${blacklist}`, 'g'))) ||
        (!isSpecialChars && e.key.match(PATTERN_SPECIAL_CHARS))
      ) {
        e.preventDefault()
      }
    }

    return (
      <div className='relative flex w-full flex-col'>
        <input
          ref={ref}
          {...props}
          autoFocus={props.autoFocus ?? false}
          type={type === 'number' ? 'text' : type ?? 'text'}
          pattern={type === 'number' ? '[0-9]*' : props.pattern}
          autoComplete={props.autoComplete ?? 'off'}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={props.placeholder ?? 'Placeholder'}
          className={tw(
            'peer inline-flex w-full appearance-none rounded-md border px-3 pb-3 pt-8 -tracking-base outline-none transition-shadow',
            'disabled:opacity-40 [&:not(:disabled)]:opacity-100',
            'border-zinc-300 bg-white [.dark_&]:border-zinc-700 [.dark_&]:bg-transparent',
            props.placeholder && 'placeholder:text-base placeholder:text-zinc-500 [.dark_&]:placeholder:text-zinc-400', // prettier-ignore
            !props.placeholder && 'placeholder:text-transparent',
            !errorMessage && 'focus:!border-blue-600 focus:shadow-focus',
            !errorMessage && 'border-zinc-300 [.dark_&]:border-zinc-700',
            errorMessage && 'focus:shadow-error !border-red-500', // prettier-ignore
            props.className
          )}
        />
        {message && typeof message !== 'boolean' && (
          <span
            {...messageProps}
            className={tw(
              'block px-3 pt-2 text-xs tracking-wide',
              {
                'text-zinc-500 [.dark_&]:text-zinc-400':
                  !!infoMessage && !errorMessage,
                'text-red-500': !!errorMessage,
              },
              messageProps?.className
            )}
          >
            {message}
          </span>
        )}
        <span
          {...labelProps}
          className={tw(
            'pointer-events-none absolute left-3 top-3 text-xs tracking-wide',
            !errorMessage && 'text-zinc-500 peer-focus:!text-blue-600 peer-focus:[.dark_&]:!text-blue-400 [.dark_&]:text-zinc-400', // prettier-ignore
            errorMessage && '!text-red-500',
            labelProps?.className
          )}
        >
          {label}
        </span>
        {children}
      </div>
    )
  }
)
export default FieldText

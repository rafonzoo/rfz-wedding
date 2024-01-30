import type { ChangeEvent, ForwardedRef } from 'react'
import { forwardRef, useId } from 'react'
import { tw } from '@/tools/lib'

type InputProps = Omit<Tag<'input'>, 'type'> & {
  wrapper?: Tag<'div'>
}

const FieldSearchRef = (
  { wrapper, ...props }: InputProps,
  ref: ForwardedRef<HTMLInputElement | null>
) => {
  const id = useId()

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault()

    props.onChange?.(e)
  }

  return (
    <div {...wrapper} className={tw('relative', wrapper?.className)}>
      <input
        ref={ref}
        {...props}
        type='search'
        name={props.id ?? id}
        autoComplete={props.autoComplete ?? 'off'}
        onChange={onChange}
        className={tw(
          'inline-flex h-9 w-full appearance-none items-center rounded-lg bg-zinc-100 px-3 opacity-100 placeholder:text-zinc-500 dark:bg-zinc-700 placeholder:dark:text-zinc-400',
          props.className
        )}
      />
    </div>
  )
}

const FieldSearch = forwardRef<HTMLInputElement, InputProps>(FieldSearchRef)
export default FieldSearch

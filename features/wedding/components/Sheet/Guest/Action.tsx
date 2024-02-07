'use client'

import type { ChangeEvent, MutableRefObject } from 'react'
import type { Guest } from '@wedding/schema'
import { memo, useEffect, useRef, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useTranslations } from 'next-intl'
import { ZodError } from 'zod'
import { IoArrowForwardCircle } from 'react-icons/io5'
import { guestType } from '@wedding/schema'
import { tw } from '@/tools/lib'
import {
  cleaner,
  exact,
  groupMatch,
  groupName,
  guestAlias,
  guestName,
  numbers,
} from '@/tools/helper'
import { Queries } from '@/tools/config'
import FieldText from '@/components/Field/Text'

type SheetGuestActionProps = {
  editId: number
  scrollRef: MutableRefObject<HTMLDivElement | null>
  searchRef: MutableRefObject<HTMLInputElement | null>
  wrapper?: Tag<'div'>
  isShow?: boolean
  isSynced?: boolean
}

const SheetGuestAction: RF<SheetGuestActionProps> = ({
  editId,
  scrollRef,
  searchRef,
  wrapper,
  isShow,
  isSynced,
}) => {
  const [error, setError] = useState('')
  const [recentlyAddedId, setRecentlyAddedId] = useState(-1)
  const [showSend, setShowSend] = useState(false)
  const lastPosRef = useRef(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()
  const guests = exact(queryClient.getQueryData<Guest[]>(Queries.weddingGuests))
  const guestEdit = guests.find((guest) => guest.id === editId)
  const fullName = guestEdit?.slug ? guestAlias(guestEdit.slug) : ''
  const [value, setValue] = useState(fullName)
  const recentlyAdded = guests?.find((guest) => guest.id === recentlyAddedId)
  const prevEditId = useRef(editId)
  const t = useTranslations()

  useEffect(() => {
    if (!isShow) {
      recentlyAddedId > -1 && setRecentlyAddedId(-1)

      if (error) {
        setValue('')
        setError('')
      }
    }
  }, [error, isShow, recentlyAddedId])

  useEffect(() => {
    if (editId !== prevEditId.current) {
      setValue(fullName)
      setError('')

      prevEditId.current = editId
    }
  }, [editId, fullName])

  useEffect(() => {
    function editableFocusHandler(
      action: 'addEventListener' | 'removeEventListener'
    ) {
      const current = scrollRef.current

      if (!current) {
        return
      }

      const captureScrollY = () => {
        lastPosRef.current = window.scrollY
      }

      const releaseScrollY = () => {
        window.scroll({ top: lastPosRef.current })
      }

      inputRef.current?.[action]('focus', captureScrollY)
      inputRef.current?.[action]('blur', releaseScrollY)
    }

    editableFocusHandler(isShow ? 'addEventListener' : 'removeEventListener')
  }, [isShow, scrollRef])

  useEffect(() => {
    const isAddNew = !guestEdit
    if (isAddNew) {
      inputRef.current?.[isShow ? 'focus' : 'blur']()
    }
  }, [guestEdit, isShow])

  function onValidate(text: string) {
    // Trim then clean multispace
    const textParser = text.trim().replace(/\s+/g, ' ')

    // Pattern
    const groups = groupMatch(text)
    const checks = /(^[a-zA-Z\u00C0-\u02AB]{1,})+(\d?\w? ?)+(((.|,|')+ .+)?)$/g

    // Remove group symbol
    const group = groupName(text)

    let parser = guestType.shape.name
      .refine(
        (val) => {
          const index = []

          if (val.charAt(0) === '(') {
            let hasAnotherGroup = false

            for (let i = 0; i < val.length; i++) {
              if (!i) continue

              if (val[i] === '(') {
                return false
              }

              if (val[i] === ')') {
                index.push(i)
                continue
              }

              hasAnotherGroup = ['(', ')'].some((str) => val[i].includes(str))
            }

            return index.length === 1 && !hasAnotherGroup
          }

          return !['(', ')'].some((str) => val.includes(str))
        },
        { message: t('error.field.invalidGuestField') }
      )
      .refine(
        (val) => {
          if (!groups || !group) return true

          const name = guestName(val)
          const isValid = [group, name].map(
            (str) =>
              str.length >= 3 &&
              !!str.match(checks) &&
              !['www', 'com'].some((url) =>
                (url === 'com' ? str : str.toLowerCase()).includes(url)
              )
          )

          return isValid.every(Boolean)
        },
        (val) => {
          if (!groups || !group) return {}

          const name = guestName(val)

          if (group.length < 3 || name.length < 3) {
            return {
              message: t('error.field.invalidLength'), // prettier-ignore
            }
          }

          if (!group.match(checks)) {
            return { message: t('error.field.invalidGuestGroup') }
          }

          if (!name.match(checks)) {
            return { message: t('error.field.invalidGuestName') }
          }

          return {}
        }
      )
      .refine(
        (val) => {
          return group
            ? true
            : val.match(checks) &&
                !['www', 'com'].some((url) =>
                  (url === 'com' ? val : val.toLowerCase()).includes(url)
                )
        },
        {
          message: t('error.field.invalidGuestName'),
        }
      )

    // @ts-expect-error Cannot optional chain on zod
    parser = parser.refine(
      (val) => !guests.some((guest) => guestAlias(guest.slug) === val),
      {
        message: t('error.field.invalidGuestExist'),
      }
    )

    const name = parser.parse(textParser)
    const slug = (
      group ? [`(${group})`, guestName(name)].join(' ') : name
    ).replace(/\s+/g, '-')

    return { group, name: group ? guestName(name) : name, slug }
  }

  function onSubmit() {
    if (!value || !guests || !scrollRef?.current || error) {
      return
    }

    try {
      const { group, name, slug } = onValidate(value)

      let token = numbers(6)
      /**
       * Regenerate in case token already exist in other guest.
       */
      while (guests.some((item) => item.token === token)) {
        token = numbers(6)
      }

      if (guestEdit) {
        const { token, id } = guestEdit
        const guest = guestType.parse(cleaner({ slug, name, group, token, id }))

        if (guests.some((guest) => guest.slug === slug)) {
          return // Avoid mutation with the same guest name
        }

        queryClient.setQueryData<Guest[] | undefined>(
          Queries.weddingGuests,
          (prev) =>
            // Don't change array order in order to compare.
            !prev ? prev : prev.map((item) => (item.id !== id ? item : guest))
        )

        inputRef.current?.blur()
      } else {
        const ids = guests.map((event) => event.id)
        const biggestId = Math.max.apply(null, !ids.length ? [0] : ids)

        const id = biggestId + 1
        const guest = guestType.parse(
          cleaner({
            name,
            token,
            id,
            group,
            slug,
          })
        )

        queryClient.setQueryData<Guest[] | undefined>(
          Queries.weddingGuests,
          (prev) => (!prev ? prev : [...prev, guestType.parse(guest)])
        )

        setRecentlyAddedId(id)
        setValue(
          group && searchRef.current && searchRef.current.value.includes(group)
            ? `(${group}) `
            : ''
        )

        inputRef.current?.focus()
      }
    } catch (e) {
      if (e instanceof ZodError) {
        const [issue] = e.issues

        setError(issue.message)
        inputRef.current?.focus()
      }
    }

    setShowSend(false)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setError('')
    setRecentlyAddedId(-1)
    setValue(e.target.value)
    setShowSend(e.target.value !== '')
  }

  return (
    <div
      {...wrapper}
      className={tw('overflow-hidden translate-z-0', !isShow && 'h-0')}
    >
      <form
        className='relative mx-4 mt-4'
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        {recentlyAdded && isShow && !isSynced && (
          <p className='mb-3 rounded-md border border-green-300 bg-green-50 p-2 text-xs tracking-normal text-green-900'>
            {guestAlias(recentlyAdded.slug)} ditambahkan kedalam daftar tamu.
          </p>
        )}
        <FieldText
          ref={inputRef}
          id='input-add-new'
          label={!guestEdit ? 'Tamu baru' : 'Edit tamu'}
          name='guestName'
          onChange={onChange}
          value={value}
          isAlphaNumeric
          whitelist={`()'`}
          blacklist='-'
          tabIndex={isShow ? 0 : -1}
          errorMessage={error}
          className={tw(
            'bg-zinc-100 [.dark_&]:!border-zinc-600 [.dark_&]:bg-zinc-700',
            showSend && !error && '!pr-11'
          )}
          labelProps={
            !error
              ? {
                  className: tw(
                    !error && '!text-zinc-600 [.dark_&]:!text-zinc-300'
                  ),
                }
              : void 0
          }
          infoMessage={
            <span>
              {/* Writing guest within {'"("'} and {'")"'} at the beginning will
              create a guest group.{' '} */}
              Menulis nama tamu didalam {'"("'} dan {'")"'} diawal kolom akan
              membuat grup tamu.{' '}
              <a
                className='text-blue-600 [.dark_&]:text-blue-400'
                href='#'
                tabIndex={isShow ? 0 : -1}
                onClick={isShow ? (e) => e.preventDefault() : void 0}
              >
                Pelajari lebih lanjut
              </a>
            </span>
          }
        >
          {showSend && !error && (
            <button
              type='button'
              tabIndex={-1}
              className='absolute right-2 top-[30px] rounded-full text-3xl text-blue-600 [.dark_&]:text-blue-400'
              aria-label='Tambah/edit tamu'
              onClick={() => {
                onSubmit()
                inputRef.current?.blur()
              }}
            >
              <IoArrowForwardCircle />
            </button>
          )}
        </FieldText>
      </form>
    </div>
  )
}

export default memo(SheetGuestAction)

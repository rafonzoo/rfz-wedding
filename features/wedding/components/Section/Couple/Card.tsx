'use client'

import type { ChangeEvent } from 'react'
import type { Wedding, WeddingCouple } from '@wedding/schema'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { ZodError, type z } from 'zod'
import { PiWarningCircleFill } from 'react-icons/pi'
import { FaFacebook, FaTwitter } from 'react-icons/fa6'
import { AiFillInstagram } from 'react-icons/ai'
import { weddingCoupleType, weddingSocialUrls } from '@wedding/schema'
import { updateWeddingCouplesQuery } from '@wedding/query'
import { QueryWedding } from '@wedding/config'
import { tw } from '@/tools/lib'
import { useIsEditor, useUtilities, useWeddingDetail } from '@/tools/hook'
import { cleaner, isLocal, isObjectEqual, keys, omit } from '@/tools/helpers'
import dynamic from 'next/dynamic'
import TextCard from '@wedding/components/Text/Card'
import Spinner from '@/components/Loading/Spinner'
import FieldText from '@/components/FormField/Text'
import FieldGroup from '@/components/FormField/Group'

const BottomSheet = dynamic(() => import('@/components/BottomSheet'), {
  ssr: false,
})

type ErrorType = {
  key: keyof Omit<WeddingCouple, 'socialUrl'>
  message: string
}

type SocialError = {
  name: keyof WeddingCouple['socialUrl']
  message: string
}

const CoupleCard: RF<WeddingCouple> = (props) => {
  const [info, setInfo] = useState(props)
  const {
    id,
    fullName,
    order,
    nameOfFather,
    nameOfMother,
    socialUrl,
  } = info // prettier-ignore
  const [isOpen, setIsOpen] = useState(false)
  const [requiredError, setRequiredError] = useState<ErrorType[]>([])
  const [partialError, setSocialErrors] = useState<SocialError[]>([])
  const [errorInfo, setErrorInfo] = useState(false)
  const queryClient = useQueryClient()
  const detail = useWeddingDetail()
  const isEditor = useIsEditor()
  const { abort, cancelDebounce, debounce, getSignal } = useUtilities()

  // prettier-ignore
  const hasSocial = (
    keys(socialUrl).filter((item) => Boolean(socialUrl[item])).length > 0
  )

  const wid = useParams().wid as string
  const mutation = useMutation<
    WeddingCouple[],
    unknown,
    Partial<WeddingCouple>
  >({
    mutationFn: (couple) => {
      const signal = getSignal()
      return updateWeddingCouplesQuery({
        wid,
        signal,
        couple: [
          ...detail.couple.filter((item) => item.id !== id),
          { ...props, ...couple },
        ],
      })
    },

    onSuccess: (couple) => {
      setErrorInfo(false)

      queryClient.setQueryData<Wedding | undefined>(
        QueryWedding.weddingDetail,
        (prev) => (!prev ? prev : { ...prev, couple })
      )
    },
    onError: (e) => {
      if ((e as Error)?.message.includes('AbortError')) {
        return
      }

      setErrorInfo(true)
    },
  })

  function text<T>(str: T) {
    return str || '--.--'
  }

  function errorRequired<T extends keyof typeof info>(key: T) {
    return requiredError.find((item) => item.key === key)?.message
  }

  function errorPartial(name: keyof WeddingCouple['socialUrl']) {
    return partialError.find((item) => item.name === name)?.message
  }

  function errorSetter(e: ZodError) {
    const error = e as z.ZodError<Infer<typeof weddingCoupleType>>
    const errorKeys = error.format()
    const erroredKey: ErrorType[] = [...requiredError]
    const socialError: SocialError[] = [...partialError]

    keys(errorKeys).forEach((key) => {
      const item = errorKeys[key]

      if (!item || key === '_errors') return

      if (key === 'socialUrl') {
        return Object.keys(item)
          .filter((itm) => itm !== '_errors')
          .forEach((social) => {
            // @ts-expect-error Cannot find any type of these
            const [message] = item[social as keyof typeof item]._errors
            socialError.push({ name: social as SocialError['name'], message })
          })
      }

      if ('_errors' in item) {
        const [message] = item._errors
        erroredKey.push({ key, message })
      }
    })

    return { required: erroredKey, partial: socialError }
  }

  function valueSetter<T extends keyof WeddingCouple>(
    key: T,
    isNumber = false,
    socialName?: keyof WeddingCouple['socialUrl']
  ) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      let erroredKey: { required: ErrorType[]; partial: SocialError[] } = {
        required: [...requiredError],
        partial: [...partialError],
      }

      if (isNumber && (value === '0' || value === ' ' || isNaN(+value))) {
        return
      }

      const actualValue = isNumber ? +value : value

      try {
        if (socialName) {
          weddingCoupleType.pick({ socialUrl: true }).parse({
            socialUrl: { [socialName]: value },
          })

          erroredKey.partial = erroredKey.partial.filter(
            (item) => item.name !== socialName
          )
          setSocialErrors((prev) =>
            prev.filter((item) => item.name !== socialName)
          )
        } else {
          weddingCoupleType.pick({ [key]: true }).parse({ [key]: actualValue })
          erroredKey.required = erroredKey.required.filter(
            (item) => item.key !== key
          )
          setRequiredError((prev) => prev.filter((item) => item.key !== key))
        }
      } catch (e) {
        if (e instanceof ZodError) {
          erroredKey = errorSetter(e)

          setRequiredError(erroredKey.required)
          setSocialErrors(erroredKey.partial)
        }
      }

      abort()
      cancelDebounce()
      setInfo((prev) => ({
        ...prev,
        ...(socialName
          ? {
              socialUrl: cleaner({
                ...prev.socialUrl,
                [socialName]: value,
              }),
            }
          : { [key]: actualValue }),
      }))

      const rKeys = erroredKey.required.map(({ key }) => key)
      const pKeys = erroredKey.partial.map(({ name }) => name)

      const requiredData = omit(
        omit(
          {
            ...info,
            [key]:
              typeof actualValue === 'string'
                ? actualValue.trim()
                : actualValue,
          },
          'socialUrl'
        ),
        ...rKeys
      )

      const partialData = {
        socialUrl: omit(
          cleaner({
            ...info.socialUrl,
            ...(socialName
              ? {
                  [socialName]: value.trim(),
                }
              : {}),
          }),
          ...pKeys
        ),
      }

      if (isObjectEqual({ ...requiredData, ...partialData }, props)) {
        return setErrorInfo(false)
      }

      const isEqualRequiredData = isObjectEqual(
        requiredData,
        omit(omit(props, 'socialUrl'), ...rKeys)
      )

      const isEqualPartialData = isObjectEqual(cleaner(partialData), {
        socialUrl: omit(props.socialUrl, ...pKeys),
      })

      if (isEqualRequiredData && isEqualPartialData) {
        return setErrorInfo(false)
      }

      const payload = { ...requiredData, ...partialData }
      debounce(() => mutation.mutate(payload))
    }
  }

  return (
    <div className='absolute bottom-0 left-0 z-[5] w-full px-6 pb-8 text-left'>
      <div className='relative flex flex-col'>
        <TextCard>{text(fullName)}</TextCard>
        <div
          className={tw(
            'relative mt-1 block pl-1 text-sm tracking-normal text-zinc-300',
            !hasSocial && 'mb-3'
          )}
        >
          <div className='absolute h-full w-[3px] bg-zinc-500' />
          <div className='ml-4 flex flex-col'>
            <span>Anak ke-{text(order)}</span>
            <span className='line-clamp-2'>
              Bpk. {text(nameOfFather)} dan Ibu {text(nameOfMother)}
            </span>
          </div>
        </div>

        {/* BottomSheet */}
        {isEditor && (
          <BottomSheet
            trigger={{
              asChild: true,
              children: (
                <button
                  onClick={() => setIsOpen(true)}
                  aria-label='Edit couple'
                  className={tw(
                    'absolute -bottom-2 -left-2 -right-2 -top-2 rounded-2xl outline-offset-4',
                    isOpen ? 'shadow-focus outline-none' : 'shadow-outlined'
                  )}
                >
                  {errorInfo && !mutation.isLoading && (
                    <span className='absolute -right-3 -top-3 flex items-center justify-center rounded-full bg-white text-2xl text-red-600'>
                      <PiWarningCircleFill />
                    </span>
                  )}
                </button>
              ),
            }}
            root={{ open: isOpen, onOpenChange: setIsOpen }}
            header={{
              title: 'Mempelai',
              prepend: (requiredError.length > 0 ||
                partialError.length > 0) && (
                <button
                  className={tw(
                    'text-blue-600 [.dark_&]:text-blue-400',
                    mutation.isLoading && 'opacity-50'
                  )}
                  disabled={mutation.isLoading}
                  onClick={() => {
                    if (mutation.isLoading) return

                    setInfo(props)
                    setRequiredError([])
                    setSocialErrors([])
                  }}
                >
                  Reset
                </button>
              ),
              append: (
                <>
                  {mutation.isLoading && <Spinner />}
                  {errorInfo && !mutation.isLoading && (
                    <button
                      className='relative text-blue-600 [.dark_&]:text-blue-400'
                      onClick={() => mutation.mutate(info)}
                    >
                      Simpan
                    </button>
                  )}
                </>
              ),
            }}
            option={{ useOverlay: true }}
            footer={{ useClose: true }}
          >
            <div className='space-y-6 pb-1'>
              <FieldGroup title='Display info'>
                <FieldText
                  required
                  value={fullName}
                  label='Nama lengkap'
                  onChange={valueSetter('fullName')}
                  name='fullName'
                  errorMessage={errorRequired('fullName')}
                  isAlphaNumeric
                />
                <FieldText
                  required
                  value={nameOfFather}
                  onChange={valueSetter('nameOfFather')}
                  label='Nama Ayah'
                  name='nameOfFather'
                  errorMessage={errorRequired('nameOfFather')}
                  isAlphaNumeric
                />
                <FieldText
                  required
                  value={nameOfMother}
                  onChange={valueSetter('nameOfMother')}
                  label='Nama Ibu'
                  name='nameOfMother'
                  errorMessage={errorRequired('nameOfMother')}
                  isAlphaNumeric
                />
                <FieldText
                  value={order || ''}
                  onChange={valueSetter('order', true)}
                  name='order'
                  errorMessage={errorRequired('order')}
                  label='Anak ke'
                  type='number'
                />
              </FieldGroup>
              <FieldGroup title='Social URL (Optional)'>
                {weddingSocialUrls.map((name, index) => (
                  <FieldText
                    key={index}
                    required
                    value={socialUrl[name] ?? ''}
                    label={name}
                    labelProps={{ className: 'capitalize' }}
                    name={`social-${name}`}
                    errorMessage={errorPartial(name)}
                    onChange={valueSetter('socialUrl', false, name)}
                    isSpecialChars
                  />
                ))}
              </FieldGroup>
            </div>
          </BottomSheet>
        )}

        {/* Social */}
        {hasSocial && (
          <div className='z-[1] mt-3 flex space-x-3'>
            {keys(socialUrl)?.map(
              (social, index) =>
                socialUrl[social] && (
                  <div className='block h-6' key={index}>
                    <span
                      tabIndex={0}
                      aria-label={social}
                      onClick={(e) =>
                        isLocal()
                          ? e.preventDefault()
                          : window.open(socialUrl[social])
                      }
                      className={tw(
                        'text-2xl text-zinc-500 hover:text-blue-500',
                        social === 'facebook' && 'rounded-full'
                      )}
                    >
                      {social === 'facebook' && <FaFacebook />}
                      {social === 'twitter' && <FaTwitter />}
                      {social === 'instagram' && <AiFillInstagram />}
                    </span>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CoupleCard

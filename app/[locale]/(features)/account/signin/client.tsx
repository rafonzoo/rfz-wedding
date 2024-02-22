'use client'

import { useMutation } from 'react-query'
import { useRouter } from 'next/navigation'
import { TfiMicrosoftAlt } from 'react-icons/tfi'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa6'
import { signInWithProviderQuery } from '@account/query'
import { QueryAccount } from '@account/config'
import { tw } from '@/tools/lib'
import { Route } from '@/tools/config'
import { LocaleLink } from '@/locale/config'

const SigninPageClient = () => {
  const router = useRouter()
  const { mutate: signin } = useMutation<string | undefined, unknown, Social>({
    mutationKey: QueryAccount.accountSignin,
    mutationFn: (provider) => signInWithProviderQuery(provider),
    onSuccess: (url) => void (url && router.replace(url)),
  })

  return (
    <main>
      <div className='absolute left-0 top-12 flex h-[calc(100%_-_48px)] min-h-[472px] w-full min-w-[320px] mn:min-h-[720px] mn:items-center mn:bg-zinc-100 [.dark_&]:bg-black'>
        <div className='mx-auto flex w-full flex-col items-center border-zinc-300 mn:-mt-[120px] mn:max-w-[372px] mn:rounded-lg mn:border mn:bg-white [.dark_&]:border-zinc-700 [.dark_&]:bg-black [.dark_&]:mn:bg-zinc-900'>
          <div className='w-full space-y-3 px-4 pt-[54px] text-center mn:pt-16'>
            <h2 className='text-3xl font-bold tracking-tight'>
              Welcome to <br />
              RFZ Wedding
            </h2>
            <p>
              The easiest way to create your <br /> wedding invitation. Lets go!
            </p>
          </div>
          <ul className='mt-6 w-full space-y-3'>
            {(['google', 'github', 'azure'] as const).map((social, key) => (
              <li key={key} className='text-center'>
                <button
                  className='mx-auto flex h-11 min-w-[270px] items-center space-x-6 rounded-lg border border-zinc-300 px-3 hover:bg-zinc-100 [.dark_&]:border-zinc-700 [.dark_&]:hover:bg-zinc-900'
                  onClick={() => signin(social)}
                >
                  <span
                    className={tw(
                      social === 'azure' &&
                        'mr-[3px] block text-sm text-blue-500'
                    )}
                  >
                    {social === 'google' && <FcGoogle />}
                    {social === 'github' && <FaGithub />}
                    {social === 'azure' && <TfiMicrosoftAlt />}
                  </span>
                  <span>Masuk dengan {social}</span>
                </button>
              </li>
            ))}
          </ul>
          <ul className='absolute bottom-0 flex w-full justify-center pb-6 pt-4 text-center text-xs leading-[15px] tracking-base text-blue-600 mn:relative mn:mt-20 [.dark_&]:text-blue-400'>
            <li>
              <LocaleLink href={Route.termsOfUse} prefetch={false}>
                Terms of Use
              </LocaleLink>
            </li>
            <li className='mx-3 text-black opacity-50 [.dark_&]:text-white'>
              |
            </li>
            <li className='opacity-50'>Privacy Policy</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default SigninPageClient

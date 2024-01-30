'use client'

import { useMutation } from 'react-query'
import { useRouter } from 'next/navigation'
import { signInWithProviderQuery } from '@account/query'
import { Queries } from '@/tools/config'

const SigninPageClient = () => {
  const router = useRouter()
  const { mutate: signin } = useMutation<
    string | undefined,
    unknown,
    'google' | 'github' | 'azure'
  >({
    mutationKey: Queries.accountSignin,
    mutationFn: (provider) => signInWithProviderQuery(provider),
    onSuccess: (url) => void (url && router.replace(url)),
  })

  return (
    <div>
      <ul>
        <li>
          <button onClick={() => signin('google')}>Signin with google</button>
        </li>
        <li>
          <button onClick={() => signin('github')}>Signin with github</button>
        </li>
        <li>
          <button onClick={() => signin('azure')}>Signin with Azure</button>
        </li>
      </ul>
    </div>
  )
}

export default SigninPageClient

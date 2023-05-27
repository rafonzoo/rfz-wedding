import type { Component } from 'solid-js'
// import { supabase } from '@app/config/supabase'

const SigninPage: Component = () => {
  return (
    <>
      <p>You're not login yet</p>
      <button
      // onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
      >
        Login
      </button>
    </>
  )
}

export default SigninPage

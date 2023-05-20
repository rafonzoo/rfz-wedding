import type { Component } from 'solid-js'
import { supabase } from '@app/config/supabase'
import Container from '@app/components/Container'

const SigninPage: Component = () => {
  return (
    <Container>
      <p>You're not login yet</p>
      <button
        onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
      >
        Login
      </button>
    </Container>
  )
}

export default SigninPage

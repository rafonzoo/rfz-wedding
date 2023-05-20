import type { Children } from '@app/types'

const Container: Children = ({ children }) => {
  // createEffect(() => {
  // supabase.auth.getSession().then(({ data: { session } }) => {
  //   setStore('session', session)
  //   if (!session) return navigate('/signin')
  // })
  // supabase.auth.onAuthStateChange((_event, session) => {
  //   setStore('session', session)
  //   if (!session) return navigate('/signin')
  //   if (location.href.includes('/#')) history.go(-2)
  //   if (pathname === '/signin') navigate('/')
  // })
  // })

  return <main>{children}</main>
}

export default Container

import type { Children } from '@app/types'
import Sidebar from '@app/components/Navbar/Sidebar'

const items = ['Undanganku', 'Transaksi']

const Container: Children = ({ children }) => {
  return (
    <div class='flex flex-col env-ml-0 env-mr-0 tc:flex-row'>
      <Sidebar items={() => items} />
      <main class='w-full flex-1'>{children}</main>
    </div>
  )
}

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

export default Container

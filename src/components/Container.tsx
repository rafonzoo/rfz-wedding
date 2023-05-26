import type { Component, lazy } from 'solid-js'
import { Suspense } from 'solid-js'
import { useLocation } from '@solidjs/router'
import clsx from 'clsx'
import Sidebar from '@app/components/Navbar/Sidebar'
import BottomBar from '@app/components/Navbar/BottomBar'
import Header from '@app/components/Header'

interface ContainerProps {
  comp: ReturnType<typeof lazy>
}

const Container: Component<ContainerProps> = ({ comp: Comp }) => {
  const { pathname } = useLocation()

  return (
    <div class={styles.wrapper}>
      <Sidebar path={pathname} />
      <main class={styles.main}>
        <Header path={pathname} />
        <Suspense fallback={<>Loading...</>} children={<Comp />} />
      </main>
      <BottomBar path={pathname} />
    </div>
  )
}

const styles = {
  main: clsx('relative w-full flex-1'),
  wrapper: clsx('flex flex-col env-ml-0 env-mr-0 tc:flex-row'),
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

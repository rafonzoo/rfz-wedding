import type { Component, lazy } from 'solid-js'
import { createEffect, Suspense } from 'solid-js'
import { useIsRouting } from '@solidjs/router'
import { currentPage } from '@app/helpers'
import clsx from 'clsx'
import Sidebar from '@app/components/Navbar/Sidebar'
import BottomBar from '@app/components/Navbar/BottomBar'
import Loading from '@app/components/Loading'
import Header from '@app/components/Header'

interface ContainerProps {
  comp: ReturnType<typeof lazy>
  isPrimary?: boolean
}

const Container: Component<ContainerProps> = ({
  comp: Comp,
  isPrimary = true,
}) => {
  const isRouting = useIsRouting()

  createEffect(() => {
    const { background } = currentPage()
    const { className } = document.body

    if (background) {
      document.body.className = !isRouting()
        ? [className, background].join(' ')
        : className.replace(' ' + background, '')
    }
  })

  return (
    <div class={styles.wrapper}>
      <Sidebar />
      <main class={styles.main}>
        {isPrimary && <Header />}
        <Suspense fallback={<Loading />} children={<Comp />} />
      </main>
      <BottomBar />
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

import type { Component } from 'solid-js'
import { lazy, onMount } from 'solid-js'
import { Route, Routes } from '@solidjs/router'
import { setStore } from '@app/state/store'
import Container from '@app/components/Container'

const Home = lazy(() => import('@app/screen/Home'))
const Notification = lazy(() => import('@app/screen/Notification'))
// const Signin = lazy(() => import('@app/screen/Signin'))

const App: Component = () => {
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
  const locale = localStorage.getItem('locale')
  const darkMode = localStorage.getItem('darkMode')

  onMount(() => {
    document.documentElement.lang = locale === '1' ? 'en' : 'id'
    document.documentElement.classList[darkMode === 'true' ? 'add' : 'remove'](
      'dark'
    )

    colorScheme?.addEventListener?.('change', (e) => {
      setStore('darkMode', e.matches)
    })
  })

  return (
    <Routes>
      <Route path='/' component={() => <Container comp={Home} />} />
      <Route
        path='/notifikasi'
        component={() => <Container comp={Notification} />}
      />
      {/* <Route path='/signin' component={Signin} /> */}
    </Routes>
  )
}

export default App

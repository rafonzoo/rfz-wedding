import type { Component } from 'solid-js'
import { lazy, onMount } from 'solid-js'
import { Route, Routes } from '@solidjs/router'
import { setStore } from '@app/state/store'

const Home = lazy(() => import('@app/screen/Home'))
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

    if (colorScheme) {
      colorScheme.addEventListener('change', (e) => {
        setStore('darkMode', e.matches)
      })
    }
  })

  return (
    <Routes>
      <Route path='/' component={Home} />
      {/* <Route path='/signin' component={Signin} /> */}
    </Routes>
  )
}

export default App

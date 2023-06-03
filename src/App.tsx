import type { Component } from 'solid-js'
import { lazy, onMount } from 'solid-js'
import { polyfill } from 'smoothscroll-polyfill'
import { Route, Routes } from '@solidjs/router'
import { setStore } from '@app/state/store'
import { lazied } from '@app/helpers'
import { ROUTES } from '@app/config'
import Container from '@app/components/Container'

const App: Component = () => {
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
  const locale = localStorage.getItem('locale')
  const darkMode = localStorage.getItem('darkMode')

  onMount(() => {
    const html = document.documentElement

    html.lang = locale === '1' ? 'en' : 'id'
    html.classList.toggle('dark', darkMode === 'true')

    colorScheme?.addEventListener?.('change', (e) => {
      setStore('darkMode', e.matches)
    })

    // Polyfill
    polyfill()
  })

  return (
    <Routes>
      {ROUTES.map(({ path, directory, translation }) => (
        <Route
          path={path}
          component={() => (
            <Container
              isPrimary={!!translation}
              comp={lazy(() => lazied(directory))}
            />
          )}
        />
      ))}
      {/* <Route path='/signin' component={Signin} /> */}
    </Routes>
  )
}

export default App

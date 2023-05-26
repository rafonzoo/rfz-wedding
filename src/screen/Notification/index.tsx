import type { Component } from 'solid-js'
import { store } from '@app/state/store'
import { toggleDarkMode, toggleLocale } from '@app/state/action'
import Button from '@app/components/Button'

const Notification: Component = () => {
  return (
    <div class='fixed bottom-12 z-30 w-full p-4'>
      <Button class='text-sm' onclick={() => toggleDarkMode()}>
        Light: {!store.darkMode ? 'ON' : 'OFF'}
      </Button>
      <Button class='mt-2 text-sm' onclick={() => toggleLocale()}>
        {store.locale === 1 ? 'ke Bahasa' : 'To English'}
      </Button>
    </div>
  )
}

export default Notification

import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import { store } from '@app/state/store'
import { toggleDarkMode, toggleLocale } from '@app/state/action'
import Topbar from '@app/components/Navbar/Topbar'
import Button from '@app/components/Button'
import ButtonAddNew from '@app/screen/Home/AddNew'

const Homepage: Component = () => {
  const [showAddNewSheet, setShowAddNewSheet] = createSignal(false)

  return (
    <>
      <Topbar class='absolute right-0 top-0 h-12'>
        <ButtonAddNew show={showAddNewSheet} setShow={setShowAddNewSheet} />
      </Topbar>
      <div class='fixed bottom-12 z-30 mb-4 w-full px-4 env-pb-0'>
        <Button class='text-sm' onclick={() => toggleDarkMode()}>
          Light: {!store.darkMode ? 'ON' : 'OFF'}
        </Button>
        <Button class='mt-2 text-sm' onclick={() => toggleLocale()}>
          {store.locale === 1 ? 'ke Bahasa' : 'To English'}
        </Button>
      </div>
    </>
  )
}

export default Homepage

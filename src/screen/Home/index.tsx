import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import { store } from '@app/state/store'
import { toggleDarkMode, toggleLocale } from '@app/state/action'
import { text } from '@app/helpers/trans'
import Separator from '@app/components/Separator'
import Topbar from '@app/components/Navbar/Topbar'
import IconPersonCircle from '@app/components/Icon/PersonCircle'
import Container from '@app/components/Container'
import ButtonIcon from '@app/components/Button/Icon'
import Button from '@app/components/Button'
import AddNewSheet from '@app/screen/Home/AddNew'

const Homepage: Component = () => {
  const [showAddNewSheet, setShowAddNewSheet] = createSignal(false)

  return (
    <Container>
      <Topbar>
        <AddNewSheet show={showAddNewSheet} setShow={setShowAddNewSheet} />
      </Topbar>
      <div class='tc:px-8'>
        <div class='flex justify-between py-3 max-tc:px-4'>
          <div class='flex items-center'>
            <ButtonIcon
              class='mr-[10px] !rounded-full !text-gray-300 dark:!text-gray-700 tc:hidden'
              icon={<IconPersonCircle size={34} label='Buka panel profil' />}
            />
            <h2 class='text-hero font-bold -tracking-hero'>
              {text('undanganku')}
            </h2>
          </div>
        </div>
        <Separator />
      </div>
      <div class='fixed bottom-0 z-30 w-full p-4'>
        <Button class='text-sm' onclick={() => toggleDarkMode()}>
          Light: {!store.darkMode ? 'ON' : 'OFF'}
        </Button>
        <Button class='mt-2 text-sm' onclick={() => toggleLocale()}>
          {store.locale === 1 ? 'ke Bahasa' : 'To English'}
        </Button>
      </div>
    </Container>
  )
}

export default Homepage

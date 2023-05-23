import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import { store } from '@app/state/store'
import { toggleDarkMode, toggleLocale } from '@app/state/action'
import { text } from '@app/helpers/trans'
import Separator from '@app/components/Separator'
import IconPerson from '@app/components/Icon/Person'
import Container from '@app/components/Container'
import ButtonIcon from '@app/components/Button/Icon'
import Button from '@app/components/Button'
import AddNewSheet from '@app/screen/Home/AddNew'

const Homepage: Component = () => {
  const [showAddNewSheet, setShowAddNewSheet] = createSignal(false)

  return (
    <Container>
      <nav class='flex items-center justify-between'>
        <div class='ml-auto flex h-14 w-14 items-center justify-center'>
          <AddNewSheet show={showAddNewSheet} setShow={setShowAddNewSheet} />
        </div>
      </nav>
      <div class='flex justify-between px-4 pb-3 pt-3'>
        <div class='flex items-center'>
          <ButtonIcon
            class='!rounded-full !text-gray-300 dark:!text-gray-700'
            icon={<IconPerson size={36} label='Buka panel profil' />}
          />
          <h1 class='ml-[10px] text-hero font-bold -tracking-hero'>
            {text('undanganku')}
          </h1>
        </div>
      </div>
      <Separator />

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

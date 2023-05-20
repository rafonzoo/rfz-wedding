import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import { store } from '@app/state/store'
import { toggleDarkMode, toggleLocale } from '@app/state/action'
import { text } from '@app/helpers/trans'
import Separator from '@app/components/Separator'
import IconPlus from '@app/components/Icon/Plus'
import IconPerson from '@app/components/Icon/Person'
import Container from '@app/components/Container'
import ButtonIcon from '@app/components/Button/Icon'
import Button from '@app/components/Button'
import AddNewSheet from '@app/screen/Home/AddNew'

const Homepage: Component = () => {
  const [showAddNewSheet, setShowAddNewSheet] = createSignal(false)

  let addNewButtonRef: HTMLButtonElement | undefined

  return (
    <Container>
      <nav class='flex items-center justify-between'>
        <div class='flex h-14 w-14 items-center justify-center'>
          <ButtonIcon
            ref={addNewButtonRef}
            class='px-1 py-1'
            icon={<IconPlus />}
            label='Tambah undangan'
            onclick={() => setShowAddNewSheet(true)}
          />
        </div>
      </nav>
      <div class='flex justify-between px-4 pb-3 pt-3'>
        <div class='flex items-center'>
          <ButtonIcon
            class='!text-gray-300 dark:!text-gray-700 rounded-full'
            label='Buka panel profil'
            icon={<IconPerson size={36} />}
          />
          <h1 class='ml-[10px] text-hero font-bold -tracking-hero'>
            {text('undanganku')}
          </h1>
        </div>
      </div>
      <Separator />
      <AddNewSheet
        show={showAddNewSheet}
        setShow={setShowAddNewSheet}
        element={addNewButtonRef}
      />
      <div class='fixed w-full z-30 p-4 bottom-0'>
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

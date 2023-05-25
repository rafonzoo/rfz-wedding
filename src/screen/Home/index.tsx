import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import { store } from '@app/state/store'
import { toggleDarkMode, toggleLocale } from '@app/state/action'
import { text } from '@app/helpers/trans'
import clsx from 'clsx'
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
      <div class={styles.header_outer}>
        <div class={styles.header_inner}>
          <div class={styles.header_wrapper}>
            <ButtonIcon
              class={styles.header_profile}
              icon={<IconPersonCircle size={34} />}
            />
            <h2 class={styles.header_title}>{text('undanganku')}</h2>
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

const styles = {
  header_outer: clsx('tc:px-8'),
  header_inner: clsx('flex justify-between py-3 max-tc:px-4'),
  header_wrapper: clsx('flex items-center'),
  header_title: clsx('text-hero font-bold -tracking-hero'),
  header_profile: clsx(
    'mr-[10px] !rounded-full !text-gray-300 dark:!text-gray-700 tc:hidden'
  ),
}

export default Homepage

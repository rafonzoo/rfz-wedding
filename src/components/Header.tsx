import type { Component } from 'solid-js'
import { currentPage, text } from '@app/helpers'
import clsx from 'clsx'
import Separator from '@app/components/Separator'
import IconPersonCircle from '@app/components/Icon/Circle/Person'
import ButtonIcon from '@app/components/Button/Icon'

const Header: Component = () => {
  const { hasProfile, translation } = currentPage()

  return !translation ? null : (
    <header class={styles.header_outer}>
      <div class={styles.header_inner}>
        <div class={styles.header_wrapper}>
          {hasProfile && (
            <ButtonIcon
              class={styles.header_profile}
              icon={<IconPersonCircle class={styles.header_icon} size={34} />}
            />
          )}
          <h2 class={styles.header_title}>{text(translation)}</h2>
        </div>
      </div>
      <Separator />
    </header>
  )
}

const styles = {
  header_outer: clsx('bg-white pt-12 dark:bg-black tc:px-8'),
  header_inner: clsx('flex justify-between pb-2 pt-1.5 max-tc:px-4 tc:py-3'),
  header_wrapper: clsx('flex items-center'),
  header_icon: clsx('!text-gray-300 dark:!text-gray-700'),
  header_title: clsx('text-hero font-bold -tracking-hero'),
  header_profile: clsx('mr-[10px] !rounded-full tc:hidden'),
}

export default Header

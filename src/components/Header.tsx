import type { Children, iNavbar } from '@app/types'
import { text } from '@app/helpers/trans'
import { routes } from '@app/config/const'
import clsx from 'clsx'
import Separator from './Separator'
import IconPersonCircle from './Icon/PersonCircle'
import ButtonIcon from './Button/Icon'

const Header: Children<iNavbar> = ({ path: pathname }) => {
  function setTitle() {
    const path = routes.find((route) => pathname === route.path)
    return path?.name ? text(path.name) : 'Unknown'
  }

  return (
    <header class={styles.header_outer}>
      <div class={styles.header_inner}>
        <div class={styles.header_wrapper}>
          <ButtonIcon
            class={styles.header_profile}
            icon={<IconPersonCircle class={styles.header_icon} size={34} />}
          />
          <h2 class={styles.header_title}>{setTitle()}</h2>
        </div>
      </div>
      <Separator />
    </header>
  )
}

const styles = {
  header_outer: clsx('pt-12 tc:px-8'),
  header_inner: clsx('flex justify-between pb-3 max-tc:px-4 tc:py-3'),
  header_wrapper: clsx('flex items-center'),
  header_icon: clsx('!text-gray-300 dark:!text-gray-700'),
  header_title: clsx('text-hero font-bold -tracking-hero'),
  header_profile: clsx('mr-[10px] !rounded-full tc:hidden'),
}

export default Header

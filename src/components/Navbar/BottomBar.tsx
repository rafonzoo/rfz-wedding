import type { ForwardRef, iNavbar } from '@app/types'
import { For } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { text } from '@app/helpers/trans'
import { routes } from '@app/config/const'
import clsx from 'clsx'
import ButtonBase from '@app/components/Button/Base'

const BottomBar: ForwardRef<'nav', iNavbar> = ({ path, ...props }) => {
  const navigate = useNavigate()

  return (
    <nav {...props} class={clsx(styles.nav, props.class)}>
      <ul role='list' class={styles.ul}>
        <For each={routes}>
          {(item) => (
            <li role='listitem' class={styles.li}>
              <ButtonBase
                onclick={() => navigate(item.path)}
                class={clsx(styles.a, path === item.path && styles.a_active)}
              >
                <span
                  class={clsx(
                    styles.a_icon,
                    path === item.path && styles.a_icon_active
                  )}
                />
                <span class={styles.a_text}>{text(item.name)}</span>
              </ButtonBase>
            </li>
          )}
        </For>
      </ul>
    </nav>
  )
}

const styles = {
  nav: clsx(
    'env-b-2px fixed bottom-0 left-0 right-0 flex items-center px-4',
    'bg-gray-100 env-pb-0 dark:bg-gray-900 tc:hidden'
  ),
  ul: clsx('flex w-full'),
  li: clsx('flex w-full justify-center'),
  a_text: clsx('mx-auto text-small font-medium tracking-base'),
  a_icon_active: clsx('!bg-primary dark:!bg-primary-dark'),
  a_icon: clsx('mx-auto h-7 w-7 rounded bg-gray-500 dark:bg-gray-500'),
  a_active: clsx('!text-primary dark:!text-primary-dark'),
  a: clsx(
    'flex h-12 w-full select-none flex-col items-center justify-center !rounded-none text-gray-600',
    'active-visible:!shadow-none active:bg-gray-200 dark:text-gray-400 dark:active:bg-gray-800'
  ),
}

export default BottomBar

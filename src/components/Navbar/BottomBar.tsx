import type { ForwardRef } from '@app/types'
import { For } from 'solid-js'
import { useLocation } from '@solidjs/router'
import { createHook, text } from '@app/helpers'
import { ROUTES_NAVIGATION } from '@app/config'
import clsx from 'clsx'
import ButtonBase from '@app/components/Button/Base'

const BottomBar: ForwardRef<'nav'> = (props) => {
  const { pathname: path } = useLocation()
  const { screen } = createHook()

  return (
    <nav {...props} class={clsx(styles.nav, props.class)}>
      <ul role='list' class={styles.ul}>
        <For each={ROUTES_NAVIGATION}>
          {({ child, ...item }) => (
            <li role='listitem' class={styles.li}>
              <ButtonBase
                onclick={() => screen({ name: item.alias })}
                class={clsx(
                  styles.a,
                  (path === item.path || child.some((c) => c === path)) &&
                    styles.a_active
                )}
              >
                <span
                  class={clsx(
                    styles.a_icon,
                    (path === item.path || child.some((c) => c === path)) &&
                      styles.a_icon_active
                  )}
                />
                <span class={styles.a_text}>{text(item.translation)}</span>
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

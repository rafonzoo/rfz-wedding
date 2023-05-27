import type { ForwardRef } from '@app/types'
import { For } from 'solid-js'
import { A, useLocation } from '@solidjs/router'
import { text } from '@app/helpers'
import { ROUTES_NAVIGATION } from '@app/config'
import clsx from 'clsx'
import Topbar from '@app/components/Navbar/Topbar'

const Sidebar: ForwardRef<'aside'> = (props) => {
  const { pathname: path } = useLocation()

  return (
    <aside {...props} class={clsx(styles.aside, props.class)}>
      <Topbar position='relative' />
      <div class={styles.aside_header}>
        <h1 class={styles.aside_title}>Mantu</h1>
      </div>
      <nav class={styles.list}>
        <ul role='list' class={styles.list_ul}>
          <For each={ROUTES_NAVIGATION}>
            {({ child, ...item }) => (
              <li role='listitem' class={styles.list_li}>
                <A
                  href={item.path}
                  class={clsx(styles.list_a, {
                    [styles.list_a_active]:
                      path === item.path || child.some((c) => c === path),
                  })}
                >
                  <span
                    class={clsx(styles.list_span, {
                      [styles.list_span_active]:
                        path === item.path || child.some((c) => c === path),
                    })}
                  />
                  <span>{text(item.translation)}</span>
                </A>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </aside>
  )
}

const styles = {
  aside: clsx(
    'flex h-screen min-h-[320px] w-[290px] flex-col max-tc:hidden',
    'bg-gray-100 dark:bg-gray-900'
  ),
  aside_header: clsx('flex items-center px-6 pb-3 tc:py-3'),
  aside_title: clsx('text-hero font-bold -tracking-hero'),

  list: clsx('h-full flex-1 px-4'),
  list_ul: 'space-y-1',
  list_li: clsx('flex items-center'),
  list_span_active: '!bg-primary-dark',
  list_span: clsx(
    'mr-2 block h-6 w-6 rounded-md bg-primary dark:bg-primary-dark'
  ),
  list_a_active: clsx('!bg-primary text-white'),
  list_a: clsx(
    'flex w-full items-center rounded-md px-1.5 py-2',
    'hover:bg-gray-200 hover:dark:bg-gray-800'
  ),
}

export default Sidebar

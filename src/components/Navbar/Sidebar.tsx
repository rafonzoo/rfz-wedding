import type { Component } from 'solid-js'
import type { ForwardRef, iNavbar } from '@app/types'
import { For } from 'solid-js'
import { A } from '@solidjs/router'
import { text } from '@app/helpers/trans'
import { routes } from '@app/config/const'
import clsx from 'clsx'
import Topbar from '@app/components/Navbar/Topbar'

const List: Component<iNavbar> = ({ path }) => {
  return (
    <ul role='list' class={styles.list_ul}>
      <For each={routes}>
        {(item) => (
          <li role='listitem' class={styles.list_li}>
            <A
              href={item.path}
              class={clsx(styles.list_a, {
                [styles.list_a_active]: path === item.path,
              })}
            >
              <span
                class={clsx(styles.list_span, {
                  [styles.list_span_active]: path === item.path,
                })}
              />
              <span>{text(item.name)}</span>
            </A>
          </li>
        )}
      </For>
    </ul>
  )
}

const Sidebar: ForwardRef<'aside', iNavbar> = ({ path, ...props }) => {
  return (
    <aside {...props} class={clsx(styles.aside, props.class)}>
      <Topbar />
      <div class={styles.aside_header}>
        <h1 class={styles.aside_title}>Mantu</h1>
      </div>
      <nav class={styles.list}>
        <List path={path} />
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

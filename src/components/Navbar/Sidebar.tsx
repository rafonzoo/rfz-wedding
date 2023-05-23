import type { Component } from 'solid-js'
import type { Callable, ForwardRef } from '@app/types'
import { createSignal, For } from 'solid-js'
import { A } from '@solidjs/router'
import { callable, classList } from '@app/helpers/util'
import Topbar from '@app/components/Navbar/Topbar'

interface iSidebar {
  items: Callable<string[]>
}

const List: Component<iSidebar> = ({ items }) => {
  const [currentNav, setCurrentNav] = createSignal('Undanganku')

  return (
    <ul role='list'>
      <For each={callable(items)}>
        {(item, index) => (
          <li role='listitem' class='flex items-center'>
            <A
              href='/'
              onclick={() => setCurrentNav(item)}
              class='flex w-full items-center rounded-md px-1.5 py-2 transition-colors hover:bg-gray-200 hover:dark:bg-gray-800'
              classList={{
                '!bg-blue-600 text-white': currentNav() === item,
                'mt-1': index() > 0,
              }}
            >
              <span
                class='mr-2 block h-6 w-6 rounded-md bg-blue-600 transition-colors dark:bg-blue-400'
                classList={{
                  '!bg-blue-400': currentNav() === item,
                }}
              />
              <span>{item}</span>
            </A>
          </li>
        )}
      </For>
    </ul>
  )
}

const Sidebar: ForwardRef<'aside', iSidebar> = ({ items, ...props }) => {
  return (
    <aside
      {...props}
      class='flex h-screen min-h-[320px] w-[250px] flex-col bg-gray-100 dark:bg-gray-900 max-tc:hidden lg:w-[290px] xl:w-[320px]'
      classList={{ ...classList(props) }}
      style={{
        'margin-left': 'max(env(safe-area-inset-left))',
        'margin-right': 'max(env(safe-area-inset-right))',
      }}
    >
      <Topbar />
      <div class='flex items-center px-6 py-3'>
        <h1 class='text-hero font-bold -tracking-hero'>Mantu</h1>
      </div>
      <div class='h-full flex-1 px-4'>
        <List items={items} />
      </div>
    </aside>
  )
}

export default Sidebar

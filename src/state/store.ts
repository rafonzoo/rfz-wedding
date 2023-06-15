import { createStore } from 'solid-js/store'

const locale = localStorage.getItem('locale')
const darkMode = localStorage.getItem('darkMode')

interface AppStore {
  darkMode: boolean
  overlay: boolean
  locale: number // 0: Indonesia, 1: English
  session: /* AuthSession */ null
}

export const [store, setStore] = createStore<AppStore>({
  session: null,
  overlay: false,
  locale: locale === null ? 0 : locale === '0' ? 0 : 1,
  // darkMode: matchMedia('(prefers-color-scheme: dark)').matches || false,
  darkMode: darkMode === 'true' ? true : false,
})

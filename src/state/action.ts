import { setStore } from '@app/state/store'

// export function getUserMeta(key: 'avatar_url' | 'picture' | 'full_name') {
//   return createMemo(() => unwrap(store.session?.user.user_metadata[key]))()
// }

export function toggleDarkMode() {
  let isDarkMode = false

  setStore('darkMode', (prev) => (isDarkMode = !prev) && !prev)

  localStorage.setItem('darkMode', isDarkMode + '')
  document.documentElement.classList[isDarkMode ? 'add' : 'remove']('dark')
}

export function toggleLocale() {
  let locale = 0

  setStore('locale', (prev) => {
    const now = prev === 0 ? 1 : 0

    return (locale = now) && now
  })

  document.documentElement.lang = locale === 0 ? 'id' : 'en'
  localStorage.setItem('locale', locale + '')
}

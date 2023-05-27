export const ROUTES = [
  {
    path: '/',
    alias: 'home',
    directory: 'Home',
    translation: 'undanganku',
    background: null,
    hasProfile: true,
    child: ['/editor'],
  },
  {
    path: '/notifikasi',
    alias: 'notifikasi',
    directory: 'Notification',
    translation: 'notifikasi',
    background: null,
    hasProfile: false,
    child: [],
  },
  {
    path: '/editor',
    alias: 'editor',
    directory: 'Editor',
    translation: null,
    background: null,
    hasProfile: false,
    child: [],
  },
] as const

export const ROUTES_NAME = ROUTES.map(({ alias }) => alias)

export const ROUTES_NAVIGATION = ROUTES
  // Flattern Technique
  .map((route) => (!route.translation ? [] : [{ ...route }]))
  .flat()

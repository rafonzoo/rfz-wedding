// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type Messages = typeof import('./locale/en.json');

declare interface IntlMessages extends Messages {}

import { store } from '@app/state/store'
import dictionary from '@app/locale/dictionary.json'
import definition from '@app/locale/definition.json'

const translation = { ...definition, ...dictionary }

export function text(key: keyof typeof translation) {
  return translation[key][store.locale] ?? translation[key][0]
}

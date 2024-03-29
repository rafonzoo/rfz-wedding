import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./${locale}.json`)).default,
  timeZone: 'Asia/Jakarta',
}))

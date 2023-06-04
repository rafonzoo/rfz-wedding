import { render } from 'solid-js/web'
import { default as localeData } from 'dayjs/plugin/localeData'
import { default as dayjs } from 'dayjs'
import { Router } from '@solidjs/router'
import App from '@app/App'

import '@app/style.css'
import 'dayjs/locale/id'

dayjs.extend(localeData)
dayjs.locale('id')

render(
  () => <Router children={<App />} />,
  document.getElementById('root') as HTMLElement
)

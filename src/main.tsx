import { render } from 'solid-js/web'
// import { default as localeData } from 'dayjs/plugin/localeData'
// import { default as customParseFormat } from 'dayjs/plugin/customParseFormat'
import { Router } from '@solidjs/router'
import App from '@app/App'
// import dayjs from 'dayjs'
import '@app/style.css'

// dayjs.extend(localeData)
// dayjs.extend(customParseFormat)

render(
  () => <Router children={<App />} />,
  document.getElementById('root') as HTMLElement
)

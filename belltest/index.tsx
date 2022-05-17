import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import 'ress' // ress.cssをインポート
import './scss/app.scss'
import { sentryInit } from './config/sentry'
import { CookiesProvider } from 'react-cookie'

sentryInit()

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

const { REACT_APP_SENTRY_DSN, NODE_ENV } = process.env

export function sentryInit() {
  // 開発環境以外のUnhandledErrorをSentry,Slackに通知
  if (NODE_ENV !== 'development') {
    Sentry.init({
      dsn: REACT_APP_SENTRY_DSN,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: NODE_ENV,
    })
  }
}

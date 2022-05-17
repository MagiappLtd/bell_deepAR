import { useState, useEffect } from 'react'
import { detect } from 'detect-browser'
import { isIOS } from '../libs'

export default function useBrowserSupported() {
  const [isBrowserSupported, setIsBrowserSupported] = useState<boolean>(true)

  useEffect(() => {
    const browser = detect()

    // TODO: breakなしでも動くようにFallthroughの設定
    if (!browser) {
      return
    }

    switch (true) {
      case isIOS():
        if (!/ios|safari/.test(browser.name)) {
          return setIsBrowserSupported(false)
        }
        break
      case browser.os === 'Android OS':
        if (browser.name !== 'chrome') {
          return setIsBrowserSupported(false)
        }
        break
      // PCの場合
      default: {
        const pcBrowsersSupported = ['chrome', 'safari', 'firefox', 'edge']
        if (!pcBrowsersSupported.includes(browser.name)) {
          return setIsBrowserSupported(false)
        }
      }
    }
  }, [])

  return isBrowserSupported
}

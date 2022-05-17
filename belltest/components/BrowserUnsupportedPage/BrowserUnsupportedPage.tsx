import React from 'react'
import styles from './BrowserUnsupportedPage.module.scss'

export default function BrowserUnsupportedModal() {
  return (
    <div className={styles.browserUnsupportedPage}>
      <h2 className={styles.title}>
        このブラウザは
        <br />
        サポートされておりません。
      </h2>
      <div className={styles.description}>
        以下のブラウザに切り替えて
        <br />
        このページを開けてください。
      </div>
      <div className={styles.browsersList}>
        <div>
          <h3>PCの場合：</h3>
          <p>・Google Chrome (安定版の最新2バージョン)</p>
          <p>・Firefox (安定版の最新2バージョン)</p>
          <p>・Safari (安定版の最新2バージョン)</p>
          <p>・Microsoft Edge (安定版の最新2バージョン)</p>
        </div>
        <div>
          <h3>Andriodの場合：</h3>

          <p>・Google Chrome (安定版の最新2バージョン)</p>
        </div>
        <div>
          <h3>iOSの場合：</h3>

          <p>・Safari (安定版の最新2バージョン)</p>
        </div>
      </div>
    </div>
  )
}

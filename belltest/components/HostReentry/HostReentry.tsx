import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

import styles from './HostReentry.module.scss'
import { hostDisconnectedCookieState } from '../../states/atoms'

export default function HostReentry() {
  const [displaying, setDisplaying] = useState<boolean>(false)
  const hostDisconnectedCookie = useRecoilValue(hostDisconnectedCookieState)

  useEffect(() => {
    if (hostDisconnectedCookie) {
      setDisplaying(true)
      setTimeout(() => setDisplaying(false), 5000)
    }
  }, [hostDisconnectedCookie])

  return (
    <div className={`${styles.wrap} ${displaying ? '' : styles.close}`}>
      <p>接客員が再入室しました。</p>
    </div>
  )
}

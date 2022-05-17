import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

import styles from './RecordingAttention.module.scss'
import { canEnterState } from '../../states/atoms'

export default function RecordingAttention() {
  const [displaying, setDisplaying] = useState<boolean>(false)
  const canEnter = useRecoilValue(canEnterState)

  useEffect(() => {
    if (canEnter) {
      setDisplaying(true)
      setTimeout(() => setDisplaying(false), 5000)
    }
  }, [canEnter])

  return (
    <div className={`${styles.wrap} ${displaying ? '' : styles.close}`}>
      <p>応対品質向上のため録画録音をさせていただきます。</p>
    </div>
  )
}

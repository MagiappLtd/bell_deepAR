import { useEffect, useState } from 'react'
import styles from './VideoDisabled.module.scss'

type Props = {
  displayText: string
}

//ビデオ非表示時の注意文言表示
export default function VideoDisabled({ displayText }: Props) {
  const [displaying, setDisplaying] = useState<boolean>(false)

  useEffect(() => {
    setDisplaying(true)
    setTimeout(() => setDisplaying(false), 5000)
  }, [])

  return (
    <div className={`${styles.wrap} ${displaying ? '' : styles.close}`}>
      <p>{displayText}</p>
    </div>
  )
}

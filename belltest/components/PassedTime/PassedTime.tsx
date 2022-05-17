import { useRecoilValue } from 'recoil'
import { passedSecondsState } from '../../states/atoms'

// import styles from './PassedTime.module.scss'

export default function PassedTime() {
  const passedSeconds = useRecoilValue(passedSecondsState)

  // 経過時間をmm:ssにフォーマット（ex: 1:06）
  function formattedTime() {
    const minutes = Math.floor(passedSeconds / 60)
    const seconds = passedSeconds % 60

    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
  }

  return <p>{formattedTime()}</p>
}

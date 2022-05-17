// import styles from './AudioButton.module.scss'
import { useRecoilValue } from 'recoil'
import mic from '../../images/mic.png'
import micOff from '../../images/mic-off.png'
import { audioState } from '../../states/atoms'

type Props = {
  onClick: () => void
}

export default function AudioButton({ onClick }: Props) {
  const audio = useRecoilValue(audioState)
  return (
    <button type="button" onClick={onClick}>
      {audio ? (
        <img src={mic} alt="マイクオン" />
      ) : (
        <img src={micOff} alt="マイクオフ" />
      )}
    </button>
  )
}

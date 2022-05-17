import { useRecoilState } from 'recoil'
import filmIcon from '../../images/film.png'
import { displayingSubVideoState } from '../../states/atoms'

import styles from './DisplaySubVideoButton.module.scss'

export default function DisplaySubVideoButton() {
  const [displayingSubVideo, setDisplayingSubVideo] = useRecoilState(
    displayingSubVideoState
  )

  return (
    <button
      type="button"
      className={displayingSubVideo ? '' : styles.gray}
      onClick={() => setDisplayingSubVideo((prev) => !prev)}
    >
      <img src={filmIcon} alt="カメラオン" />
    </button>
  )
}

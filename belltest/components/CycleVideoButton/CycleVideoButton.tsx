import { useContext } from 'react'

// import styles from './CycleVideoButton.module.scss'
import toggleButton from '../../images/reflesh.png'
import { switchCamera } from '../../libs'
import { PublisherObjContext } from '../../states/MainContextProvider'

export default function ShareScreenButton() {
  const { publisherObj } = useContext(PublisherObjContext)
  return (
    <div>
      <button type="button" onClick={() => switchCamera(publisherObj!)}>
        <img src={toggleButton} alt="カメラ切り替え" />
      </button>
    </div>
  )
}

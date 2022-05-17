// import styles from './ZoomButton.module.scss'

import {
  replaceMainVideo,
  isPublisherMainVideo,
  removeMainVideo,
} from '../../libs/index'

import zoomIn from '../../images/zoom-in.png'
import zoomOut from '../../images/zoom-out.png'
import { useContext } from 'react'
import {
  MainVideoObjContext,
  PublisherObjContext,
} from '../../states/MainContextProvider'

export default function ZoomButton() {
  const { publisherObj } = useContext(PublisherObjContext)
  const { mainVideoObj, setMainVideoObj } = useContext(MainVideoObjContext)
  // このsubscriberをメインビデオに置き換え
  function replacePublisherVideoToMain(): void {
    replaceMainVideo(mainVideoObj, publisherObj!)
    setMainVideoObj(publisherObj)
  }

  // 自分を小さく表示
  function zoomInMe() {
    if (mainVideoObj) {
      // メインビデオがあれば削除
      removeMainVideo(mainVideoObj)
      setMainVideoObj(null)
    }
  }

  return (
    <>
      {isPublisherMainVideo(publisherObj, mainVideoObj) ? (
        <button onClick={zoomInMe}>
          <img src={zoomIn} alt="ズームイン" />
        </button>
      ) : (
        <button onClick={replacePublisherVideoToMain}>
          <img src={zoomOut} alt="ズームアウト" />
        </button>
      )}
    </>
  )
}

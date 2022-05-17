import { useState } from 'react'
import { useSetRecoilState } from 'recoil'
import SettingModal from '../SettingModal/SettingModal'

import styles from './SettingButtonSP.module.scss'

import settingSP from '../../images/info.png'
import gearIcon from '../../images/setting.png'
import zoomOut from '../../images/zoom-out.png'
import zoomIn from '../../images/zoom-in.png'
import {
  replaceMainVideo,
  removeMainVideo,
  isPublisherMainVideo,
} from '../../libs'
import { useContext } from 'react'
import {
  MainVideoObjContext,
  PublisherObjContext,
} from '../../states/MainContextProvider'
import { showModalState } from '../../states/atoms'

export default function SettingButtonSP() {
  const [showSmallModal, setShowSmallModal] = useState<boolean>(false)

  const { publisherObj } = useContext(PublisherObjContext)
  const { mainVideoObj, setMainVideoObj } = useContext(MainVideoObjContext)

  const setShowModal = useSetRecoilState(showModalState)

  function zoomInMe() {
    if (mainVideoObj) {
      // メインビデオがあれば削除
      removeMainVideo(mainVideoObj)
      setMainVideoObj(null)
    }

    setShowSmallModal(false)
  }

  function zoomOutMe() {
    replaceMainVideo(mainVideoObj, publisherObj!)
    setMainVideoObj(publisherObj)
    setShowSmallModal(false)
  }

  function openSettingModal() {
    setShowSmallModal(false)
    setShowModal(true)
  }

  return (
    <div className={styles.relative}>
      <button type="button" onClick={() => setShowSmallModal(!showSmallModal)}>
        <img src={settingSP} alt="スマホ用設定ボタン" />
      </button>

      {showSmallModal && (
        <div className={styles.smallSettingModal}>
          {isPublisherMainVideo(publisherObj, mainVideoObj) ? (
            <button type="button" className={styles.flexBtn} onClick={zoomInMe}>
              <img src={zoomIn} alt="自分を小さく表示ボタン" />
              <p>自分を小さく表示</p>
            </button>
          ) : (
            <button
              type="button"
              className={styles.flexBtn}
              onClick={zoomOutMe}
            >
              <img src={zoomOut} alt="自分を大きく表示ボタン" />
              <p>自分を大きく表示</p>
            </button>
          )}

          <button
            type="button"
            className={styles.flexBtn}
            onClick={openSettingModal}
          >
            <img src={gearIcon} alt="デバイス設定ボタン" />
            <p>設定</p>
          </button>
        </div>
      )}

      {publisherObj && <SettingModal />}
    </div>
  )
}

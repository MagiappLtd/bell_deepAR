import { useContext, useEffect, useState } from 'react'
import Modal from 'react-modal'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import PrevSettingDevices from '../PrevSettingDevices/PrevSettingDevices'
import enterRoom from '../../images/zoom-in_white.png'
import styles from './PreparationForEnter.module.scss'
import {
  isPreviewLoadedState,
  isReadyForEnterState,
  roomInfoState,
} from '../../states/atoms'
import { isStaff } from '../../enums/UserType'
import { PreviewPublisherObjContext } from '../../states/PreviewContextProvicer'
import bellLogo from '../../images/logo_white.png'
import { isOverInnerHeight } from '../../libs'

Modal.setAppElement('#root') // アプリのルートを指定する必要

export default function PreparationForEnter() {
  const { previewPublisherObj } = useContext(PreviewPublisherObjContext)
  const [openModal, setOpenModal] = useState<boolean>(true)
  const setIsReadyForEnter = useSetRecoilState(isReadyForEnterState)
  const roomInfo = useRecoilValue(roomInfoState)
  const [isPreviewLoaded, setIsPreviewLoaded] =
    useRecoilState(isPreviewLoadedState)
  const [modalElement, setModalElement] = useState<HTMLDivElement>()

  // スタッフはビデオを読み込まないので、初期値をtrueにする
  useEffect(() => {
    setIsPreviewLoaded(isStaff(roomInfo!.userType))
  }, [])

  return (
    <>
      <header className={styles.header}>
        <h1>
          <img src={bellLogo} alt="Bellロゴ" />
        </h1>
      </header>

      <Modal
        ariaHideApp={true}
        isOpen={openModal}
        className={`${styles.modal} ${
          modalElement && isOverInnerHeight(modalElement) && styles.topZero
        }`}
        overlayClassName={styles.modalOverlay}
        contentRef={(elm) => setModalElement(elm)}
      >
        <section className={styles.preparationForEnter}>
          <div className={styles.setting}>
            {isStaff(roomInfo!.userType) ? (
              <p className="text-center">
                スタッフ用入室画面です。音声,ビデオは自動でオフになります。
              </p>
            ) : (
              <>
                <div className={styles.message}>
                  <p>「入室する」ボタンを押して</p>
                  <p>通話を開始してください。</p>
                </div>
                <PrevSettingDevices />
              </>
            )}
          </div>

          <div className={styles.buttons}>
            <button
              type="button"
              className={`bell-button ${styles.button}`}
              onClick={() => {
                previewPublisherObj?.destroy()
                setIsReadyForEnter(true)
              }}
              disabled={!isPreviewLoaded}
            >
              <img src={enterRoom} alt="入室" />
              入室する
            </button>

            <button
              type="button"
              className={styles.button}
              onClick={() => setOpenModal(false)}
            >
              キャンセル
            </button>
          </div>
        </section>
      </Modal>
    </>
  )
}

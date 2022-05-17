import { useContext, useState } from 'react'
import { useRecoilValue } from 'recoil'
import Modal from 'react-modal'

import { isHost } from '../../enums/UserType'
import leaveBtn from '../../images/log-out_white.png'
import { PublisherObjContext } from '../../states/MainContextProvider'
import styles from './LeaveButton.module.scss'
import { saveRecord, uploadRecordsToS3 } from '../../libs/request'
import { roomInfoState } from '../../states/atoms'
import { leaveFromSession } from '../../libs'
import { FORCE_ALL_LEAVING } from '../../enums/SignalEventType'

Modal.setAppElement('#root') // アプリのルートを指定する必要

export default function LeaveButton() {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [disabled, setDisabled] = useState<boolean>(false)
  const { publisherObj } = useContext(PublisherObjContext)
  const roomInfo = useRecoilValue(roomInfoState)

  async function saveAndUploadRecord() {
    try {
      await saveRecord(roomInfo!.name)
      await uploadRecordsToS3()
    } catch {
      alert(
        `録画データの保存に失敗しました。\nシステム管理者に問い合わせてください。`
      )
    }
  }

  async function leaveRoom() {
    setDisabled(true)

    // ホストが退出した場合は全参加者を退出させ、これまでの通話記録を保存
    if (isHost(roomInfo!.userType)) {
      await saveAndUploadRecord()

      // 全員に対して強制退出イベントを送信(自分含む)
      return publisherObj!.session.signal(
        {
          type: FORCE_ALL_LEAVING,
        },
        (e) => {
          if (e) {
            setDisabled(false)
            throw new Error(`強制退出処理でエラー発生: ${e.name}`)
          }
        }
      )
    }

    // 通常の退出処理
    leaveFromSession(publisherObj!, roomInfo!.userType)
  }

  return (
    <>
      <button
        type="button"
        className={styles.leaveBtn}
        onClick={() => setShowModal(true)}
      >
        <img src={leaveBtn} alt="退出する" />
      </button>

      <Modal
        ariaHideApp={true}
        isOpen={showModal}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
      >
        <section className={styles.innerModal}>
          <p>
            本当に退出しますか？
            {isHost(roomInfo!.userType) && (
              <>
                <br />
                <strong>※ホスト,スタッフ含む全参加者が退出します。</strong>
              </>
            )}
          </p>

          <button
            type="button"
            className={`bell-button py-16 ${styles.leave} ${
              disabled ? styles.disabled : ''
            }`}
            onClick={leaveRoom}
            disabled={disabled}
          >
            <img src={leaveBtn} alt="退出する" />
            退出する
          </button>

          <button
            type="button"
            className={`py-16 ${styles.cancel}`}
            onClick={() => setShowModal(false)}
          >
            キャンセル
          </button>
        </section>
      </Modal>
    </>
  )
}
